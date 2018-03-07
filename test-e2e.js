const puppeteer = require('puppeteer');
const test = require('ava');

const url = 'http://localhost:5000';

let browser;

function testLoader(testPath) {
	return function(t) { 
		return require(testPath)(browser, url, t);
	}
}

function setInitialState() {
	const expandedCollections = ["1","2","3"];
	const collectionsMetaData = [
		{"id":"1","title":"collection1"},
		{"id":"2","title":"collection2"},
		{"id":"3","title":"collection3"}
	];
	const links = [
		{"id":"a","label":"link1a","url":"http://localhost:5000/link1a","clicks":[]},
		{"id":"b","label":"link1b","url":"http://localhost:5000/link1b","clicks":[]},
		{"id":"c","label":"link2c","url":"http://localhost:5000/link2c","clicks":[]},
		{"id":"d","label":"link2d","url":"http://localhost:5000/link2d","clicks":[Date.now()]},
		{"id":"e","label":"link3e","url":"http://localhost:5000/link3e","clicks":[]},
		{"id":"f","label":"link3f","url":"http://localhost:5000/link3f","clicks":[]}
	];
	const linkToCollectionMap = [
		{"linkId":"a","collectionId":"1"},
		{"linkId":"b","collectionId":"1"},
		{"linkId":"c","collectionId":"2"},
		{"linkId":"d","collectionId":"2"},
		{"linkId":"e","collectionId":"3"},
		{"linkId":"f","collectionId":"3"}
	];
	
	localStorage.setItem('expandedCollections', JSON.stringify(expandedCollections));
	localStorage.setItem('collectionsMetaData', JSON.stringify(collectionsMetaData));
	localStorage.setItem('links', JSON.stringify(links));
	localStorage.setItem('linkToCollectionMap', JSON.stringify(linkToCollectionMap));
	localStorage.setItem('is-test', 'true');
}

async function setup() {
	browser = await puppeteer.launch({ headless: process.env.DEBUG ? false : true, sloMo: 1000 });
	const page = await browser.newPage();
	await page.goto(url);
	await page.evaluate(setInitialState); 
}

async function cleanup() {
	browser.close()
}

test.before(setup);
test.always.after('cleanup', cleanup);

test.serial('render initial view', testLoader('./tests/e2e/render-initial-view.js'));

// Links
test.serial('add new link via keyboard', testLoader('./tests/e2e/links/add-via-keyboard.js'));
test.serial('update link via keyboard', testLoader('./tests/e2e/links/update-via-keyboard.js'));
test.serial('delete link via keyboard', testLoader('./tests/e2e/links/delete-via-keyboard.js'));
test.serial('move links via gui', testLoader('./tests/e2e/links/move-via-keyboard.js'));
test.serial('activate link via keyboard', testLoader('./tests/e2e/links/activate-via-keyboard.js'));

// Collections
test.serial('add collection via keyboard', testLoader('./tests/e2e/collections/add-via-keyboard.js'));
test.serial('update title via keyboard', testLoader('./tests/e2e/collections/update-via-keyboard.js'));
test.serial('toggle collection via keyboard', testLoader('./tests/e2e/collections/toggle-via-keyboard.js'));
test.serial('delete collection via keyboard', testLoader('./tests/e2e/collections/delete-via-keyboard.js'));

// Use search bar
test.serial('search for links', testLoader('./tests/e2e/search-bar/search-for-links.js'));
test.todo('search for links and move through found link list with keyboard');
test.todo('search for links and click on link');
test.serial('navigate to url via search bar', testLoader('./tests/e2e/search-bar/navigate-to.js'));
test.serial('perform a web search via search bar', testLoader('./tests/e2e/search-bar/web-search.js'));
test.todo('clear search bar with escape');
test.todo('focus search bar after escape in search list');
test.todo('focus search bar via shortkeys after tapping');

// await new Promise(resolve => {
// 	setTimeout(resolve, 300000);
// })
