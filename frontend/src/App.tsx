import React, { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter, useNavigate } from "react-router-dom";
import Chat from "./components/Chat";
import Pong from "./components/Pong";
import Settings from "./components/Settings";
import SidebarWithHeader from "./components/SidebarWithHeader";
import LoginCard from "./components/user/loginCard";
import RegisterCard from "./components/user/registerCard";
import { FiLogIn } from "react-icons/fi";
import axios from "axios";

function  LoginPage()
{
	const [isOnline, setOnline] = useState();
	useEffect(() => {
		async function fetchData() {
		  const response = await axios.get('http://212.227.209.204:5000/api/isOnline', { withCredentials: true });
		  setOnline(response.data.online);
		}
		fetchData();
	  }, [isOnline]);

	return (
		<>
		{isOnline &&
		<SidebarWithHeader>
		  <Routes>
			<Route path="/Play" element={<Pong />} />
			<Route path="/Chat" element={<Chat />} />
			<Route path="/Settings" element={<Settings />} />
		  </Routes>
		</SidebarWithHeader>
		}
		{!isOnline &&
		<Routes>
			<Route path="/Register" element={<RegisterCard />} />
			<Route path="/Login" element={<LoginCard />} />
		</Routes>
		}
		</>
	)
  }

  
  export default function App() {
	
	return (
		<BrowserRouter>
			<LoginPage />	
		</BrowserRouter>	

	);
  }