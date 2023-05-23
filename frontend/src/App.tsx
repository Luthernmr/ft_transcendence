import React, { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter, Navigate, useNavigate } from "react-router-dom";
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


export default function App() {
	const [online, setOnline] = useState(false);


useEffect(() => {

	userSocket.on('connect', ()=> {console.log("connected front"); setOnline(true);})
	},[online])
	
  return (
    <BrowserRouter>
		<Routes>
			<Route path="/Register" element={<RegisterCard />} />
			<Route path="/Login" element={<LoginCard/>} />
		
			<Route path="/home/*" element={ online && <SidebarWithHeader>
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