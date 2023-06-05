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

export default function App() {

	// Ajouter un état pour suivre si getAuthToken a déjà été appelée
	const [authTokenCalled, setAuthTokenCalled] = useState(false);

	const navigate = useNavigate();
	React.useEffect(() => {
		if (location.search.includes('code') && !authTokenCalled) {
			const getAuthToken = async () => {
				try{
					const res = await axios.get(import.meta.env.VITE_BACKEND + '/auth/42' + location.search, { withCredentials: true });
					console.log("res", res.data);
					if (res.data.jwt)
						localStorage.setItem('jwt', res.data.jwt);
						navigate('/home');
				}
				catch(error)
				{
					console.log("already",error)
				}
			};
			getAuthToken();
			setAuthTokenCalled(true); // Mettre à jour l'état pour indiquer que getAuthToken a été appelée
		}
		console.log("here", location);
	}, [location, authTokenCalled]); // Inclure authTokenCalled dans les dépendances du useEffect

	const [online, setOnline] = useState(false);

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