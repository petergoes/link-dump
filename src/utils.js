import pipe from 'lodash/fp/pipe';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';

function cloneArray(arr) {
	return JSON.parse(JSON.stringify(arr));
}

function getWordsFromString(str) {
	return str.split(' ');
}

function getREFromString(str) {
	return new RegExp(str, 'i');
}

function stringMatchesEveryRE(str) {
	return function testREsOnString(res) { 
		return res.every(re => str.match(re));
	}
}

export function doesStringMatchSearchValue(sv) {
	return function getTestPipeline(string) {
		return pipe(
			getWordsFromString, 
			filter(str => str.length), 
			map(getREFromString),
			stringMatchesEveryRE(string),
		)(sv);
	}
}

export function removeItemFromArray(array, item) {
	return array.filter(arrayItem => arrayItem !== item);
}

export function addItemIfMissing(array, item) {
	return array.includes(item) ? array : array.concat(item);
}

export function addInFront(array, item) {
	const arr = cloneArray(array);
	arr.unshift(item)
	return arr;
}
