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


export default function App() {
	const [online, setOnline] = useState(false);
	useEffect(() => {
	  async function fetchData() {
		const response = await axios.get('http://212.227.209.204:5000/api/isOnline', { withCredentials: true });
		setOnline(response.data.online);
	  }
	  fetchData();
	}, [online]);
	console.log( "test :" , online);
	
  return (
    <BrowserRouter>
		<Routes>
			<Route path="/Register" element={<RegisterCard />} />
			<Route path="/Login" element={<LoginCard/>} />
		
			<Route path="/home/*" element={online && <SidebarWithHeader>
           		<Routes>
           		  <Route path="/home" element={<Chat/>} />
           		  <Route path="/Play" element={<Pong/>} /> 
           		  <Route path="/Chat" element={<Chat/>} />
           		  <Route path="/Settings" element={<Settings/>}  />
           		</Routes>
        </SidebarWithHeader>} />
		</Routes>
    </BrowserRouter>	
  );
}