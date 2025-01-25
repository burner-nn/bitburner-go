import test from 'ava';
import { Point } from './point.js';

test("Point access", t => {
    t.is(Point.x(1000), 232);
    t.is(Point.y(1000), 3);
});

test("Point to string", t => {
    t.is(Point.toString(666), "(154,2)");
});

test("Point from XY", t => {
    t.is(Point.fromXY(8, 5), 1288);
});
