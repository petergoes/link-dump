const {
	searchListLink,
	pause,
} = require('../test-utils');

async function test (browser, url, t) {
	const page = await browser.newPage();
	await page.goto(url, { waitUntil: 'load' });

	await page.keyboard.down('Shift');
	await page.keyboard.down('Meta');
	await page.keyboard.press('KeyF');
	await page.keyboard.up('Shift');
	await page.keyboard.up('Meta');

	await page.keyboard.type('link2');

	const firstLink = await page.$eval(`${searchListLink(1)}`, el => el.innerText);
	const secondLink = await page.$eval(`${searchListLink(2)}`, el => el.innerText);
	t.is(firstLink, 'link2c - collection2 (Undefined Group)');
	t.is(secondLink, 'link2d - collection2 (Undefined Group)');
}

module.exports = test;
