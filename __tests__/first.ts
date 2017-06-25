
import {sum, minus} from '../src/code';

it('adds 1 + 2 to equal 3 in Typescript', () => {
    expect(sum(1, 2)).toBe(3);
});

it('adds 1 + 2 to equal 3 in JavaScript', () => {
    expect(sum(1, 2)).toBe(3);
});

it('makes sure coverage works', () => {
   expect(minus(2, 1)).toBe(1);
});
