import test from 'ava';
import { Board } from './board.js';

test("Making board", t => {
    let board = Board.fromImage(
	["X__X",
	 "BB_W",
	 "_WBW",
	 "XXX_"],
	"W",
	true);

    t.is(board.player, 2);
    t.is(board.opponent, 1);

    t.is(board.isPass, true);

    t.is(board.getValue(0), 3);
    t.is(board.getValue(1), 0);
    t.is(board.getValue(2), 0);
    t.is(board.getValue(3), 3);
    t.is(board.getValue(4), 1);
    t.is(board.getValue(5), 1);
    t.is(board.getValue(6), 0);
    t.is(board.getValue(7), 2);
    t.is(board.getValue(8), 0);
    t.is(board.getValue(9), 2);
    t.is(board.getValue(10), 1);
    t.is(board.getValue(11), 2);
    t.is(board.getValue(12), 3);
    t.is(board.getValue(13), 3);    
    t.is(board.getValue(14), 3);
    t.is(board.getValue(15), 0);

    board.setValue(10, 3);
    t.is(board.getValue(10), 3);

    t.deepEqual(board.toStrings(),
	 ["W (pass)",
	  "X__X",
	  "BB_W",
	  "_WXW",
	  "XXX_"]);
});

test("Board packing", t => {
    let board = Board.fromImage(
	["X_W_X",
	 "BBXBB",
	 "BW_X_"],
	"B",
	false);

    t.is(board.pack(), BigInt(844586124));
    t.deepEqual(Board.unpack(board.pack(), board.width, board.height).toStrings(),
		["B",
		 "X_W_X",
		 "BBXBB",
		 "BW_X_"]);

    let board2 = Board.fromImage(["X"],	"W", true);
    t.is(board2.pack(), BigInt(15));
    t.deepEqual(Board.unpack(board2.pack(), board2.width, board2.height).toStrings(),
		["W (pass)",
		 "X"]);
});

/*
test("Depth map", t => {
    let board = Board.fromImage(
	["X_W_X",
	 "__X__",
	 "BBWBW",
	 "WWWWW",
	 "_____"],
	"B", true);
    
    t.deepEqual(board.diameterMap(),
		[-1, 7, 6, 7, -1,
		 7, 6, -1, 6, 7,
		 6, 5, 4, 5, 6,
		 6, 5, 5, 5, 6,
		 7, 6, 6, 6, 7]);
    t.deepEqual(board.depthMap(),
		[-1, 1, 2/3, 1, -1,
		 1, 2/3, -1, 2/3, 1,
		 2/3, 1/3, 0, 1/3, 2/3,
		 2/3, 1/3, 1/3, 1/3, 2/3,
		 1, 2/3, 2/3, 2/3, 1]);
});

test("Depth map 2", t => {
    let board = Board.fromImage(
	["X____",
	 "_____",
	 "____X",
	 "X____",
	 "_____"], "W", false);

    t.deepEqual(board.diameterMap(),
		[-1, 7, 6, 7, 8,
		 7, 6, 5, 6, 7,
		 6, 5, 4, 5, -1,
		 -1, 6, 5, 5, 6,
		 8, 7, 6, 6, 7]);
    t.deepEqual(board.depthMap(),
		[-1, 3/4, 1/2, 3/4, 1,
		 3/4, 1/2, 1/4, 1/2, 3/4,
		 1/2, 1/4, 0, 1/4, -1,
		 -1, 1/2, 1/4, 1/4, 2/4,
		 1, 3/4, 1/2, 1/2, 3/4]);
});

test("Depth map 3", t => {
    let board = Board.fromImage(
	["__X__",
	 "_____",
	 "_____",
	 "_____",
	 "_____"]);
    console.log(board.heatMap());
    t.deepEqual(board.depthMap(),
		[1,   0.75,   -1, 0.75,    1,
		 0.75, 0.5, 0.25,  0.5, 0.75,
		 0.5 ,0.25,    0,  0.25, 0.5,
		 0.75, 0.5, 0.25,   0.5,0.75,
		 1   ,0.75,  0.5,  0.75,   1]);
});

test("Board to image", t => {
    let image = ["X_BWW",
		 "__WWX",
		 "BBXWX"];
    let board = Board.fromImage(image, "W", false);

    t.deepEqual(board.toImage(), image);
});
*/
