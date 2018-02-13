import { Store } from 'svelte/store.js';
import pipe from 'lodash/fp/pipe';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import pick from 'lodash/fp/pick';

class LinksStore extends Store {
	async updateStore(newState) {
		const collections = { collections: newState.collections };
		localStorage.setItem('state', JSON.stringify(collections));
		this.set(newState);
	}

	addLink(collectionId, label, url) {
		const collections = this.get('collections').map(collection => {
			if (collection.id === collectionId) {
				const newCollection = Object.assign({}, collection);
				newCollection.links.push({
					id: `${Date.now()}`,
					label: label || '',
					url: url || '',
					clicks: [],
				})
				return newCollection;
			} else {
				return collection
			}
		})
		this.updateStore({ collections });
	}
	addCollection() {
		const collections = this.get('collections').concat({
			id: `${Date.now()}`,
			title: '',
			expanded: true,
			links: []
		});
		this.updateStore({ collections });
	}
	updateLink(collectionId, newLinkState) {
		const collections = this.get('collections').map(collection => {
			if (collection.id === collectionId) {
				const newCollection = Object.assign({}, collection);
				newCollection.links = newCollection.links
					.map(link => link.id !== newLinkState.id ? link : newLinkState)
					.sort((a, b) => a.clicks.length - b.clicks.length)
					.reverse();

				return newCollection;
			} else {
				return collection;
			}
		});

		this.updateStore({ collections });
	}
	updateTitle(collectionId, newTitle) {
		const collections = this.get('collections').map(collection => {
			if (collection.id === collectionId) {
				const newCollection = Object.assign({}, collection);
				newCollection.title = newTitle;
				return newCollection;
			} else {
				return collection
			}
		})
		this.updateStore({ collections });
	}
	deleteLink(collectionId, linkId) {
		const collections = this.get('collections').map(collection => {
			if (collection.id === collectionId) {
				const newCollection = Object.assign({}, collection);
				newCollection.links = newCollection.links.filter(link => link.id !== linkId);
				return newCollection;
			} else {
				return collection;
			}
		});
		this.updateStore({ collections });
	}
	deleteCollection(collectionId) {
		const collections = this.get('collections').filter(collection => collection.id !== collectionId);
		this.updateStore({ collections });
	}
	expandCollection(collectionId, expanded) {
		const collections = this.get('collections').map(collection => {
			if (collection.id === collectionId) {
				collection.expanded = expanded;
			}
			return collection;
		});
		this.updateStore({ collections });
	}
}

const initialValue = {
	collections: [],
	searchValue: ''
};
const collections = JSON.parse(localStorage.getItem('state') || "{}");
const store = new LinksStore(Object.assign({}, initialValue, collections));
const defaultSearchLinks = searchValue => [
	{ collection: 'Web search:', label: searchValue, url: `https://duckduckgo.com/?q=${searchValue}` },
	{ collection: 'Navigate to:', label: searchValue, url: /^http/.test(searchValue) ? searchValue : `http://${searchValue}` },
]

store.compute(
	'searchedlinks',
	['collections', 'searchValue'],
	(collections, searchValue) => {
		const foundLinks = collections
			.map(collection => searchCollection(collection, searchValue))
			.reduce((list, collection) => {
				const links = collection.links.map(link => Object.assign({}, link, { collection: collection.title }))
				return list.concat(links);
			}, [])
		return foundLinks.length ? foundLinks : defaultSearchLinks(searchValue);
	}
)

store.compute(
	'filteredCollections',
	['collections', 'searchValue'],
	(collections, searchValue) => 
		searchValue === ''
			? collections
			: collections
				.map(collection => searchCollection(collection, searchValue))
				.filter(collection => collection.links.length)
)

store.compute(
	'sortedCollections', 
	['collections'], 
	sortCollections
)

store.compute(
	'collectionNames', 
	['collections'], 
	pipe(sortCollections, map(pick(['title', 'id'])))
)

function sortCollections(collections) {
	return collections
		.map(collection => {
			return Object.assign({}, collection, { totalClicks: getTotalClicks(collection.links) })
		})
		.sort((a, b) => a.totalClicks - b.totalClicks)
		.reverse()
}

function getTotalClicks(links) {
	return links.reduce((total, link) => total + link.clicks.length, 0);
}

function searchCollection(collection, searchValue) {
	const testString = doesStringMatchSearchValue(searchValue);
	const links = collection.links.filter(link => testString(`${link.label} ${collection.title}`));
	return Object.assign({}, collection, { links });
}

function getWordsFromString(str) {
	return str.split(' ');
}

function getREFromString(str) {
	return new RegExp(str, 'i');
}

function doesStringMatchSearchValue(sv) {
	return function getTestPipeline(string) {
		return pipe(
			getWordsFromString, 
			filter(str => str.length), 
			map(getREFromString),
			stringMatchesEveryRE(string),
		)(sv);
	}
}

function stringMatchesEveryRE(str) {
	return function testREsOnString(res) { 
		return res.every(re => str.match(re));
	}
}
// store.observe('collections', collections => {
// 	const now = new Date(Date.now());
// 	const hours = `${now.getHours()}`.length === 1 ? `0${now.getHours()}` : now.getHours();
// 	const minutes = `${now.getMinutes()}`.length === 1 ? `0${now.getMinutes()}` : now.getMinutes();
// 	const seconds = `${now.getSeconds()}`.length === 1 ? `0${now.getSeconds()}` : now.getSeconds();
// 	console.log(`[${hours}:${minutes}:${seconds}] - Collections changed`);
// });

window.store = store;
export default store;
