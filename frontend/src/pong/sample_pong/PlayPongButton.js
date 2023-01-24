import axios from 'axios'
import '../Pong.css'

export function PlayPongButton() {
	const playPong = async (event) => {
		console.log("Pong launched!");
	};

	return (
		<>
			<button onClick={playPong}>Play!</button>
		</>
	)
}