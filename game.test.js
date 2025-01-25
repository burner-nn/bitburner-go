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
