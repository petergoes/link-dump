import { Store } from 'svelte/store.js';
import pipe from 'lodash/fp/pipe';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import pick from 'lodash/fp/pick';
import { 
	doesStringMatchSearchValue, 
	removeItemFromArray,
	addItemIfMissing,
	addInFront,
} from './utils';

class LinksStore extends Store {
	async updateStore(newState) {
		const collections = { collections: newState.collections };
		const isTest = localStorage.getItem('is-test');
		if (!isTest) {
			Object.keys(newState).forEach(key => {
				localStorage.setItem(key, JSON.stringify(newState[key]));
			});
		}
		this.set(newState);
	}

	addLink(collectionId, label, url) {
		const currentLinks = this.get('links');
		const currentlinkToCollectionMap = this.get('linkToCollectionMap');
		const id = `${Date.now()}`;
		const linkItem = { id, label, url, clicks: [] }
		const linkToCollectionMapItem = { linkId: id, collectionId };
		const links = currentLinks.concat(linkItem);
		const linkToCollectionMap = currentlinkToCollectionMap.concat(linkToCollectionMapItem);

		this.updateStore({ links, linkToCollectionMap });
	}
	addCollection(title) {
		const id = `${Date.now()}`;
		const collectionsMetaDataItem = { id, title };
		const collectionsMetaData = addInFront(this.get('collectionsMetaData'), collectionsMetaDataItem);
		const expandedCollections = addItemIfMissing(this.get('expandedCollections'), id);
		this.updateStore({ collectionsMetaData, expandedCollections });
	}
	updateLink(newLinkState) {
		const id = newLinkState.id;
		const links = this.get('links')
			.map(link => link.id === id ? newLinkState : link);

		this.updateStore({ links });
	}
	updateTitle(collectionId, newTitle) {
		const collectionsMetaData = this.get('collectionsMetaData')
			.map(collection => 
				collection.id === collectionId
					? Object.assign({}, collection, { title: newTitle })
					: collection
			)

		this.updateStore({ collectionsMetaData });
	}
	deleteLink(linkId) {
		const links = this.get('links')
			.filter(link => link.id !== linkId);
		const linkToCollectionMap = this.get('linkToCollectionMap')
			.filter(map => map.linkId !== linkId);

		this.updateStore({ links, linkToCollectionMap });
	}
	deleteCollection(collectionId) {
		this.get('linkToCollectionMap')
			.filter(map => map.collectionId === collectionId)
			.map(map => map.linkId)
			.forEach(id => this.deleteLink(id));

		const collectionsMetaData = this.get('collectionsMetaData').filter(data => data.id !== collectionId);
		const expandedCollections = removeItemFromArray(this.get('expandedCollections'), collectionId);

		this.updateStore({ collectionsMetaData, expandedCollections });
	}
	expandCollection(collectionId, expanded) {
		const currentExpandedCollections = this.get('expandedCollections');
		const expandedCollections = expanded 
			? addItemIfMissing(currentExpandedCollections, collectionId)
			: removeItemFromArray(currentExpandedCollections, collectionId)

		this.updateStore({ expandedCollections });
	}
	moveLink(linkId, collectionId) {
		const linkToCollectionMap = this.get('linkToCollectionMap')
			.map(map => (map.linkId !== linkId) 
				? map
				: Object.assign({}, map, { collectionId })
			)
		this.updateStore({ linkToCollectionMap });
	}
}

const initialValue = { 
	expandedCollections: [],
	collectionsMetaData: [], 
	links: [],
	linkToCollectionMap: [],
	searchValue: ''
};

const twoWeeks = 14 * 24 * 60 * 60 * 1000;
const twoWeeksAgo = Date.now() - twoWeeks;

const expandedCollections = JSON.parse(localStorage.getItem('expandedCollections') || "[]");
const collectionsMetaData = JSON.parse(localStorage.getItem('collectionsMetaData') || "[]");
const links = JSON.parse(localStorage.getItem('links') || "[]");
const linkToCollectionMap = JSON.parse(localStorage.getItem('linkToCollectionMap') || "[]");
const store = new LinksStore(Object.assign({}, initialValue, { expandedCollections, collectionsMetaData, links, linkToCollectionMap }));
const defaultSearchLinks = searchValue => {
	const list = [];
	const websearch = { collection: 'Web search:', label: searchValue, url: `https://duckduckgo.com/?q=${searchValue}` };
	const navigate = { collection: 'Navigate to:', label: searchValue, url: /^http/.test(searchValue) ? searchValue : `http://${searchValue}` };
	const isUrl = /\.|:/.test(searchValue);
	return isUrl ? [navigate, websearch] : [websearch, navigate];
}

store.compute(
	'collections',
	['collectionsMetaData', 'links', 'linkToCollectionMap', 'expandedCollections'],
	(collectionsMetaData, links, linkToCollectionMap, expandedCollections) => {
		const collections = collectionsMetaData
			.map(collection => {
				const linksInCollection = linkToCollectionMap
					.filter(map => map.collectionId === collection.id)
					.map(map => links.find(link => map.linkId === link.id));
				const expanded = expandedCollections.includes(collection.id);
				const totalClicks = getTotalClicks(linksInCollection);
				return Object.assign({}, collection, 
					{ 
						links: linksInCollection,
						expanded,
						totalClicks,
					}
				);
			});
		return sortCollections(collections);
	})

store.compute(
	'linkToCollectionObjectMap',
	['linkToCollectionMap'],
	linkToCollectionMap => linkToCollectionMap
		.reduce((result, mapItem) => {
			result[`${mapItem.linkId}`] = mapItem.collectionId;
			return result;
		}, {})
	)

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

function sortCollections(collections = []) {
	return collections
		.sort((a, b) => a.totalClicks - b.totalClicks)
		.reverse()
}

function getTotalClicks(links) {
	return links.reduce((total, link) => {
		const recentClicks = link.clicks.filter(click => click > twoWeeksAgo)
		return total + recentClicks.length;
	}, 0);
}

function searchCollection(collection, searchValue) {
	const testString = doesStringMatchSearchValue(searchValue);
	const links = collection.links.filter(link => testString(`${link.label} ${collection.title}`));
	return Object.assign({}, collection, { links });
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
