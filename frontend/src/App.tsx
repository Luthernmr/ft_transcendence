import SidebarWithHeader from './components/SidebarWithHeader'
import { BrowserRouter, Link, Route, Router, Routes } from 'react-router-dom'
import Pong from './components/Pong'
import Chat from './components/Chat'
import Settings from './components/Settings'
import LoginCard from './components/user/loginCard'
import { Switch } from '@chakra-ui/react'

function App() {
  return (
		<SidebarWithHeader>
		<Routes>
			<Route path="/Play" element={<Pong />} />
			<Route path="/Chat" element={<Chat />} />
			<Route path="/Settings" element={<Settings />} />
		  </Routes>
		</SidebarWithHeader>
  )
}

export default App