import React, { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter, Navigate, redirect, useNavigate } from "react-router-dom";
import Chat from "./components/Chat";
import Pong from "./components/Pong";
import Settings from "./components/Settings";
import SidebarWithHeader from "./components/SidebarWithHeader";
import LoginCard from "./components/user/loginCard";
import RegisterCard from "./components/user/registerCard";
import { FiLogIn } from "react-icons/fi";
import axios from "axios";

function LoginPage()
{
	const navigate = useNavigate();
  const [isOnline, setOnline] = useState();
  useEffect(() => {
    async function fetchData() {
      const response = await axios.get('http://212.227.209.204:5000/api/isOnline', { withCredentials: true });
      setOnline(response.data.online);
    }
    fetchData();
  }, []); // utiliser une fonction de rappel vide ici

  return (
    <>
      {isOnline && 
        <SidebarWithHeader>
          <Routes>
            <Route path="/home" element={<Settings />} />
            <Route path="/home/Play" element={<Pong />} />
            <Route path="/home/Chat" element={<Chat />} />
            <Route path="/home/Settings" element={<Settings />} />
          </Routes>
        </SidebarWithHeader>
      }
      {!isOnline &&
        <Routes>
          <Route path="/Register" element={<RegisterCard />} />
          <Route path="/Login" element={<LoginCard />} />
		  <Route path="/connected" element={<Navigate to="/home" replace />}/>
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