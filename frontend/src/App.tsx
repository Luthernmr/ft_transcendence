import React from 'react'
import { Progress } from '@chakra-ui/react'
// 1. import `ChakraProvider` component
import { ChakraProvider } from '@chakra-ui/react'
import SidebarWithHeader from './component/Side'
import Account from './account/Accout'
import Chat from './chat/Chat'
import Pong from './pong/Pong'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
function App() {
  // 2. Wrap ChakraProvider at the root of your app
  return (
    <ChakraProvider>
	<SidebarWithHeader>
	<BrowserRouter>
      <Routes>
        <Route path="/Home" element={<App />} />
        <Route path="/Account" element={<Account />} />
        <Route path="/Chat" element={<Chat />} />
        <Route path="/Pong" element={<Pong />} />
      </Routes>
    </BrowserRouter>
	</SidebarWithHeader>
    </ChakraProvider>
  )
}
export default App