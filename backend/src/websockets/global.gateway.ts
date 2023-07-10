import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Namespace } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class GlobalGateway {
  @WebSocketServer()
  server: Server;

  userNamespace: Namespace;
  chatNamespace: Namespace;
  pongNamespace: Namespace;

  afterInit(server: Server) {
    this.userNamespace = this.server.of('/user');
    this.chatNamespace = this.server.of('/chat');
    this.pongNamespace = this.server.of('/pong');
  }
}
