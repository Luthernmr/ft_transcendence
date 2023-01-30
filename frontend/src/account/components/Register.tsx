import { calculateNewValue } from '@testing-library/user-event/dist/utils';
import axios from 'axios'
import React, { useState } from 'react';

const backendUrl = "http://212.227.209.204:5000/register";
export function Register() {

	const [data, fillUser] = useState(
		{
			name: '',
			email: '',
			password: ''
		}
	);

	
	const onSubmit = async() => 
	{
		try{
			let newUser = await axios.post(backendUrl, data);
			console.log(newUser.data)
		}
		catch(error) {
			console.log(error);
		}
	};
	const handleChange = (event: any) => {
		fillUser({ ...data, [event.target.name]: event.target.value });
	  };

	
	return (
		<form onSubmit={onSubmit}>
			<input type="name" name="name" placeholder='name' value={data.name} onChange={handleChange}/><br/>
			<input type="email" name="email" placeholder='email' value={data.email} onChange={handleChange}/><br/>
			<input type="password" name="password" placeholder='password' value={data.password}  onChange={handleChange}/><br/>
			<button type="submit" >Create User!</button>
		</form>
	)
}
export default Register;