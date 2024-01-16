import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket?: Socket;
  private socketSubject: BehaviorSubject<Socket | undefined>;

  constructor() {
    this.socketSubject = new BehaviorSubject<Socket | undefined>(undefined);
  }

  initSocket() {
    const options = {
      'force new connection': true,
      reconnectionAttempt: 'Infinity',
      timeout: 10000,
      transports: ['websocket'],
    };

    const socket = io('http://localhost:8080', options);
    this.socket = socket;
    this.socketSubject.next(socket);
    return this.socket;
  }

  getSocket(): Observable<Socket | undefined> {
    if (!this.socket) {
      this.initSocket();
    }
    console.log(this.socketSubject.asObservable());

    return this.socketSubject.asObservable();
  }

  // getSocket(): any {
  //   return this.socket;
  // }

  disconnectSocket() {
    if (this.socket) {
      const isSocketConnected: any = this.socket.disconnect();
      console.log('Socket disconnected', isSocketConnected);
      return isSocketConnected;
    }
  }
}
