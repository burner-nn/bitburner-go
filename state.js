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

	this.playerOwned = new Set();
	this.oppOwned = new Set();

	for(let chain of this.chains.neutral)
	{
	    if(chain.playerConnections.length > 0 && chain.opponentConnections.length == 0)
		this.playerOwned.add(chain);
	    else if(chain.opponentConnections.length > 0 && chain.playerConnections.length == 0)
		this.oppOwned.add(chain);
	}

	this.#markEyes(this.playerOwned, x => x.playerConnections);
	this.#markEyes(this.oppOwned, x => x.opponentConnections);

	let freeCells = 0;
	for(let c of this.chains.neutral) {
	    if(!c.isEye)
		freeCells += c.points.length;
	}

	this.depthScale = freeCells / (this.board.width * this.board.height);
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
	    result[0] += chain.points.length;

	for(let chain of this.chains.opponent)
	    result[1] += chain.points.length;

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

    #markEyes(owned, connections)
    {
	let conns = new Map();
	for(let chain of owned)
	{
	    let playerChains = new Set();
	    for(let c of connections(chain))
	    {
		let playerChain = this.chains.cells[c];
		if(chain.points.length <= 2 || playerChain.points.length >= 2)
		    playerChains.add(playerChain.id);
	    }

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
    }

    #neutralScore(owned, connections)
    {
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
	    if(chain.connections.length < 2)
		multiplier = 0.25;
	    else
	    {
		multiplier = 0;
		let additive = 0.5;
		for(let i=2;i<=chain.connections.length;i++)
		{
		    multiplier += additive;
		    additive /= 2;
		}
	    }
	}

	return this.cellArrayScore(chain.points) * multiplier;
    }

    chainScore()
    {
	let result = [0, 0];

	result[0] += this.#neutralScore(this.playerOwned, x => x.playerConnections);
	result[1] += this.#neutralScore(this.oppOwned, x => x.opponentConnections);

	for(let chain of this.chains.player)
	    result[0] += this.#chainScore(chain, this.playerOwned);
	for(let chain of this.chains.opponent)
	    result[1] += this.#chainScore(chain, this.oppOwned);

	return result;
    }

    makeMove(move)
    {
	let newBoard = new Board(new Int8Array(this.board.data.length), this.board.width, this.board.height, this.board.opponent, move == null);
	for(let i=0;i<this.board.data.length;i++){
	    if(this.board.data[i] == 3)
		newBoard.data[i] = 3;
	    else
		newBoard.data[i] = 0;
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

	let result = State.fromBoard(newBoard, this.depthMap, newHistory, this.globalHistory);
	return result;
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
