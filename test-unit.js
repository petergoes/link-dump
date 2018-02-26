import test from 'ava';

import { removeItemFromArray } from './src/utils';

test('utils - removeItemFromArray', t => {
	const original = ['1', '2', '3'];
	const expected = [ '1', '3' ];
	const result = removeItemFromArray(original, '2');

	t.is(expected, result);	
})
