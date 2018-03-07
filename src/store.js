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
		const isTest = localStorage.getItem('is-test');
		if (!isTest) {
			Object.keys(newState).forEach(key => {
				localStorage.setItem(key, JSON.stringify(newState[key]));
			});
		}
		this.set(newState);
	}

	followLink(id) {
		let url;
		const links = this.get('links').map(link => {
			if (link.id === id) {
				url = link.url;
				link.clicks = link.clicks.concat(Date.now());
			}
			return link;
		})
		if (url) {
			this.updateStore({ links });
			setTimeout(() => {
				window.location.replace(url);
			}, 10);
		}
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
	addCollection(groupId, title) {
		const id = `${Date.now()}`;
		const currentCollectionToGroupMap = this.get('collectionToGroupMap');
		const collectionsMetaDataItem = { id, title };
		const collectionToGroupMapItem = { collectionId: id, groupId };
		const collectionsMetaData = addInFront(collectionsMetaDataItem, this.get('collectionsMetaData'));
		const expandedCollections = addItemIfMissing(id, this.get('expandedCollections'));
		const collectionToGroupMap = currentCollectionToGroupMap.concat(collectionToGroupMapItem);
		this.updateStore({ collectionsMetaData, expandedCollections, collectionToGroupMap });
	}
	addGroup(title) {
		const id = `${Date.now()}`;
		const groupMetaDataItem = { id, title };
		const groupsMetaData = this.get('groupsMetaData').concat(groupMetaDataItem);
		const expandedGroups = addItemIfMissing(id, this.get('expandedGroups'));
		this.updateStore({ groupsMetaData, expandedGroups });
	}
	updateLink(newLinkState) {
		const id = newLinkState.id;
		const links = this.get('links')
			.map(link => link.id === id ? newLinkState : link);

		this.updateStore({ links });
	}
	updateCollectionTitle(collectionId, newTitle) {
		const collectionsMetaData = this.get('collectionsMetaData')
			.map(collection => 
				collection.id === collectionId
					? Object.assign({}, collection, { title: newTitle })
					: collection
			)

		this.updateStore({ collectionsMetaData });
	}
	updateGroupTitle(groupId, newTitle) {
		const groupsMetaData = this.get('groupsMetaData')
			.map(group => 
				group.id === groupId
					? Object.assign({}, group, { title: newTitle })
					: group
			)

		this.updateStore({ groupsMetaData });
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

		const collectionToGroupMap = this.get('collectionToGroupMap').filter(meta => meta.collectionId !== collectionId);
		const collectionsMetaData = this.get('collectionsMetaData').filter(data => data.id !== collectionId);
		const expandedCollections = removeItemFromArray(collectionId, this.get('expandedCollections'));

		this.updateStore({ collectionsMetaData, expandedCollections, collectionToGroupMap });
	}
	expandCollection(collectionId, expanded) {
		const currentExpandedCollections = this.get('expandedCollections');
		const expandedCollections = expanded 
			? addItemIfMissing(collectionId, currentExpandedCollections)
			: removeItemFromArray(collectionId, currentExpandedCollections)

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
	groupsMetaData: [],
	expandedGroups: [],
	collectionToGroupMap: [],
	expandedCollections: [],
	collectionsMetaData: [], 
	links: [],
	linkToCollectionMap: [],
	searchValue: ''
};

const twoWeeks = 14 * 24 * 60 * 60 * 1000;
const twoWeeksAgo = Date.now() - twoWeeks;

const expandedCollections = JSON.parse(localStorage.getItem('expandedCollections') || "[]");
const groupsMetaData = JSON.parse(localStorage.getItem('groupsMetaData') || "[]");
const collectionsMetaData = JSON.parse(localStorage.getItem('collectionsMetaData') || "[]");
const links = JSON.parse(localStorage.getItem('links') || "[]");
const linkToCollectionMap = JSON.parse(localStorage.getItem('linkToCollectionMap') || "[]");
const collectionToGroupMap = JSON.parse(localStorage.getItem('collectionToGroupMap') || "[]");
const store = new LinksStore(Object.assign({}, initialValue, { expandedCollections, collectionsMetaData, links, linkToCollectionMap, groupsMetaData, collectionToGroupMap }));
const defaultSearchLinks = searchValue => {
	const list = [];
	const websearch = { collection: { title: 'Web search',  group: {title: ''} }, label: searchValue, url: `https://duckduckgo.com/?q=${searchValue}` };
	const navigate =  { collection: { title: 'Navigate to', group: {title: ''} }, label: searchValue, url: /^http/.test(searchValue) ? searchValue : `http://${searchValue}` };
	const isUrl = /\.|:/.test(searchValue);
	return isUrl ? [navigate, websearch] : [websearch, navigate];
}

store.compute(
	'collections',
	['collectionsMetaData', 'links', 'linkToCollectionMap', 'expandedCollections', 'collectionToGroupMap', 'groupsMetaData'],
	(collectionsMetaData, links, linkToCollectionMap, expandedCollections, collectionToGroupMap, groupsMetaData) => {
		const collections = collectionsMetaData
			.map(collection => {
				const linksInCollection = linkToCollectionMap
					.filter(map => map.collectionId === collection.id)
					.map(map => links.find(link => map.linkId === link.id));
				const group = collectionToGroupMap
					.filter(map => map.collectionId === collection.id)
					.map(map => groupsMetaData.find(meta => meta.id === map.groupId))
					.find((_, index) => index === 0);
				const expanded = expandedCollections.includes(collection.id);
				const recentClicks = getRecentClicks(linksInCollection);
				const totalClicks = getTotalClicks(linksInCollection);
				return Object.assign({}, collection, 
					{ 
						links: linksInCollection,
						expanded,
						recentClicks,
						totalClicks,
						group,
					}
				);
			});
		return sortCollections(collections);
	})

store.compute(
	'groups',
	['groupsMetaData', 'collectionToGroupMap', 'collections'], 
	(groupsMetaData, collectionToGroupMap, collections) => {
		return groupsMetaData.map(group => {
			const collectionInGroup = collectionToGroupMap
					.filter(map => map.groupId === group.id)
					.map(map => collections.find(collection => map.collectionId === collection.id));
			return Object.assign({}, group, { collections: sortCollections(collectionInGroup) });
		});
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
				const links = collection.links.map(link => Object.assign({}, link, { collection }))
				return list.concat(links);
			}, [])
		return foundLinks.length ? foundLinks : defaultSearchLinks(searchValue);
	}
)

function sortCollections(collections = []) {
	return collections
		.sort((a, b) => a.totalClicks - b.totalClicks)
		.sort((a, b) => a.recentClicks - b.recentClicks)
		.reverse()
}

function getRecentClicks(links) {
	return links.reduce((total, link) => {
		const recentClicks = link.clicks.filter(click => click > twoWeeksAgo)
		return total + recentClicks.length;
	}, 0);
}

function getTotalClicks(links) {
	return links.reduce((total, link) => total + link.clicks.length, 0);
}

function searchCollection(collection, searchValue) {
	const testString = doesStringMatchSearchValue(searchValue);
	const links = collection.links.filter(link => testString(`${link.label} ${collection.title}`));
	return Object.assign({}, collection, { links });
}

window.store = store;
export default store;
