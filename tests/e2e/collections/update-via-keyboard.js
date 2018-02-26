const {
	collectionSelector: _collectionSelector,
	goIntoEditMode,
	pause,
} = require('../test-utils');

async function test (browser, url, t) {
	const page = await browser.newPage();
	await page.goto(url, { waitUntil: 'load' });

	await page.keyboard.press('Tab');

	await goIntoEditMode(page);

	await page.keyboard.press('Tab');
	await page.keyboard.press('Enter');

	await pause(100);

	await page.keyboard.press('Tab');
	await page.keyboard.down('Shift');
	await page.keyboard.press('Tab');
	await page.keyboard.up('Shift');

	await page.keyboard.press('Delete');
	await page.keyboard.type('foo');

	await page.keyboard.press('Tab');
	await page.keyboard.press('Enter');

	await pause(100);

	const firstCollectionSelector = _collectionSelector(1);
	const firstCollectionTitle = await page.$eval(`${firstCollectionSelector} .title`, el => el.innerHTML);

	t.is(firstCollectionTitle, 'foo');
}

module.exports = test;
