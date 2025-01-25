import test from 'ava';
import {Chain} from './chain.js';

test("chain", t => {
    t.is(new Chain("W").color, "W");
});
