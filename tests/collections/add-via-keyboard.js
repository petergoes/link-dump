const {
	groupSelector: _groupSelector, 
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
	await page.keyboard.press('KeyN');
	await page.keyboard.up('Control');
	await page.keyboard.up('Alt');
	await page.keyboard.up('Meta');

	await page.keyboard.type('collection4');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Enter');
	
	await pause(100);
	
	const fourthCollectionSelector = _collectionSelector(4);
	const fourthCollectionTitle = await page.$eval(`${fourthCollectionSelector} .title`, el => el.innerHTML);

	t.is(fourthCollectionTitle, 'collection4');
}

module.exports = test;
