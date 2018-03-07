const {
	collectionsSelector: _collectionsSelector, 
	linkListSelector: _linkListSelector, 
	collectionSelector: _collectionSelector, 
	linkSelector: _linkSelector,
	pause,
} = require('../test-utils');

async function test (browser, url, t) {
	const page = await browser.newPage();
	await page.goto(url, { waitUntil: 'load' });
	
	await page.keyboard.down('Control');
	await page.keyboard.down('Alt');
	await page.keyboard.down('Meta');
	await page.keyboard.press('KeyV');
	await page.keyboard.up('Control');
	await page.keyboard.up('Alt');
	await page.keyboard.up('Meta');

	await page.keyboard.type('collection1');

	await page.keyboard.press('Tab');
	await page.keyboard.type('link1z');
	await page.keyboard.press('Tab');
	await page.keyboard.type('http://link1z.com');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Enter');
	
	await pause(100);
	
	const thirdCollectionSelector = _collectionSelector(3);
	const thirdLinkSelector = _linkSelector(3);
	const thirdCollectionSecondLinkTitle = await page.$eval(`${thirdCollectionSelector} ${thirdLinkSelector}`, el => el.innerText);

	t.is(thirdCollectionSecondLinkTitle, 'link1z');
}

module.exports = test;
