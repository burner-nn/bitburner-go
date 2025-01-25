import test from 'ava';
import { Board } from './board.js';
import { State } from './state.js';

test("Making state", t => {
    let board = Board.fromImage(["X_X", "WWB"], "B", false);
    let state = State.fromBoard(board, board.depthMap());

    t.deepEqual(state.depthMap, board.depthMap());

    t.is(state.chains.neutral.length, 1);
    t.deepEqual(state.chains.neutral[0].points, [1]);

    t.is(state.chains.player.length, 1);
    t.deepEqual(state.chains.player[0].points, [5]);

    t.is(state.chains.opponent.length, 1);
    t.deepEqual(state.chains.opponent[0].points, [3, 4]);
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

    t.deepEqual(state.chainScore(), [1.75, 0.25]);
});

test("Chain owned scoring", t=> {
    let board = Board.fromImage([
	"_W_",
	"X_X",
	"_B_"],	"W", false);
    let state = State.fromBoard(board, null);

    t.deepEqual(state.chainScore(), [3, 3]);
});

// depth adjusting scores
// adjustment becomes smaller as board fills

// valid moves
// pass is a move
// dead move that makes capture is valid
// dead move that extends dead chain is fine

// making boards for moves
// capture boards

// strategies decide plays
// both players get a strategy

// game 
