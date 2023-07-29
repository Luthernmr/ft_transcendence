import { Routes, Route, Navigate } from "react-router-dom";
import Chat from "./components/Chat/Chat";
import Pong from "./components/Pong/Pong";
import SidebarWithHeader from "./components/Dashboard/SidebarWithHeader";
import LoginCard from "./components/User/loginCard";
import RegisterCard from "./components/User/registerCard";
import Home from "./components/Dashboard/Home";
import { pongSocket, userSocket, chatSocket } from "./sockets/sockets";
import AuthElement from "./components/User/AuthElement";
import { ReactNode, useState, useEffect } from "react";
import UserProfile from "./components/User/Profile";
import TwoFA from "./components/User/TwoFA";
import OtherProfilPage from "./components/Social/OtherProfilPage";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import SelectedRoomContext from "./components/Chat/SelectedRoomContext";
import { Room } from "./components/Chat/ChatRoom";

function PrivateRoute({ children }: { children: ReactNode }) {
	if (!sessionStorage.getItem("jwt")) {
		return <Navigate to="/Login" />;
	}
	return <>{children}</>;
}

export default function App() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const toast = useToast();
  
  const getUser = async () => {
	try {
		const res = await axios.get(import.meta.env.VITE_BACKEND + "/api/user", {
		  withCredentials: true,
		});
		sessionStorage.setItem("currentUser", JSON.stringify(res.data.user));
		pongSocket.auth = { token: res.data.jwt };
		userSocket.auth = { token: res.data.jwt };
		chatSocket.auth = { token: res.data.jwt };
	} catch (error) {console.log(error)}
  };
	useEffect(() => {
		const handleError = (error: { message: string }) => {
			toast({
				title: error.message,
				status: "error",
				isClosable: true,
				position: "top",
			});
		};
		const handleSuccess = (sucess: { message: string }) => {
			toast({
				title: sucess.message,
				status: "success",
				isClosable: true,
				position: "top",
			});
		};
		userSocket.on("error", handleError);
		userSocket.on("success", handleSuccess);
		chatSocket.on("connect", () => {
			if (sessionStorage.getItem('currentUser'))
				getUser();
		});
		userSocket.on("ping", () => {
			userSocket.emit("pong")
		});

		return () =>{
			userSocket.off("error", handleError)
			userSocket.off("success", handleSuccess)
		}

	})

	return (
    <SelectedRoomContext.Provider value={{ selectedRoom, setSelectedRoom }}>
  		<Routes>
  			<Route path="/Register" element={<RegisterCard />} />
  			<Route path="/Login" element={<LoginCard />} />
  			<Route path="/Auth" element={<AuthElement />} />
  			<Route path="/2fa" element={<TwoFA />} />
  			<Route path="/" element={<Home />} />
  			<Route
  				path="/Home"
  				element={
  					<PrivateRoute>
  						<SidebarWithHeader children={<Chat />} />
  					</PrivateRoute>
  				}
  			/>
  			<Route
  				path="/Chat"
  				element={
  					<PrivateRoute>
  						<SidebarWithHeader children={<Chat />} />
  					</PrivateRoute>
  				}
  			/>
  			<Route
  				path="/Play"
  				element={
  					<PrivateRoute>
  						<SidebarWithHeader children={<Pong />} />
  					</PrivateRoute>
  				}
  			/>
  			<Route
  				path="/profile"
  				element={
  					<PrivateRoute>
  						<SidebarWithHeader children={<UserProfile />} />
  					</PrivateRoute>
  				}
  			/>
  			<Route
  				path="/profile/:id"
  				element={
  					<PrivateRoute>
  						<SidebarWithHeader children={<OtherProfilPage />} />
  					</PrivateRoute>
  				}
  			/>
  		</Routes>
    </SelectedRoomContext.Provider>
	);
}
