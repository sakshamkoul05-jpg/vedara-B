import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { config } from '../config';
import { JwtPayload } from '../types';
import { whatsappService } from '../services/whatsapp.service';
import { logger } from '../utils/logger';

const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token as string, config.jwt.secret) as JwtPayload;
      (socket as any).user = decoded;
    } catch {
      // Token invalid — user stays unauthenticated
    }
  }
  next();
};

const requireAuth = (socket: Socket, allowedRoles: string[]): boolean => {
  const user = (socket as any).user;
  if (!user) {
    socket.emit('error', { message: 'Authentication required.' });
    return false;
  }
  if (!allowedRoles.includes(user.role)) {
    socket.emit('error', { message: 'Insufficient permissions.' });
    return false;
  }
  return true;
};

export function setupSocket(io: Server) {
  io.use(authenticateSocket);

  io.on('connection', (socket: Socket) => {
    logger.info('Client connected', { socketId: socket.id });

    socket.on('join:kitchen', () => {
      if (!requireAuth(socket, ['SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST'])) return;
      socket.join('kitchen');
    });

    socket.on('join:admin', () => {
      if (!requireAuth(socket, ['SUPER_ADMIN', 'MANAGER', 'ADMIN'])) return;
      socket.join('admin');
    });

    socket.on('chat:request', async (data: { name: string; email?: string; phone?: string }) => {
      try {
        const sanitizedName = data.name.replace(/[<>]/g, '').trim();
        const conversation = await prisma.chatConversation.create({
          data: {
            guestName: sanitizedName,
            guestEmail: data.email?.toLowerCase().trim(),
            guestPhone: data.phone?.replace(/[^\d+]/g, ''),
            socketId: socket.id,
          },
        });
        const botMsg = await prisma.chatMessage.create({
          data: {
            conversationId: conversation.id,
            senderType: 'ADMIN',
            senderName: 'System',
            content: 'Connected to live support. An agent will be with you shortly.',
          },
        });
        whatsappService.sendLiveChatAlert(sanitizedName, data.phone, data.email);
        socket.emit('chat:connected', { conversationId: conversation.id, message: botMsg });
        io.to('admin').emit('chat:new', { conversation });
      } catch (err) {
        socket.emit('chat:error', { message: 'Failed to start live chat' });
      }
    });

    socket.on('chat:message', async (data: { conversationId: string; content: string; senderName?: string }) => {
      try {
        const sanitizedContent = data.content.replace(/[<>]/g, '').trim();
        if (!sanitizedContent) return;

        const conv = await prisma.chatConversation.findUnique({
          where: { id: data.conversationId },
        });
        if (!conv) {
          socket.emit('chat:error', { message: 'Conversation not found' });
          return;
        }
        if (conv.socketId !== socket.id) {
          socket.emit('chat:error', { message: 'Not authorized for this conversation' });
          return;
        }
        if (conv.status !== 'ACTIVE') {
          socket.emit('chat:error', { message: 'Conversation is closed' });
          return;
        }

        const msg = await prisma.chatMessage.create({
          data: {
            conversationId: data.conversationId,
            senderType: 'GUEST',
            senderName: data.senderName?.replace(/[<>]/g, '').trim() || 'Guest',
            content: sanitizedContent,
          },
        });
        io.to('admin').emit('chat:message', { conversationId: data.conversationId, message: msg });
      } catch (err) {
        socket.emit('chat:error', { message: 'Failed to send message' });
      }
    });

    socket.on('chat:admin-reply', async (data: {
      conversationId: string; content: string; adminName: string; adminId: string
    }) => {
      if (!requireAuth(socket, ['SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST'])) return;

      try {
        const sanitizedContent = data.content.replace(/[<>]/g, '').trim();
        if (!sanitizedContent) return;

        const msg = await prisma.chatMessage.create({
          data: {
            conversationId: data.conversationId,
            senderType: 'ADMIN',
            senderId: data.adminId,
            senderName: data.adminName.replace(/[<>]/g, '').trim(),
            content: sanitizedContent,
          },
        });
        const conv = await prisma.chatConversation.findUnique({
          where: { id: data.conversationId },
        });
        if (conv?.socketId) {
          io.to(conv.socketId).emit('chat:reply', { message: msg });
        }
        socket.emit('chat:admin-sent', { message: msg });
      } catch (err) {
        socket.emit('chat:error', { message: 'Failed to send reply' });
      }
    });

    socket.on('chat:close', async (data: { conversationId: string }) => {
      try {
        const conv = await prisma.chatConversation.findUnique({
          where: { id: data.conversationId },
        });
        if (!conv) {
          socket.emit('chat:error', { message: 'Conversation not found' });
          return;
        }
        const isGuestOwner = conv.socketId === socket.id;
        const isAdmin = (socket as any).user && ['SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST'].includes((socket as any).user.role);
        if (!isGuestOwner && !isAdmin) {
          socket.emit('chat:error', { message: 'Not authorized to close this conversation' });
          return;
        }

        await prisma.chatConversation.update({
          where: { id: data.conversationId },
          data: { status: 'CLOSED', socketId: null },
        });
        io.to('admin').emit('chat:closed', { conversationId: data.conversationId });
        socket.emit('chat:closed', { conversationId: data.conversationId });
      } catch (err) {
        socket.emit('chat:error', { message: 'Failed to close conversation' });
      }
    });

    socket.on('chat:typing', async (data: { conversationId: string; isTyping: boolean }) => {
      const conv = await prisma.chatConversation.findUnique({
        where: { id: data.conversationId },
      });
      if (!conv) return;
      const isGuestOwner = conv.socketId === socket.id;
      const isAdmin = (socket as any).user && ['SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST'].includes((socket as any).user.role);
      if (!isGuestOwner && !isAdmin) return;
      socket.to('admin').emit('chat:typing', data);
    });

    socket.on('disconnect', async () => {
      logger.info('Client disconnected', { socketId: socket.id });
      try {
        await prisma.chatConversation.updateMany({
          where: { socketId: socket.id, status: 'ACTIVE' },
          data: { socketId: null },
        });
      } catch {}
    });
  });

  return io;
}

export function emitKitchenUpdate(io: Server, data: any) {
  io.to('kitchen').emit('order:update', data);
}

export function emitAdminUpdate(io: Server, event: string, data: any) {
  io.to('admin').emit(event, data);
}
