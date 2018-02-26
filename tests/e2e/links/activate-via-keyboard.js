const {
	collectionSelector: _collectionSelector, 
	linkListSelector: _linkListSelector,
	goIntoEditMode,
	pause,
} = require('../test-utils');

async function test (browser, url, t) {
	const page = await browser.newPage();
	await page.goto(url, { waitUntil: 'load' });

	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Enter');

	await pause(100)

	t.is(page.url(), 'http://localhost:5000/link2c'); 
}

module.exports = test;
