import { Routes, Route, Navigate } from "react-router-dom";
import Chat from "./components/Chat/Chat";
import Pong from "./components/Pong/Pong";
import Settings from "./components/User/Settings";
import SidebarWithHeader from "./components/Dashboard/SidebarWithHeader";
import LoginCard from "./components/User/loginCard";
import RegisterCard from "./components/User/registerCard";
import Home from "./components/Dashboard/Home";
import { pongSocket, userSocket, chatSocket } from "./sockets/sockets";
import AuthElement from "./components/User/AuthElement";
import { ReactNode, useEffect, useState } from "react";


function PrivateRoute({ children }: { children: ReactNode }) {

	if (!sessionStorage.getItem('jwt')) {
		return (<Navigate to="/Login" />)
	}
	return <>{children}</>
}

export default function App() {


	userSocket.on('connect', () => {
		console.log('user socket connect')
	})

	pongSocket.on('connect', () => {
		console.log("pong socket connecting");
	})

	chatSocket.on('connect', () => {

		console.log('chat socket connect')
	})



	return (
		<Routes>
			<Route path="/Register" element={<RegisterCard />} />
			<Route path="/Login" element={<LoginCard />} />
			<Route path="/Auth" element={<AuthElement />} />
			<Route path="/" element={<Home />} />


			<Route path="/Home" element={
				<PrivateRoute>
					<SidebarWithHeader children={<></>} />
				</PrivateRoute>
			}
			/>
			<Route path="/Chat" element={
				<PrivateRoute>
					<SidebarWithHeader children={<Chat />} />
				</PrivateRoute>
			}
			/>
			<Route path="/Play" element={
				<PrivateRoute>
					<SidebarWithHeader children={<Pong />} />
				</PrivateRoute>
			}
			/>
			<Route path="/Settings" element={
				<PrivateRoute>
					<SidebarWithHeader children={<Settings />} />
				</PrivateRoute>
			}
			/>

		</Routes>
	);
}