import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import { ChakraProvider } from '@chakra-ui/react'
import SidebarWithHeader from './components/SidebarWithHeader'

function App() {
  const [count, setCount] = useState(0)

  return (
    <ChakraProvider>
      <SidebarWithHeader><></></SidebarWithHeader>
    </ChakraProvider>
  )
}

export default App
