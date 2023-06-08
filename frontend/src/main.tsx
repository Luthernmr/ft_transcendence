import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginCard from "./components/User/loginCard";
import RegisterCard from "./components/User/registerCard";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	//<React.StrictMode>
		<ChakraProvider>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</ChakraProvider>
	//</React.StrictMode>,
)
