import { io } from "socket.io-client";
import { Socket } from "socket.io-client";

export const userSocket: Socket = io(import.meta.env.VITE_BACKEND + "/user", {
  timeout: 5000,
  auth: {
    token: sessionStorage.getItem("jwt"),
  },
});

export const chatSocket = io(import.meta.env.VITE_BACKEND + "/chat", {
  auth: {
    token: sessionStorage.getItem("jwt"),
  },
});

export const pongSocket = io(import.meta.env.VITE_BACKEND + "/pong", {
  auth: {
    token: sessionStorage.getItem("jwt"),
  },
  reconnectionDelayMax: 10000,
});
