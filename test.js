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
				{ id: 'a', label: 'link1a', url: 'http://link1a.com', clicks: [] },
				{ id: 'b', label: 'link1b', url: 'http://link1b.com', clicks: [] }
			] },
			{ id: '2', title: 'collection2', expanded: true, totalClicks: 0, links: [
				{ id: 'c', label: 'link2c', url: 'http://link2c.com', clicks: [] },
				{ id: 'd', label: 'link2d', url: 'http://link2d.com', clicks: [1518430612110] }
			] },
			{ id: '3', title: 'collection3', expanded: true, totalClicks: 0, links: [
				{ id: 'e', label: 'link3e', url: 'http://link3e.com', clicks: [] },
				{ id: 'f', label: 'link3f', url: 'http://link3f.com', clicks: [] }
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

// Move links
test.todo('display move links gui');
test.todo('move links via gui');

// Add links
test.todo('add new link via gui');
test.todo('add new link via keyboard');

// Add collections
test.todo('add collection via gui');
test.todo('add collection via keyboard');

// Use search bar
test.todo('search for links');
test.todo('search for links and move through found link list with keyboard');
test.todo('search for links and click on link');
test.todo('navigate to url via search bar');
test.todo('perform a web search via search bar');
test.todo('clear search bar with escape');
test.todo('focus search bar after escape in search list');
test.todo('focus search bar via shortkeys after tapping');

// Collections
test.todo('toggle collection via mouse');
test.todo('toggle collection via keyboard');

// Links
test.todo('activate link via mouse');
test.todo('activate link via keyboard');

// await new Promise(resolve => {
// 	setTimeout(resolve, 300000);
// })
