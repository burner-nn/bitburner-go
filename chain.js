import { Board } from './board.js';

class BasicChain
{
    constructor(board, id)
    {
	this.board = board;
	this.id = id;
	this.points = [];
    }

    // color

    get name() { return this.id + " " + Board.cellToString(this.color); }

    // conectionsToString

    toString()
    {
	let points = "PS:" + this.points.length;
	let connections = "CN:" + this.connectionsToString();

	let name = Board.cellToString(this.color);
	return "<C" + this.id + " "  + name + " " + points + " " + connections + ">";
    }

    // addConnection(color, cellId)

    _fill(x, y, chains)
    {
	if(x < 0 || x >= this.board.width)
	    return;
	if(y < 0 || y >= this.board.height)
	    return;

	let id = y * this.board.width + x;
	let value = this.board.getValue(id);
	if(value == 3)
	    return;

	if(value != this.color)
	{
	    if(this.color == 0 || value == 0)
	    {
		this.addConnection(value, id);
	    }
	    return;
	}

	if(chains[id])
	    return;
	chains[id] = this;
	this.points.push(id);

	this._fill(x-1, y, chains);
	this._fill(x+1, y, chains);
	this._fill(x, y-1, chains);
	this._fill(x, y+1, chains);
    }

    apply(board)
    {
	for(let point of this.points)
	    board.setValue(point, this.color);
    }
}

export class NeutralChain extends BasicChain
{
    constructor(board, id)
    {
	super(board, id);
	this.playerConnections = [];
	this.opponentConnections = [];
    }

    get color() { return 0; }

    addConnection(color, cellId)
    {
	if(color == this.board.player)
	    this.playerConnections.push(cellId);
	else
	    this.opponentConnections.push(cellId);
    }

    connectionsToString()
    {
	let player = "P:" + this.playerConnections.length;
	let opp = "O:" + this.opponentConnections.length;

	return "[" + player + "," + opp + "]";
    }
}

export class Chain extends BasicChain
{
    constructor(board, id, color)
    {
	super(board, id);
	this.color = color;
	this.connections = [];
	this.connectors = [];
    }

    addConnection(color, cellId)
    {
	this.connections.push(cellId);
    }

    connectionsToString()
    {
	return this.connections.length;
    }

    static #rearrange(arr)
    {
	arr = arr.sort((a, b) => a - b);

	let writeIndex = 1;
	for(let i=1;i<arr.length;i++)
	{
	    if(arr[i] == arr[i-1])
		continue;

	    arr[writeIndex] = arr[i];
	    writeIndex++;
	}

	return arr.slice(0, writeIndex);
    }

    static fromBoard(board)
    {
	let chainData = new Array(board.data.length);
	let result = {player: [], opponent: [], neutral: [], cells: chainData};

	for(let y=0;y<board.height;y++)
	    for(let x=0;x<board.width;x++)
	{
	    let id = y * board.width + x;
	    let value = board.getValue(id);
	    if(chainData[id] || value == 3)
		continue;

	    let chain = null;
	    if(value == 0) {
		chain = new NeutralChain(board, result.neutral.length);
	    }
	    else if(value == board.player)
		chain = new Chain(board, result.player.length, value);
	    else
		chain = new Chain(board, result.opponent.length, value);

	    chain._fill(x, y, chainData);

	    chain.points = Chain.#rearrange(chain.points);

	    if(value == 0)
	    {
		chain.playerConnections = Chain.#rearrange(chain.playerConnections);
		chain.opponentConnections = Chain.#rearrange(chain.opponentConnections);
	    }
	    else
		chain.connections = Chain.#rearrange(chain.connections);

	    switch(value) {
	    case 0: result.neutral.push(chain); break;
	    case board.player: result.player.push(chain); break;
	    case board.opponent: result.opponent.push(chain); break;
	    }
	}

	return result;
    }

    static distanceMap(board, chains)
    {
	let result = new Int8Array(board.data.length);
	for(let i=0;i<result.length;i++)
	    result[i] = -1;

	let queue = [];

	for(let chain of chains)
	    for(let point of chain.points)
	{
	    queue.push([point % board.width, Math.floor(point / board.width)]);
	    result[point] = 0;
	}

	let newQueue = [];
	let distance = 0;

	let enqueue = (queue, x, y) => {
	    if(x < 0 || x >= board.width)
		return;
	    if(y < 0 || y >= board.height)
		return;

	    let id = x + y * board.width;
	    if(board.getValue(id) != 0)
		return;

	    if(result[id] != -1)
		return;
	    result[id] = distance;

	    queue.push([x, y]);
	};

	while(queue.length > 0)
	{
	    distance++;

	    for(let [x, y] of queue)
	    {
		enqueue(newQueue, x-1, y);
		enqueue(newQueue, x+1, y);
		enqueue(newQueue, x, y-1);
		enqueue(newQueue, x, y+1);
	    }

	    queue = newQueue;
	    newQueue = [];
	}

	return result;
    }

    reach()
    {
	let map = Chain.distanceMap(this.board, [this]);

	let reachable = 0;
	let totalDistance = 0;

	for(let point of map)
	{
	    if(point <= 0)
		continue;
	    reachable++;
	    totalDistance += (point - 1);
	}

	if(reachable == 0)
	    return [0, 0];

	return [totalDistance / reachable / (this.board.width + this.board.height - 3), reachable];
    }
}
