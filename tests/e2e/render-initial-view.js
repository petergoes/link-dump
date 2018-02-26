const {
	groupSelector: _groupSelector, 
	linkListSelector: _linkListSelector, 
	collectionSelector: _collectionSelector, 
	linkSelector: _linkSelector,
} = require('./test-utils');

async function test (browser, url, t) {
	const page = await browser.newPage();
	await page.goto(url, { waitUntil: 'load' });

	const groupSelector = _groupSelector();
	const linkListSelector = _linkListSelector();
	const firstCollectionSelector = _collectionSelector(1);
	const secondCollectionSelector = _collectionSelector(2);
	const thirdCollectionSelector = _collectionSelector(3);
	const firstLinkSelector = _linkSelector(1);
	const secondLinkSelector = _linkSelector(2);

	const totalCollections = await page.$$eval(`${groupSelector} > *`, el => el.length);
	const firstVisualCollectionId = await page.$eval(`${firstCollectionSelector}`, el => el.dataset.collectionId);
	const firstVisualCollectionTitle = await page.$eval(`${firstCollectionSelector} .title`, el => el.innerHTML);
	const firstVisualCollectionTotalLinks = await page.$$eval(`${firstCollectionSelector} ${linkListSelector} > *`, el => el.length);
	const firstVisualCollectionFirstLinkId = await page.$eval(`${firstCollectionSelector} ${firstLinkSelector}`, el => el.dataset.linkId);
	const firstVisualCollectionFirstLinkTitle = await page.$eval(`${firstCollectionSelector} ${firstLinkSelector}`, el => el.innerText);
	const firstVisualCollectionSecondLinkId = await page.$eval(`${firstCollectionSelector} ${secondLinkSelector}`, el => el.dataset.linkId);
	const firstVisualCollectionSecondLinkTitle = await page.$eval(`${firstCollectionSelector} ${secondLinkSelector}`, el => el.innerText);
	
	const secondVisualCollectionId = await page.$eval(`${secondCollectionSelector}`, el => el.dataset.collectionId);
	const secondVisualCollectionTitle = await page.$eval(`${secondCollectionSelector} .title`, el => el.innerHTML);
	const secondVisualCollectionTotalLinks = await page.$$eval(`${secondCollectionSelector} ${linkListSelector} > *`, el => el.length);
	const secondVisualCollectionFirstLinkId = await page.$eval(`${secondCollectionSelector} ${firstLinkSelector}`, el => el.dataset.linkId);
	const secondVisualCollectionFirstLinkTitle = await page.$eval(`${secondCollectionSelector} ${firstLinkSelector}`, el => el.innerText);
	const secondVisualCollectionSecondLinkId = await page.$eval(`${secondCollectionSelector} ${secondLinkSelector}`, el => el.dataset.linkId);
	const secondVisualCollectionSecondLinkTitle = await page.$eval(`${secondCollectionSelector} ${secondLinkSelector}`, el => el.innerText);
	
	const thirdVisualCollectionId = await page.$eval(`${thirdCollectionSelector}`, el => el.dataset.collectionId);
	const thirdVisualCollectionTitle = await page.$eval(`${thirdCollectionSelector} .title`, el => el.innerHTML);
	const thirdVisualCollectionTotalLinks = await page.$$eval(`${thirdCollectionSelector} ${linkListSelector} > *`, el => el.length);
	const thirdVisualCollectionFirstLinkId = await page.$eval(`${thirdCollectionSelector} ${firstLinkSelector}`, el => el.dataset.linkId);
	const thirdVisualCollectionFirstLinkTitle = await page.$eval(`${thirdCollectionSelector} ${firstLinkSelector}`, el => el.innerText);
	const thirdVisualCollectionSecondLinkId = await page.$eval(`${thirdCollectionSelector} ${secondLinkSelector}`, el => el.dataset.linkId);
	const thirdVisualCollectionSecondLinkTitle = await page.$eval(`${thirdCollectionSelector} ${secondLinkSelector}`, el => el.innerText);

	t.is(totalCollections, 3);

	// Link with id "d" is clicked once, to collection2 comes first
	t.is(firstVisualCollectionId, '2');
	t.is(firstVisualCollectionTitle, 'collection2');
	t.is(firstVisualCollectionTotalLinks, 2);
	t.is(firstVisualCollectionFirstLinkId, 'c');
	t.is(firstVisualCollectionFirstLinkTitle, 'link2c');
	t.is(firstVisualCollectionSecondLinkId, 'd');
	t.is(firstVisualCollectionSecondLinkTitle, 'link2d');

	t.is(secondVisualCollectionId, '3');
	t.is(secondVisualCollectionTitle, 'collection3');
	t.is(secondVisualCollectionTotalLinks, 2);
	t.is(secondVisualCollectionFirstLinkId, 'e');
	t.is(secondVisualCollectionFirstLinkTitle, 'link3e');
	t.is(secondVisualCollectionSecondLinkId, 'f');
	t.is(secondVisualCollectionSecondLinkTitle, 'link3f');

	t.is(thirdVisualCollectionId, '1');
	t.is(thirdVisualCollectionTitle, 'collection1');
	t.is(thirdVisualCollectionTotalLinks, 2);
	t.is(thirdVisualCollectionFirstLinkId, 'a');
	t.is(thirdVisualCollectionFirstLinkTitle, 'link1a');
	t.is(thirdVisualCollectionSecondLinkId, 'b');
	t.is(thirdVisualCollectionSecondLinkTitle, 'link1b');

}

module.exports = test;
