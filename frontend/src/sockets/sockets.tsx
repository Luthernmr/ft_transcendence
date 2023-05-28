import { io } from "socket.io-client";

export const userSocket = io("http://212.227.209.204:5000" , {
	reconnectionDelayMax: 10000,
	auth: {
		token: localStorage.getItem("currentUser")
	  }
});