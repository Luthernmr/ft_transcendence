import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../App.css';

export function ClickButton() {
	//let navigate = useNavigate();
	const handleRequest = async (event) => {
		//navigate('/test/v1');
		let sentence = await axios.get("http://localhost:5000/test/v1");
		console.log(sentence);
	};

	return (
		<div className="App">
			<header className="App-header">
				<button onClick={handleRequest}>Click!</button>
			</header>
		</div>
	)
}