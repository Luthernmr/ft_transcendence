import axios from 'axios'
import React from 'react';

export function ClickButton() {

	const handleRequest = async () => {
		let newUser = await axios.get("http://localhost:5000/test/user");
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