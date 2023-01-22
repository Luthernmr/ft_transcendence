import axios from 'axios'

export function ClickButton() {

	const handleRequest = async (event) => {
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