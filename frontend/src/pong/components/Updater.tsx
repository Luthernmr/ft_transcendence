import ICollider from './ICollider';
import Actor from './Actor';

const FRAME_RATE = 1000 / 60;

class Updater {
	
	id: number = 0;

	actors: Actor[] = [];

	constructor(props: {actors: Actor[]}) {
		this.actors = props.actors;
	}

	componentDidMount() {
		this.launchMovement();
	}

	componentWillUnmount() {
		clearInterval(this.id);
	}

	launchMovement = () => {
		this.actors.forEach(function(value) {
			window.setInterval(value.onUpdate, FRAME_RATE);
			console.log("Launched update method");
		})
	}
}

export default Updater;