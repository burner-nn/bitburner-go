import test from 'ava';
import { Board } from './board.js';
import { Chain } from './chain.js';
import { State } from './state.js';

test("Making state", t => {
    let board = Board.fromImage(["X_X", "WWB"], "B", false);
    let state = State.fromBoard(board);

    t.is(state.chains.neutral.length, 1);
    t.deepEqual(state.chains.neutral[0].points, [1]);

    t.is(state.chains.player.length, 1);
    t.deepEqual(state.chains.player[0].points, [5]);

    t.is(state.chains.opponent.length, 1);
    t.deepEqual(state.chains.opponent[0].points, [3, 4]);
});

test("State to string", t => {
    let board = Board.fromImage(
	["W_W",
	 "W_B",
	 "B_X"], "W", true);
    let state = State.fromBoard(board);

    t.deepEqual(state.toStrings(),
		["W (pass)",
		 "W_W   N: <C0 _ PS:3 CN:[P:3,O:2]>",
		 "W_B   P: <C0 W PS:2 CN:2>",
		 "B_X      <C1 W PS:1 CN:1>",
		 "      O: <C0 B PS:1 CN:1>",
		 "         <C1 B PS:1 CN:1>"]);
});

test("Board scoring", t => {
    let board = Board.fromImage(["X__", "WWW", "__B", "BB_"], "W", false);
    let state = State.fromBoard(board, null);

    t.deepEqual(state.areaScore(), [5, 4]);
    t.deepEqual(state.pieceScore(), [3, 3]);
});

test("Chain scoring", t => {
    let board = Board.fromImage([
	"_BB",
	"XW_",
	"_B_",
	"___"], "B", false);
    let state = State.fromBoard(board, null);

    t.true(state.chainScore()[0] > state.chainScore()[1]);
});

test("Chain owned scoring", t=> {
    let board = Board.fromImage([
	"_W_",
	"X_X",
	"_B_"],	"W", false);
    let state = State.fromBoard(board, null);

    t.is(state.chainScore()[0], state.chainScore()[1]);
});

test("Proper eyes", t => {
    let board = Board.fromImage([
	"B_B",
	"WX_"], "B", true);
    let state = State.fromBoard(board, null);

    t.true(state.chainScore()[0] > state.chainScore()[1]);
});
				

/*
test("Depth adjustment", t => {
    let board = Board.fromImage([
	"_B_",
	"_W_",
	"B__"], "W", false);
    let state = State.fromBoard(board, board.depthMap());
    t.is(state.depthScale, 6 / 9);

    t.deepEqual(state.chainScore(), [0.75, 0.5]);
    
});
*/

test("Valid moves", t => {
    let board = Board.fromImage([
	"X__X",
	"BBWW",
	"____"], "W", false);
    let state = State.fromBoard(board);

    t.deepEqual(Array.from(state.validMoves().keys()), [null, 1, 2, 8, 9, 10, 11]);
});

test("No suicide", t => {
    let board = Board.fromImage([
	"_WW",
	"BBB",
	"_W_"], "W", false);
    let state = State.fromBoard(board);

    t.deepEqual(Array.from(state.validMoves().keys()), [null, 6, 8]);
});

test("Killing are fine", t => {
    let board = Board.fromImage([
	"W_X",
	"BBB"], "B", false);
    let state = State.fromBoard(board);

    t.deepEqual(Array.from(state.validMoves().keys()), [null, 1]);
});

test("Making pass", t => {
    let board = Board.fromImage(["___"], "B", false);
    let state = State.fromBoard(board);

    let moved = state.makeMove(null);
    t.deepEqual(state.localHistory, new Set());

    t.is(moved.depthMap, state.depthMap);
    t.deepEqual(moved.globalHistory, new Set());
    t.deepEqual(moved.localHistory, new Set([moved.board.code()]));
    t.deepEqual(moved.board.toImage(), board.toImage());
    t.is(moved.board.player, 2);
    t.is(moved.board.isPass, true);
});

test("Making move", t => {
    let board = Board.fromImage([
	"___W",
	"BBBB"], "W", false);
    let state = State.fromBoard(board);

    let moved = state.makeMove(1);
    t.deepEqual(moved.board.toImage(), ["_W_W", "BBBB"]);
    t.is(moved.board.player, 1);
    t.is(moved.board.isPass, false);

    t.is(moved.chains.neutral.length, 2);
    t.deepEqual(moved.chains.neutral[0].points, [0]);
    t.deepEqual(moved.chains.neutral[1].points, [2]);

    t.is(moved.chains.opponent.length, 2);
    t.deepEqual(moved.chains.opponent[0].points, [1]);
    t.deepEqual(moved.chains.opponent[1].points, [3]);    
});

test("Making capture board", t => {
    let board = Board.fromImage([
	"W_",
	"BB"], "W", false);
    let state = State.fromBoard(board);

    let moved = state.makeMove(1);
    t.deepEqual(moved.board.toImage(), ["WW", "__"]);
    t.is(moved.board.player, 1);
    t.is(moved.board.isPass, false);

    t.is(moved.chains.neutral.length, 1);
    t.deepEqual(moved.chains.neutral[0].points, [2, 3]);

    t.is(moved.chains.player.length, 0);

    t.is(moved.chains.opponent.length, 1);
    t.deepEqual(moved.chains.opponent[0].points, [0, 1]);
});

test("Can't repeat states", t => {
    let board = Board.fromImage(["__"], "W", false);
    let state = State.fromBoard(board);

    state = state.makeMove(0);
    state = state.makeMove(1);

    t.deepEqual(Array.from(state.validMoves().keys()), [null]);
});

test("No t1 eyes", t => {
    let board = Board.fromImage([
	"X_X__",
	"_B___",
	"_____"]);
    let state = State.fromBoard(board);

    t.is(state.chainScore()[0], 0);
    t.true(state.chainScore()[1] > 0);
});

test("Chain scores", t => {
    let b1 = Board.fromImage([
	"___",
	"_W_",
	"_W_",
	"WW_",
	"___"], "W", false);
    let s1 = State.fromBoard(b1);

    let b2 = Board.fromImage([
	"___",
	"_W_",
	"_W_",
	"_W_",
	"_W_"], "W", false);
    let s2 = State.fromBoard(b2);

    t.is(s2.chainScore()[0] > s1.chainScore()[0], true);
});

test("Distance map", t=> {
    let board = Board.fromImage(
	["_X__B",
	 "X_W_X",
	 "___XB",
	 "_____"], "B", false);
    let state = State.fromBoard(board);

    let map = Chain.distanceMap(board, state.chains.player);
    t.deepEqual(Array.from(map),
		[-1, -1,  2,  1,  0,
		 -1,  6, -1,  2, -1,
		 6,   5,  4, -1,  0,
		 5,   4,  3,  2,  1]);
});
