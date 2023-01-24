import { React } from "react";
import './Pong.css'
//import { GameManager } from "./sample_pong/GameManager"
//import { PlayPongButton } from "./sample_pong/PlayPongButton";
import GameManager from "./GameManager";

function Pong() {

	return (
		<div>
			Welcome to the Pong page!
			{/* <PlayPongButton /> */}
			<GameManager />

		</div>
	  );
}

export default Pong;