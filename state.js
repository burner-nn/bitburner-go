import { Board } from './board.js';
import { Chain } from './chain.js';

export class State
{
    constructor(board, chains, depthMap, localHistory, globalHistory)
    {
	this.board = board;
	this.chains = chains;
	this.depthMap = depthMap;
	this.localHistory = localHistory;
	this.globalHistory = globalHistory;

	let freeCells = 0;
	for(let c of this.chains.neutral)
	    freeCells += c.points.length;

	this.depthScale = freeCells / (board.width * board.height);
    }

    #chainsToString(name, chains)
    {
	let result = chains.map(c => c.toString());
	if(result.length == 0)
	    return [name + ":"];

	result[0] = name + ": " + result[0];
	for(let i=1;i<result.length;i++)
	    result[i] = "   " + result[i];

	return result;
    }

    toStrings()
    {
	let board = this.board.toStrings();
	let chains = this.#chainsToString("N", this.chains.neutral).concat(
	    this.#chainsToString("P", this.chains.player),
	    this.#chainsToString("O", this.chains.opponent));

	let result = [board[0]];

	let boardIndex = 1;
	let chainIndex = 0;
	while(boardIndex < board.length || chainIndex < chains.length)
	{
	    let line = "";
	    if(boardIndex < board.length)
		line += board[boardIndex++];
	    else
		line += " ".repeat(this.board.width);

	    line += "   ";

	    if(chainIndex < chains.length)
		line += chains[chainIndex++].toString();

	    result.push(line);
	}

	return result;
    }

    static fromBoard(board, depthMap, localHistory=new Set(), globalHistory=new Set())
    {
	return new State(board, Chain.fromBoard(board), depthMap, localHistory, globalHistory);
    }

    cellScore(cell) { 
	let multiplier = 1;
	if(this.depthMap != null)
	    multiplier = (1 - this.depthMap[cell] * this.depthScale);

	return multiplier;
    }
    cellArrayScore(arr) {
	let result = 0;
	for(let cell of arr)
	{
	    result += this.cellScore(cell);
	}
	return result;
    }

    pieceScore()
    {
	let result = [0, 0];
	for(let chain of this.chains.player)
	    result[0] += this.cellArrayScore(chain.points);

	for(let chain of this.chains.opponent)
	    result[1] += this.cellArrayScore(chain.points);

	return result;
    }

    areaScore()
    {
	let result = this.pieceScore();

	for(let c of this.chains.neutral)
	{
	    if(c.playerConnections.length > 0 && c.opponentConnections.length == 0)
		result[0] += this.cellArrayScore(c.points);
	    else if(c.playerConnections.length == 0 && c.opponentConnections.length > 0)
		result[1] += this.cellArrayScore(c.points);
	}

	return result;
    }

    #neutralScore(owned, connections)
    {
	let conns = new Map();
	for(let chain of owned)
	{
	    let playerChains = new Set();
	    for(let c of connections(chain))
		playerChains.add(this.chains.cells[c].id);

	    let key = Array.from(playerChains).sort().join(",");
	    if(conns.has(key))
		conns.get(key).push(chain);
	    else
		conns.set(key, [chain]);
	}

	for(let [_, chains] of conns.entries())
	{
	    if(chains.length > 1)
		for(let c of chains)
		    c.isEye = true;
	}

	let result = 0;
	for(let c of owned)
	    if(c.isEye)
		result += this.cellArrayScore(c.points);

	return result;
    }

    #chainScore(chain, owned)
    {
	let connected = new Set();
	for(let c of chain.connections) {
	    let n = this.chains.cells[c];
	    if(n.isEye && owned.has(n))
		connected.add(this.chains.cells[c]);
	}

	let multiplier = 1;
	if(connected.size < 2)
	{
	    switch(chain.connections.length)
	    {
		case 0:
		case 1: multiplier = 0.25; break;
		case 2: multiplier = 0.5; break;
		default: multiplier = 0.75; break;
	    }
	}

	return this.cellArrayScore(chain.points) * multiplier;
    }

    chainScore()
    {
	let result = [0, 0];
	let playerOwned = new Set();
	let oppOwned = new Set();
	for(let chain of this.chains.neutral)
	{
	    if(chain.playerConnections.length > 0 && chain.opponentConnections.length == 0)
		playerOwned.add(chain);
	    else if(chain.opponentConnections.length > 0 && chain.playerConnections.length == 0)
		oppOwned.add(chain);
	}

	result[0] += this.#neutralScore(playerOwned, x => x.playerConnections);
	result[1] += this.#neutralScore(oppOwned, x => x.opponentConnections);

	for(let chain of this.chains.player)
	    result[0] += this.#chainScore(chain, playerOwned);
	for(let chain of this.chains.opponent)
	    result[1] += this.#chainScore(chain, oppOwned);

	return result;
    }

    makeMove(move)
    {
	let newBoard = new Board(new Int8Array(this.board.data.length), this.board.width, this.board.height, this.board.opponent, move == null);
	for(let i=0;i<this.board.data.length;i++){
	    if(this.board.data[i] == 3)
		newBoard[i] = 3;
	    else
		newBoard[i] = 0;
	}

	for(let c of this.chains.player)
	    c.apply(newBoard);
	for(let c of this.chains.opponent)
	{
	    if(c.connections.length > 1 || c.connections[0] != move)
		c.apply(newBoard);
	}

	if(move != null)
	    newBoard.data[move] = this.board.player;

	let newHistory = new Set(this.localHistory);
	newHistory.add(newBoard.code());
	return State.fromBoard(newBoard, this.depthMap, newHistory, this.globalHistory);
    }

    validMoves()
    {
	let alive = new Set();
	for(let chain of this.chains.player)
	{
	    if(chain.connections.length == 1)
		continue;
	    for(let c of chain.connections)
		alive.add(c);
	}
	let dead = new Set();
	for(let chain of this.chains.opponent)
	{
	    if(chain.connections.length == 1)
		dead.add(chain.connections[0]);
	}

	let moves = [null];
	for(let chain of this.chains.neutral)
	{
	    if(chain.points.length > 1 || alive.has(chain.points[0]) || dead.has(chain.points[0]))
		moves = moves.concat(chain.points);
	}

	let result = new Map();
	for(let mv of moves.sort((a, b) => a - b))
	{
	    let newState = this.makeMove(mv);
	    let pack = newState.board.code();

	    if(mv != null && (this.globalHistory.has(pack) || this.localHistory.has(pack)))
		continue;

	    result.set(mv, newState);
	}

	return result;
    }
}
