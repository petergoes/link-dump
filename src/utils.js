import pipe from 'lodash/fp/pipe';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';

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
