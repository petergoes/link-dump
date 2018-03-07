const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const groupSelector = () => '[data-group-id]';
const collectionsSelector = () => '[data-group-collections]';
const linkListSelector = () => '[data-link-list]';
const collectionSelector = nth => `${collectionsSelector()} > :nth-child(${nth})`;
const linkSelector = nth => `${linkListSelector()} > :nth-child(${nth}) a`;
const linkDialogSelector = nth => `${linkListSelector()} > :nth-child(${nth}) dialog`;
const searchListLinks = () => `[data-search-list-links]`;
const searchListLink = nth => `${searchListLinks()} > :nth-child(${nth}) a`;

const goIntoEditMode = async page => {
	await page.keyboard.down('Meta');
	await page.keyboard.press('KeyE');
	await page.keyboard.up('Meta');
}

module.exports = {
	pause,
	groupSelector,
	collectionsSelector,
	linkListSelector,
	collectionSelector,
	linkSelector,
	linkDialogSelector,
	goIntoEditMode,
	searchListLinks,
	searchListLink,
}
