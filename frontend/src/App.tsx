import { Routes, Route, Navigate } from "react-router-dom";
import Chat from "./components/Chat/Chat";
import Pong from "./components/Pong/Pong";
import SidebarWithHeader from "./components/Dashboard/SidebarWithHeader";
import LoginCard from "./components/User/loginCard";
import RegisterCard from "./components/User/registerCard";
import Home from "./components/Dashboard/Home";
import { pongSocket, userSocket, chatSocket } from "./sockets/sockets";
import AuthElement from "./components/User/AuthElement";
import { ReactNode, useEffect, useState } from "react";
import UserProfile from "./components/User/Profile";


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
<<<<<<< HEAD
			<Route path="/Home" element={
				<PrivateRoute>
					<SidebarWithHeader children={<Chat />} />
=======


			<Route path="/Home" element={
				<PrivateRoute>
					<SidebarWithHeader children={<></>} />
>>>>>>> 9be1bc6363ce3b7bd0cb3e1b1fab1f363c17b986
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
			<Route path="/profile" element={
				<PrivateRoute>
					<SidebarWithHeader children={<UserProfile />} />
				</PrivateRoute>
			}
			/>
		</Routes>
	);
}