import { io, Socket } from 'socket.io-client';
class SocketManager {
  private static instance: SocketManager;
  public socket: Socket;
  public isConnected: boolean = false;

  private constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    // Close existing socket if any
    if (this.socket) {
      this.socket.close();
    }

    this.socket = io('https://realtime.igloorooms.com/', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to the socket server');
      this.isConnected = true;
    });

    this.socket.on('connect_error', error => {
      console.error('Connection error:', error);
    });

    this.socket.on('disconnect', reason => {
      console.log('Disconnected:', reason);
      this.isConnected = false;
    });
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public reconnect() {
    if (!this.isConnected) {
      console.log('Attempting to reconnect...');
      this.socket.connect();
    }
  }

  public close() {
    this.socket.close();
  }
}

export default SocketManager;
