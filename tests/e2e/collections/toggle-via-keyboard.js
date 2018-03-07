const {
	collectionSelector: _collectionSelector,
	goIntoEditMode,
	pause,
} = require('../test-utils');

async function test (browser, url, t) {
	const page = await browser.newPage();
	await page.goto(url, { waitUntil: 'load' });

	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Enter');

	await pause(100);

	const firstCollectionSelector = _collectionSelector(1);
	const isOpen = await page.$eval(`${firstCollectionSelector} details`, el => el.getAttribute('open'));
	const collections = await page.evaluate(() => window.store.get('collections'));
	const isExpanded = collections[0].expanded;

	t.is(isOpen, null);
	t.is(isExpanded, false);
}

module.exports = test;
