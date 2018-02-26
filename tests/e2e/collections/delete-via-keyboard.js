const {
	groupSelector: _groupSelector,
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

	await goIntoEditMode(page);

	await page.keyboard.press('Tab');
	await page.keyboard.press('Enter');

	await pause(100);

	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Enter');

	await pause(100);

	const groupSelector = _groupSelector();
	const totalCollections = await page.$$eval(`${groupSelector} > *`, el => el.length);

	t.is(totalCollections, 2);
}

module.exports = test;
