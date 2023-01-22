import { React } from "react";
import { PlayPongButton } from "./components/PlayPongButton";
import './Pong.css'
import { GameManager } from "./components/GameManager" 

function Pong() {

	return (
		<div>
			Welcome to the Pong page!
			<PlayPongButton />
			<GameManager />
		</div>
	  );
}

export default Pong;