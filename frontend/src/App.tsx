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

export default function App() {
	const [online, setOnline] = useState(false);
	
	userSocket.on('connect', ()=> {
		auth: {
			token: localStorage.getItem("currentUser")
		  }
		console.log('front connect')
	})
	
		//const location = useLocation();
	  //
		//// Utilisation de location pour accéder à l'URL
		//console.log(location.pathname); // Récupère le chemin de l'URL
		//console.log(location.search); // Récupère les paramètres de requête (y compris le point d'interrogation)
	  //
		//// Utilisation de URLSearchParams pour manipuler les paramètres de requête
		//const params = new URLSearchParams(location.search);
		//console.log(params.get('code')); 
	
  return (
    <BrowserRouter>
		<Routes>
			<Route path="/Register" element={<RegisterCard />} />
			<Route path="/Login" element={<LoginCard/>} />
		
			<Route path="/home/*" element={ <SidebarWithHeader>
           		<Routes>
           		  <Route path="/" element={<Home/>} />
           		  <Route path="/Play" element={<Pong/>} /> 
           		  <Route path="/Chat" element={<Chat/>} />
           		  <Route path="/Settings" element={<Settings/>}  />
           		</Routes>
        </SidebarWithHeader>} />
		</Routes>
    </BrowserRouter>	
  );
}