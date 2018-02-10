import { Store } from 'svelte/store.js';

class LinksStore extends Store {
	async updateStore(newState) {
		const collections = { collections: newState.collections };
		localStorage.setItem('state', JSON.stringify(collections));
		this.set(newState);
	}

	addLink(collectionId) {
		const collections = this.get('collections').map(collection => {
			if (collection.id === collectionId) {
				const newCollection = Object.assign({}, collection);
				newCollection.links.push({
					id: Date.now(),
					label: '',
					url: '',
					clicks: 0,
					lastClicked: 0,
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
			id: Date.now(),
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
					.sort((a, b) => a.clicks - b.clicks)
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

store.compute(
	'filteredCollections',
	['collections', 'searchValue'],
	(collections, searchValue) => 
		searchValue === ''
			? collections
			: collections
				.map(collection => {
					const filteredLinks = collection.links.filter(
						link => link.label.match(new RegExp(searchValue, 'i')))
					return Object.assign({}, collection, {links: filteredLinks});
				})
				.filter(collection => collection.links.length)
)
// store.observe('collections', collections => {
// 	const now = new Date(Date.now());
// 	const hours = `${now.getHours()}`.length === 1 ? `0${now.getHours()}` : now.getHours();
// 	const minutes = `${now.getMinutes()}`.length === 1 ? `0${now.getMinutes()}` : now.getMinutes();
// 	const seconds = `${now.getSeconds()}`.length === 1 ? `0${now.getSeconds()}` : now.getSeconds();
// 	console.log(`[${hours}:${minutes}:${seconds}] - Collections changed`);
// });

window.store = store;
export default store;
