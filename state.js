import { Chain } from './chain.js';

export class State
{
    constructor(board, chains, depthMap)
    {
	this.board = board;
	this.chains = chains;
	this.depthMap = depthMap;
    }

    static fromBoard(board, depthMap)
    {
	return new State(board, Chain.fromBoard(board), depthMap);
    }

    cellScore(cell) { return 1; }
    cellArrayScore(arr) {
	let result = 0;
	for(let cell of arr)
	    result += this.cellScore(cell);
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

    #chainScore(chain, owned)
    {
	let connected = new Set();
	for(let c of chain.connections)
	    if(owned.has(this.chains.cells[c]))
		connected.add(this.chains.cells[c]);

	let multiplier = 1;
	if(connected.size >= 2)
	{
	    for(let c of connected.values())
		c.eye = true;
	}
	if(connected.size < 2)
	{
	    switch(chain.connections.length)
	    {
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

	for(let chain of this.chains.player)
	    result[0] += this.#chainScore(chain, playerOwned);
	for(let chain of playerOwned.values())
	    if(chain.eye == true)
		result[0] += this.cellArrayScore(chain.points);
	for(let chain of this.chains.opponent)
	    result[1] += this.#chainScore(chain, oppOwned);
	for(let chain of oppOwned.values())
	    if(chain.eye == true)
		result[1] += this.cellArrayScore(chain.points);

	return result;
    }
}
