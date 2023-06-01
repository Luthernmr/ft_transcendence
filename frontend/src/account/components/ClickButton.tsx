import axios from 'axios'
import React from 'react';
import { socket } from './../../socket';

export function ClickButton() {
	const handleRequest = async () => {
		let newUser = await axios.get("http://localhost:5000/test/user");
		socket.emit("hello", (data: string) => {
			console.log(data);
		});
		
		try{
			console.log("New User created!");	
		}
		catch(error) {
			console.log(error);
		}
	};

	return (
		<>
			<button onClick={handleRequest}>Create User!</button>
		</>
	)
}

export default ClickButton;