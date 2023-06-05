import { io } from "socket.io-client";

export const userSocket = io(import.meta.env.VITE_BACKEND, {
	reconnectionDelayMax: 10000,
	autoConnect: false,
	reconnection:false,
});