export const OFFSET_X: number = 40;
export const OFFSET_Y: number = 40;

export const WALL_WIDTH: number = 10;
export const WALL_HEIGHT: number = 10;

export const MAX_WIN_WIDTH: number = 1900;
export const MAX_WIN_HEIGHT: number = 850;

export const MIN_WIN_WIDTH: number = 500;
export const MIN_WIN_HEIGHT: number = 450;

export const WALL_PLACEHOLDER: Obstacle = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
}

export interface Vector2 {
	x: number,
	y: number
}

export interface GameLayout {
 	 width: number,
	 height: number,
	 ballHeight: number,
 	 paddleHeight: number,
}

export interface PongInitData extends GameLayout, BallRuntimeData, PaddleRuntimeData, Score {
	playerNumber: number,
  gameState: GameState,
  winner: number
}

export enum GameState {
	Playing,
	Finished
}

export interface PongInitEntities {
  ballWidth: number,
  paddleWidth: number
}

export interface WatcherInitDatas extends GameLayout, PongInitEntities, BallRuntimeData, PaddleRuntimeData, Score {

}

export interface BallRuntimeData {
	ballPosition: Vector2,
	ballDelta: Vector2,
  ballWidth: number
}

export interface PaddleRuntimeData {
  paddleWidth: number,
	paddle1Pos: number,
	paddle1Delta: number,
	paddle2Pos: number,
	paddle2Delta: number
}

export interface Obstacle {
  x: number,
  y: number,
  width: number,
  height: number,
}

export interface Shape {
  width: number,
  height: number
}

export interface Paddle {
  pos: number,
  delta: number,
}

export interface Score {
	scoreP1: number,
	scoreP2: number
}

export enum PongState {
  Load,
  Home,
  Play,
  Watch,
}

export enum PongDisplay {
  Normal,
  Reversed
}