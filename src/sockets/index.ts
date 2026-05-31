import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { whatsappService } from '../services/whatsapp.service';

const prisma = new PrismaClient();

export function setupSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join:kitchen', () => {
      socket.join('kitchen');
    });

    socket.on('join:admin', () => {
      socket.join('admin');
    });

    socket.on('chat:request', async (data: { name: string; email?: string; phone?: string }) => {
      try {
        const conversation = await prisma.chatConversation.create({
          data: {
            guestName: data.name,
            guestEmail: data.email,
            guestPhone: data.phone,
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
        whatsappService.sendLiveChatAlert(data.name, data.phone, data.email);
      socket.emit('chat:connected', { conversationId: conversation.id, message: botMsg });
      io.to('admin').emit('chat:new', { conversation });
      } catch (err) {
        socket.emit('chat:error', { message: 'Failed to start live chat' });
      }
    });

    socket.on('chat:message', async (data: { conversationId: string; content: string; senderName?: string }) => {
      try {
        const msg = await prisma.chatMessage.create({
          data: {
            conversationId: data.conversationId,
            senderType: 'GUEST',
            senderName: data.senderName || 'Guest',
            content: data.content,
          },
        });
        io.to('admin').emit('chat:message', { conversationId: data.conversationId, message: msg });
      } catch (err) {
        socket.emit('chat:error', { message: 'Failed to send message' });
      }
    });

    socket.on('chat:admin-reply', async (data: { conversationId: string; content: string; adminName: string; adminId: string }) => {
      try {
        const msg = await prisma.chatMessage.create({
          data: {
            conversationId: data.conversationId,
            senderType: 'ADMIN',
            senderId: data.adminId,
            senderName: data.adminName,
            content: data.content,
          },
        });
        const conv = await prisma.chatConversation.findUnique({ where: { id: data.conversationId } });
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

    socket.on('chat:typing', (data: { conversationId: string; isTyping: boolean }) => {
      socket.to('admin').emit('chat:typing', data);
    });

    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);
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
