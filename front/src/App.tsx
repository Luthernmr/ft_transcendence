import { ChakraProvider } from '@chakra-ui/react'
import SidebarWithHeader from './components/SidebarWithHeader'

function App() {
  return (
    <ChakraProvider>
      <SidebarWithHeader><></></SidebarWithHeader>
    </ChakraProvider>
  )
}

export default App