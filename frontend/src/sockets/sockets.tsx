import { io } from "socket.io-client";

export const userSocket = io(import.meta.env.VITE_BACKEND + '/user', {
	//reconnectionDelayMax: 10000, 
	auth: {
		token: sessionStorage.getItem("jwt")
	}
});

export const chatSocket = io(import.meta.env.VITE_BACKEND + '/chat', {
	auth: {
		token: sessionStorage.getItem("jwt")
	}
});

export const pongSocket = io(import.meta.env.VITE_BACKEND + '/pong', {
	auth: {
		token: sessionStorage.getItem("jwt")
	},
	reconnectionDelayMax: 10000,
});