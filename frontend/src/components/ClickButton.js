import axios from 'axios'
import '../App.css';

export function ClickButton() {
	const handleRequest = async (event) => {
		let sentence = axios.get("http://localhost:5000/test/v1");
		console.log(sentence);
	};

	const handleRequest2 = async (event) => {
		let newUser = await axios.get("http://localhost:5000/test/user");
		try{
			console.log("New User created!");	
		}
		catch(error) {
			console.log(error);
		}
	};

	return (
		<div className="App">
			<header className="App-header">
				<button onClick={handleRequest}>Click!</button>
				<button onClick={handleRequest2}>Create User!</button>
			</header>
		</div>
	)
}