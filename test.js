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
	const initialState = { 
		collections: [
			{ id: '1', title: 'collection1', expanded: true, totalClicks: 0, links: [
				{ id: 'a', label: 'link1a', url: 'http://localhost:5000/link1a', clicks: [] },
				{ id: 'b', label: 'link1b', url: 'http://localhost:5000/link1b', clicks: [] }
			] },
			{ id: '2', title: 'collection2', expanded: true, totalClicks: 0, links: [
				{ id: 'c', label: 'link2c', url: 'http://localhost:5000/link2c', clicks: [] },
				{ id: 'd', label: 'link2d', url: 'http://localhost:5000/link2d', clicks: [Date.now()] }
			] },
			{ id: '3', title: 'collection3', expanded: true, totalClicks: 0, links: [
				{ id: 'e', label: 'link3e', url: 'http://localhost:5000/link3e', clicks: [] },
				{ id: 'f', label: 'link3f', url: 'http://localhost:5000/link3f', clicks: [] }
			] }
		]
	}
	localStorage.setItem('state', JSON.stringify(initialState));
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

test('render initial view', testLoader('./tests/render-initial-view.js'));

// Links
test('add new link via keyboard', testLoader('./tests/links/add-via-keyboard.js'));
test('update link via keyboard', testLoader('./tests/links/update-via-keyboard.js'));
test('delete link via keyboard', testLoader('./tests/links/delete-via-keyboard.js'));
test('move links via gui', testLoader('./tests/links/move-via-keyboard.js'));
test('activate link via keyboard', testLoader('./tests/links/activate-via-keyboard.js'));

// Collections
test('add collection via keyboard', testLoader('./tests/collections/add-via-keyboard.js'));
test('update title via keyboard', testLoader('./tests/collections/update-via-keyboard.js'));
test('toggle collection via keyboard', testLoader('./tests/collections/toggle-via-keyboard.js'));
test('delete collection via keyboard', testLoader('./tests/collections/delete-via-keyboard.js'));

// Use search bar
test('search for links', testLoader('./tests/search-bar/search-for-links.js'));
test.todo('search for links and move through found link list with keyboard');
test.todo('search for links and click on link');
test('navigate to url via search bar', testLoader('./tests/search-bar/navigate-to.js'));
test('perform a web search via search bar', testLoader('./tests/search-bar/web-search.js'));
test.todo('clear search bar with escape');
test.todo('focus search bar after escape in search list');
test.todo('focus search bar via shortkeys after tapping');

// await new Promise(resolve => {
// 	setTimeout(resolve, 300000);
// })
