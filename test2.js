import test from 'ava';
import {Chain} from './chain.js';

test("chain 2", t => {
    t.is(new Chain("W").color, "W");
});
