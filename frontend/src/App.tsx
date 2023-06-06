import React, { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter, Navigate, useNavigate, useLocation } from "react-router-dom";
import Chat from "./components/Chat";
import Pong from "./components/Pong";
import Settings from "./components/user/Settings";
import SidebarWithHeader from "./components/SidebarWithHeader";
import LoginCard from "./components/user/loginCard";
import RegisterCard from "./components/user/registerCard";
import { FiLogIn } from "react-icons/fi";
import axios from "axios";
import Home from "./components/Home";
import { userSocket } from "./sockets/sockets";
import Cookies from 'js-cookie';
import { Socket } from "socket.io-client";
import { error } from "console";
import AuthElement from "./components/user/AuthElement";

export default function App() {

	userSocket.on('connect', () => {
		auth: {
			token: localStorage.getItem("currentUser")
		}
		console.log('front connect')
	})


	return (
		<Routes>
			<Route path="/Register" element={<RegisterCard />} />
			<Route path="/Login" element={<LoginCard />} />
			<Route path="/Auth" element={<AuthElement />} />

			<Route path="/home/*" element={<SidebarWithHeader>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/Play" element={<Pong />} />
					<Route path="/Chat" element={<Chat />} />
					<Route path="/Settings" element={<Settings />} />
				</Routes>
			</SidebarWithHeader>} />
		</Routes>
	);
}