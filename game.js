import {State} from './state.js';

export class Game
{
    constructor(state, depthMap, history)
    {
	this.history = history;
	this.state = state;
	this.depthMap = depthMap;
    }

    static fromBoard(board) {
	let depthMap = board.depthMap();
	let history = new Set([board.code()]);
	return new Game(State.fromBoard(board, depthMap, new Set(), history), depthMap, history);
    }

    addHistory(board) { this.history.add(board.code()); }

    makeMove(move) {
	let nextState = this.state.makeMove(move);
	for(let code of nextState.localHistory.entries())
	    this.history.add(code);
	nextState.localHistory = new Set();

	this.state = nextState;
    }
}
