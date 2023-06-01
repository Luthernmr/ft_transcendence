import React from "react";
import { useState } from "react";
import "./TicTacToe.css"
import { isConstructorDeclaration } from "typescript";
import { timeStamp } from "console";

function Button(props: any) {	
	return (
		<button className="square" onClick={props.onClickButton}>
			{props.content}
		</button>
	)
}

interface TicTacToeState {
	player: number;
}

class TicTacToe extends React.Component<{}, TicTacToeState> {
	private board: string[];

	constructor(props: any) {
		super(props);
		this.state = { player: 0 };
		this.board = [
			" ", " ", " ",
			" ", " ", " ",
			" ", " ", " ",
		]
	}
	
	onClickCell(cell: number) {
		if (this.board[cell] != " ")
			return;
		
		const s = this.state;
		if (this.state.player === 0) {
			this.board[cell] = "X";
			this.setState( {
				player: 1
			});
		} else {
			this.board[cell] = "O";
			this.setState( {
				player: 0
			})
		}
	}
	
	render() {
		return (
		<div>
			<div className="board-row">
				<Button content={this.board[0]} onClickButton={() => this.onClickCell(0)} />
				<Button content={this.board[1]} onClickButton={() => this.onClickCell(1)} />
				<Button content={this.board[2]} onClickButton={() => this.onClickCell(2)} />
			</div>
			<div className="board-row">
				<Button content={this.board[3]} onClickButton={() => this.onClickCell(3)} />
				<Button content={this.board[4]} onClickButton={() => this.onClickCell(4)} />
				<Button content={this.board[5]} onClickButton={() => this.onClickCell(5)} />
			</div>
				<div className="board-row">
				<Button content={this.board[6]} onClickButton={() => this.onClickCell(6)} />
				<Button content={this.board[7]} onClickButton={() => this.onClickCell(7)} />
				<Button content={this.board[8]} onClickButton={() => this.onClickCell(8)} />
			</div>
		</div>);
	}
}

export default TicTacToe;