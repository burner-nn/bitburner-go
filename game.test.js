import test from 'ava';
import { Board } from './board.js';
import { Game } from './game.js';

test("Making game", t => {
    let board = Board.fromImage([
	"_____",
	"_____",
	"_____",
	"_____",
	"_____"], "W", false);

    let game = Game.fromBoard(board);
    t.is(game.state.board, board);

    t.deepEqual(game.history, new Set([board.code()]));
    t.is(game.state.globalHistory, game.history);
    t.deepEqual(game.depthMap, board.depthMap());
    t.is(game.state.depthMap, game.depthMap);
});

test("Making game with history", t => {
    let board = Board.fromImage(["W_"], "B", false);
    let game = Game.fromBoard(board);

    game.addHistory(Board.fromImage(["_B"], "W", false));
    game.addHistory(Board.fromImage(["__"], "B", false));

    t.deepEqual(Array.from(game.state.validMoves().keys()), [null]);
});

test("Making moves", t => {
    let board = Board.fromImage(
	["___",
	 "___",
	 "___"], "B", false);
    let game = Game.fromBoard(board);

    game.makeMove(4);
    game.makeMove(3);
    game.makeMove(6);
    game.makeMove(0);
    game.makeMove(2);
    game.makeMove(8);
    game.makeMove(1);

    t.is(game.state.board.player, 2);
    t.is(game.state.board.isPass, false);
    t.deepEqual(game.state.board.toImage(),
		["_BB",
		 "_B_",
		 "B_W"]);
    t.deepEqual(Array.from(game.state.validMoves().keys()), [null, 0, 3, 5, 7]);
});

test("Game bug", t => {
    let board = Board.fromImage(
	["_WW_B",
	 "_BWW_",
	 "BBBWX",
	 "_BBWW",
	 "__BW_"], "B", false);
    let game = Game.fromBoard(board);

    game.makeMove(20);
    game.makeMove(24);
    game.makeMove(0);
    game.makeMove(5);

    t.is(game.state.validMoves().has(0), false);
});
    
test("Depth 0 best move", t => {
    let board = Board.fromImage(
	["W_",
	 "X_"], "B", false);
    t.is(Game.fromBoard(board).findBestMove(0), 1);
});

test("Depth 1 best move", t => {
    let board = Board.fromImage(
	["W___W",
	 "XXXX_"], "B", false);


    let g = Game.fromBoard(board);
    t.is(Game.fromBoard(board).findBestMove(5), 3);
});

test("Going deep", t => {
    let board = Board.fromImage(
	["_____",
	 "_____",
	 "_____",
	 "_____",
	 "_____"], "B", false);
    let g = Game.fromBoard(board);

    let now = Date.now();
    let move = g.findBestMove(3);
    console.log("Passed: " + (Date.now() - now));
    console.log("Checked: " + g._totalStates);

    t.is(move, 12);
});

test("Bug", t => {
    let board = Board.fromImage(
	["_BXW_",
	 "BBWWW",
	 "B_BWW",
	 "BBBB_",
	 "____X"], "B", true);
    let game = Game.fromBoard(board);

    console.log("Move: " + game.findBestMove(3));
});
