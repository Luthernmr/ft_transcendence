import { io } from "socket.io-client";

export const userSocket = io(import.meta.env.VITE_BACKEND, {
	reconnectionDelayMax: 10000,
	auth: {
		token: localStorage.getItem("currentUser")
	  }
});