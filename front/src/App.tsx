import SidebarWithHeader from './components/SidebarWithHeader'
import { Route, Routes } from 'react-router-dom'
import Pong from './components/Pong'
import Chat from './components/Chat'
import Settings from './components/Settings'
import LoginCard from './components/LoginCard'

function App() {
  return (
    <SidebarWithHeader>
      <Routes>
        <Route path="/Play" element={<Pong />} />
        <Route path="/Chat" element={<Chat />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/Login" element={<LoginCard />} />
      </Routes>
    </SidebarWithHeader>
  )
}

export default App