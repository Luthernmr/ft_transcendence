import { io } from "socket.io-client";

export const userSocket = io(import.meta.env.VITE_BACKEND, {
	reconnectionDelayMax: 10000, 
	auth: {
		token: localStorage.getItem("jwt")
	}
});

export const chatSocket = io(import.meta.env.VITE_BACKEND, {
	reconnectionDelayMax: 10000, 
	auth: {
		token: localStorage.getItem("jwt")
	}
});

export const pongSocket = io(import.meta.env.VITE_BACKEND + '/pong', {
	reconnectionDelayMax: 10000,
});