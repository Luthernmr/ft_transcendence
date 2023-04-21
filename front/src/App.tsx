import SidebarWithHeader from './components/SidebarWithHeader'
import { Route, Routes } from 'react-router-dom'
import Pong from './components/Pong'

function App() {
  return (
    <SidebarWithHeader>
      <Routes>
        <Route path="/Play" element={<Pong />} />
      </Routes>
    </SidebarWithHeader>
  )
}

export default App