const {
	collectionSelector: _collectionSelector, 
	linkListSelector: _linkListSelector,
	goIntoEditMode,
	pause,
} = require('../test-utils');

async function test (browser, url, t) {
	const page = await browser.newPage();
	await page.goto(url, { waitUntil: 'load' });

	await page.keyboard.down('Control');
	await page.keyboard.down('Alt');
	await page.keyboard.down('Meta');
	await page.keyboard.press('KeyM');
	await page.keyboard.up('Control');
	await page.keyboard.up('Alt');
	await page.keyboard.up('Meta');

	await pause(100);

	await page.keyboard.type('link2c');	

	await page.keyboard.press('Tab');
	
	await page.keyboard.type('collection1');	

	await page.keyboard.press('Tab');

	await page.keyboard.press('Enter');

	await pause(100);

	const thirdCollectionSelector = _collectionSelector(3);
	const linkListSelector = _linkListSelector();
	const thirdCollectionTotalLinks = await page.$$eval(`${thirdCollectionSelector} ${linkListSelector} > *`, el => el.length);

	t.is(thirdCollectionTotalLinks, 2);
}

module.exports = test;
