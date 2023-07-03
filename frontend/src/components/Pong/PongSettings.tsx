export const OFFSET_X: number = 40;
export const OFFSET_Y: number = 40;

export const WALL_WIDTH: number = 10;
export const WALL_HEIGHT: number = 10;

export const MAX_WIN_WIDTH: number = 800;
export const MAX_WIN_HEIGHT: number = 1000;

export const MIN_WIN_WIDTH: number = 200;
export const MIN_WIN_HEIGHT: number = 400;

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

export interface PongInitData extends GameLayout, PongInitEntities {
	ballPosition: Vector2,
	paddlePos: number
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
  Home,
  Queue,
  Play,
  Finished,
  Watch
}

export enum GameState {
	Player,
	Watcher
}

export enum PongDisplay {
  Normal,
  Reversed
}