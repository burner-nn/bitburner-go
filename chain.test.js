import test from 'ava';
import {Board} from './board.js';
import {NeutralChain, Chain} from './chain.js';

test("basic chain", t => {
    let chain = new Chain("board", 123, "a color");

    t.is(chain.board, "board");
    t.is(chain.id, 123);
    t.is(chain.color, "a color");
    t.deepEqual(chain.points, []);
    t.deepEqual(chain.connections, []);
    t.deepEqual(chain.connectors, []);
});

test("chain to string", t => {
    let chain = new Chain(new Board([], 4, 3, "me", false), 42, 1);
    chain.points = [1, 4, 10, 500, 2000];
    chain.connections = [1, 10, 100, 500];

    t.is(chain.toString(), "<C42 B PS:5 CN:4>");
});

test("neutral chain", t => {
    let chain = new NeutralChain(new Board([], 2, 2, "me", false), 12);
    chain.points = [2];
    chain.playerConnections=[1, 3, 5];
    chain.opponentConnections = [4, 6];

    t.is(chain.toString(), "<C12 _ PS:1 CN:[P:3,O:2]>");
});

test("chains from board", t => {
    let board = Board.fromImage(
	["X_W_X",
	 "__W__",
	 "_BBW_"],
	"W",
	false);

    let chains = Chain.fromBoard(board);

    t.is(chains.neutral.length, 2);

    t.is(chains.neutral[0].id, 0);
    t.deepEqual(chains.neutral[0].points, [1, 5, 6, 10]);
    t.deepEqual(chains.neutral[0].playerConnections, [2, 7]);
    t.deepEqual(chains.neutral[0].opponentConnections, [11]);

    t.is(chains.neutral[1].id, 1);
    t.deepEqual(chains.neutral[1].points, [3, 8, 9, 14]);
    t.deepEqual(chains.neutral[1].playerConnections, [2, 7, 13]);
    t.deepEqual(chains.neutral[1].opponentConnections, []);

    t.is(chains.player.length, 2);

    t.is(chains.player[0].id, 0);
    t.deepEqual(chains.player[0].points, [2, 7]);
    t.deepEqual(chains.player[0].connections, [1, 3, 6, 8]);

    t.is(chains.player[1].id, 1);
    t.deepEqual(chains.player[1].points, [13]);
    t.deepEqual(chains.player[1].connections, [8, 14]);

    t.is(chains.opponent.length, 1);
    t.is(chains.opponent[0].id, 0);
    t.deepEqual(chains.opponent[0].points, [11, 12]);
    t.deepEqual(chains.opponent[0].connections, [6, 10]);
});

test("applying chain to board", t => {
    let board = Board.fromImage(
	["XWWWX",
	 "BBXBB",
	 "WWBBB"],
	"W",
	true);
    let chain = new Chain(board, 1, 0);
    chain.points = [5, 6, 11, 12, 13, 9, 3];

    chain.apply(board);

    t.deepEqual(board.toImage(),
		["XWW_X",
		 "__XB_",
		 "W___B"]);
});

test("Reach", t => {
    let board = Board.fromImage(
	["X__",
	 "_W_",
	 "X_X"], "W", true);

    let chain = new Chain(board, 0, 2);
    chain.points.push(4);

    t.deepEqual(chain.reach(), [1 / 5 / 3, 5]);
});
    
