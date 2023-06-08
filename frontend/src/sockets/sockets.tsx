import { io } from "socket.io-client";

export const userSocket = io(import.meta.env.VITE_BACKEND, {
	reconnectionDelayMax: 10000, 
});

export const pongSocket = io(import.meta.env.VITE_BACKEND + '/pong', {
	reconnectionDelayMax: 10000,
});