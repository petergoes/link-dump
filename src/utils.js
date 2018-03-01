import pipe from 'lodash/fp/pipe';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import curry from 'lodash/fp/curry';

function cloneArray(arr) {
	return JSON.parse(JSON.stringify(arr));
}

function getWordsFromString(str) {
	return str.split(' ');
}

function getREFromString(str) {
	return new RegExp(str, 'i');
}

const stringMatchesEveryRE = curry(
	function stringMatchesEveryRECurried(str, res) {
		return res.every(re => str.match(re));
	}
)

export const doesStringMatchSearchValue = curry(
	function doesStringMatchSearchValueCurried(sv, string) {
		return pipe(
			getWordsFromString, 
			filter(str => str.length), 
			map(getREFromString),
			stringMatchesEveryRE(string),
		)(sv);
})

export const removeItemFromArray = curry(
	function removeItemFromArrayCurried(item, array) {
		return array.filter(arrayItem => arrayItem !== item);
	}
)

export const addItemIfMissing = curry(
	function addItemIfMissingCurried(item, array) {
		return array.includes(item) ? array : array.concat(item);
	}
)

export const addInFront = curry(
	function addInFrontCurried(item, array) {
		const arr = cloneArray(array);
		arr.unshift(item)
		return arr;
	}
)
