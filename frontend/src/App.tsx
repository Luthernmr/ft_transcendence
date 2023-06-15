import { Routes, Route } from "react-router-dom";
import Chat from "./components/Chat/Chat";
import Pong from "./components/Pong/Pong";
import Settings from "./components/User/Settings";
import SidebarWithHeader from "./components/Dashboard/SidebarWithHeader";
import LoginCard from "./components/User/loginCard";
import RegisterCard from "./components/User/registerCard";
import Home from "./components/Dashboard/Home";
import { pongSocket, userSocket, chatSocket } from "./sockets/sockets";
import AuthElement from "./components/User/AuthElement";

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

			<Route path="/home/*" element={<SidebarWithHeader>
				<Routes>
					<Route path="/Play" element={<Pong />} />
					<Route path="/Chat" element={<Chat />} />
					<Route path="/Settings" element={<Settings />} />
				</Routes>
			</SidebarWithHeader>} />
		</Routes>
	);
}