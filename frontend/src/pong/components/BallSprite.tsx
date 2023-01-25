import React from "react";
import { Circle } from "react-konva";

interface PositionGetter {
	getPosition: () => {x: number, y: number};
}

class BallSprite extends React.Component<any, any> {
	constructor(props: PositionGetter){
		super(props);
		const {getPosition} = this.props;
	}

	render() {
		let {x, y} = this.props.getPosition();
		return (
			<Circle
				radius={10}
				fill="green"
				x={x}
				y={y}
			/>
		)
	}
}

export default BallSprite;