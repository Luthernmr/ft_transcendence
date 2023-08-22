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
import { User } from "./components/Social/AllUserItem";
import Settings from "./components/User/Settings";

const currentUser: User = JSON.parse(
  sessionStorage.getItem("currentUser") || "{}"
);

const getUser = async () => {
  try {
    const res = await axios.get(import.meta.env.VITE_BACKEND + "/api/user", {
      withCredentials: true,
    });
    sessionStorage.setItem("currentUser", JSON.stringify(res.data.user));
  } catch (error) {
    console.log(error);
    sessionStorage.clear();
    sessionStorage.removeItem("currentUser");
    return <Navigate to="/login" />;
  }
};

function PrivateRoute({ children }: { children: ReactNode }) {
  const getUserData = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_BACKEND + "/api/user", {
        withCredentials: true,
      });
      return JSON.stringify(res.data.user);
    } catch (error) {
      return "";
    }
  };

  let [hasPermission, setHasPermission] = useState(true);
  let [currentUser, setUser] = useState("");
  const jwtSession = sessionStorage.getItem("jwt");
  useEffect(() => {
    const check_jwt = async () => {
      console.log(jwtSession);
      try {
        const res = await axios.post(
          import.meta.env.VITE_BACKEND + "/api/verify",
          { jwt: jwtSession },
          {
            withCredentials: true,
          }
        );
        if (res.status == 200) {
          setHasPermission(true);
          setUser(await getUserData());
        }
      } catch {
        setHasPermission(false);
      }
    };
    check_jwt();
  }, [hasPermission]);
  console.log(hasPermission);
  if (!hasPermission) {
    sessionStorage.clear();
    return <Navigate to="/login" />;
  }
  sessionStorage.setItem("currentUser", currentUser);
  return <>{children}</>;
}

const PublicRoute = ({ children }: { children: ReactNode }) => {
  if (sessionStorage.getItem("jwt")) {
    return <Navigate to="/Home" />;
  }
  return <>{children}</>;
};


export default function App() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const toast = useToast();

  const navigate = useNavigate();

  useEffect(() => {
    const signOut = async () => {
      try {
        sessionStorage.clear();
        navigate("/");
        chatSocket.disconnect();
        userSocket.disconnect();
        pongSocket.disconnect();
        toast({
          title: "Already connected in other window",
          status: "error",
          isClosable: true,
          position: "top",
        });
      } catch (error) {
        console.log(error);
      }
    };
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
      if (sessionStorage.getItem("jwt")) getUser();
    });

    userSocket.on("logout", signOut);

    chatSocket.on("disconnect", () => {
      if (sessionStorage.getItem("currentUser"))
        sessionStorage.removeItem("currentUser");
    });

    userSocket.on("ping", () => {
      userSocket.emit("pong");
    });

    return () => {
      userSocket.off("error", handleError);
      userSocket.off("success", handleSuccess);
      userSocket.off("connect", getUser);
      userSocket.off("logout", signOut);
    };
  });

  return (
    <SelectedRoomContext.Provider value={{ selectedRoom, setSelectedRoom }}>
      <Routes>
        <Route
          path="/Register"
          element={
            <PublicRoute>
              <RegisterCard />
            </PublicRoute>
          }
        />
        <Route
          path="/Login"
          element={
            <PublicRoute>
              <LoginCard />
            </PublicRoute>
          }
        />
        <Route
          path="/Auth"
          element={
            <PublicRoute>
              <AuthElement />
            </PublicRoute>
          }
        />
        <Route
          path="/2fa"
          element={
            <PublicRoute>
              <TwoFA />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          }
        />
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
