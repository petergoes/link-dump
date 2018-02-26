const {
	collectionSelector: _collectionSelector, 
	linkListSelector: _linkListSelector,
	goIntoEditMode,
	pause,
} = require('../test-utils');

async function test (browser, url, t) {
	const page = await browser.newPage();
	page.on('dialog', async dialog => {
		await dialog.accept();
	});

	await page.goto(url, { waitUntil: 'load' });


	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');

	await goIntoEditMode(page);

	await page.keyboard.press('Tab');
	await page.keyboard.press('Enter');

	await pause(100);

	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Enter');

	await pause(100);

	const firstCollectionSelector = _collectionSelector(1);
	const linkListSelector = _linkListSelector();
	const firstCollectionTotalLinks = await page.$$eval(`${firstCollectionSelector} ${linkListSelector} > *`, el => el.length);

	t.is(firstCollectionTotalLinks, 1);
}

module.exports = test;
