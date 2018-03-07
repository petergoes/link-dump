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

	await page.keyboard.type('petergoes');
	
	await pause(100);

	const firstLink = await page.$eval(`${searchListLink(1)}`, el => el.innerText);

	t.is(firstLink, 'petergoes - Web search'); 
}

module.exports = test;
