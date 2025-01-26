import {State} from './state.js';

class ValidMoveStrategy
{
    getPossibleMoves(state)
    {
	let valid = Array.from(state.validMoves().entries());
	return valid;

	let result = [];

	let pieceScore = state.pieceScore()[0] - state.pieceScore()[1];
	for(let [move, moveState] of valid)
	{
	    let moveScores = moveState.pieceScore();
	    let moveScore = moveScores[1] - moveScores[0];

	    if(moveScore > pieceScore + 2)
		result.push([move, moveState]);
	}

	if(result.length > 0)
	    return result;

	return valid;
    }
}

class OppMoveStrategy
{
    getPossibleMoves(state)
    {
	let valid = Array.from(state.validMoves().entries());

	let eyes = new Set();
	for(let chain of state.chains.neutral)
	    if(chain.isEye)
	{
	    for(let point of chain.points)
		eyes.add(point);
	}
	
	return valid.filter(([m, s]) => m == null || !eyes.has(m));
    }
}

export class Game
{
    constructor(state, depthMap, history)
    {
	this.history = history;
	this.state = state;
	this.depthMap = depthMap;

	this.blackStrategy = new ValidMoveStrategy();
	this.whiteStrategy = new OppMoveStrategy();
    }

    static fromBoard(board) {
	let depthMap = board.depthMap();
	let history = new Set([board.code()]);
	return new Game(State.fromBoard(board, depthMap, new Set(), history), depthMap, history);
    }

    addHistory(board) { this.history.add(board.code()); }

    #getPossibleMoves(state)
    {
	if(state.board.player == 1)
	    return this.blackStrategy.getPossibleMoves(state);
	return this.whiteStrategy.getPossibleMoves(state);
    }

    #findBestMove(state, depth)
    {
	let code = state.board.pack();
	if(this._stateCache.has(code))
	    return this._stateCache.get(code);

	let bestScore = null;
	let bestMove = null;

	for(let [move, nextState] of this.#getPossibleMoves(state))
	{
	    this._totalStates++;
	    let score = null;

	    if(state.board.isPass && move == null)
	    {
		let scores = nextState.chainScore();
		score = scores[0] - scores[1];
	    }
	    else if(depth == 0)
	    {
		let scores = nextState.chainScore();
		score = scores[0] - scores[1];
	    }
	    else
	    {
		score = this.#findBestMove(nextState, depth-1)[1];
	    }

	    if(bestScore == null || bestScore > score)
	    {
		bestScore = score;
		bestMove = move;
	    }
	}

	this._stateCache.set(code, [bestMove, -bestScore]);
	return [bestMove, -bestScore];
    }

    findBestMove(depth=0)
    {
	this._totalStates = 0;
	this._stateCache = new Map();
	return this.#findBestMove(this.state, depth)[0];
    }

    makeMove(move) {
	let nextState = this.state.makeMove(move);
	for(let code of nextState.localHistory.keys())
	{
	    this.history.add(code);
	}
	nextState.localHistory = new Set();

	this.state = nextState;
    }
}
