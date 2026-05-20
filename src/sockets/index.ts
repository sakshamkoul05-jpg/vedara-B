import { Server, Socket } from 'socket.io';

export function setupSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join:kitchen', () => {
      socket.join('kitchen');
    });

    socket.on('join:admin', () => {
      socket.join('admin');
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
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
