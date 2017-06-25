
import {sum, minus, looper} from '../src/code';

it('adds 1 + 2 to equal 3 in Typescript', () => {
    expect(sum(1, 2)).toBe(3);
});

it('adds 1 + 2 to equal 3 in JavaScript', () => {
    expect(sum(1, 2)).toBe(3);
});

it('makes sure coverage works', () => {
   expect(minus(2, 1)).toBe(1);
});

it('check continuous no-hop', () => {
   expect(looper([1,2,3,4], 1, 0)).toBe(1);
});

it('check hopping headers', () => {
    expect(looper([1,2,3,4], 4, 4)).toBe(2);
    expect(looper([1,2,3,4], 4, 3)).toBe(false);
});
