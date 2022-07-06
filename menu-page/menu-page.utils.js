const pluralize = require('pluralize');
const { getFolderFileNames } = require('../utils/project-data');
const { getPostTypes } = require('../post-type/post-type.utils');
const { getSubmenuPages } = require('../submenu-page/submenu-page.utils');


/**
 * Get list of menu pages in project and core menu pages in list formatted for `prompts` library `choices`.
 * @return Array<{ title: string, value: string }>
 */
const getMenuPageChoices = async () => {
	let menuPages = await getMenuPages();
	let postTypes = await getPostTypes();

	// Format for `prompts`
	let menuPageChoices = menuPages.map((menuPage) => ({
		title: menuPage,
		value: menuPage,
	}))

	// Add post types.
	postTypes.forEach((postType) => {
		let postTypePlural = pluralize(postType);

		menuPageChoices.push({
			title: `${postTypePlural} (edit.php?post_type=${postType})`,
			value: `edit.php?post_type=${postType}`,
		});
	});

	// Add core menu pages.
	menuPageChoices.push(
		{
			title: 'dashboard (index.php)',
			value: 'index.php',
		},
		{
			title: 'posts (edit.php)',
			value: 'edit.php',
		},
		{
			title: 'media (upload.php)',
			value: 'upload.php',
		},
		{
			title: 'pages (edit.php?post_type=page)',
			value: 'edit.php?post_type=page',
		},
		{
			title: 'comments (edit-comments.php)',
			value: 'edit-comments.php',
		},
		{
			title: 'appearance (theme.php)',
			value: 'themes.php',
		},
		{
			title: 'plugins (plugins.php)',
			value: 'plugins.php',
		},
		{
			title: 'users (users.php)',
			value: 'users.php',
		},
		{
			title: 'tools (tools.php)',
			value: 'tools.php',
		},
		{
			title: 'settings (options-general.php)',
			value: 'options-general.php',
		},
	);
	
	// Sort alphabetically by `title`.
	return menuPageChoices.sort((a, b) => {
		if (a.title < b.title) {
			return -1;
		}
		if (a.title > b.title) {
			return 1;
		}
		return 0;
	});
};


/**
 * Get list of files (without extension) from the `menu-pages` folder.
 * @returns string[]
 */
const getMenuPages = async () => {
	return getFolderFileNames('menu-pages');
};


/**
 * Get the menu page slug with an easier identifier.
 * @param string page 
 * @returns string
 */
const getMenuPageSlug = async (page) => {
	// Check core pages first.
	const lib = {
		dashboard: 'index.php',
		media: 'upload.php',
		pages: 'edit.php?post_type=page',
		posts: 'edit.php',
		comments: 'edit-comments.php',
		appearance: 'themes.php',
		plugins: 'plugins.php',
		users: 'users.php',
		tools: 'tools.php',
		settings: 'options-general.php',
	};

	if (page in lib) {
		return lib[page];
	}

	// Check custom menu-pages.
	const menuPages = await getMenuPages();
	
	if (menuPages.includes(page)) {
		return page;
	}

	// Check custom post types.
	const postTypes = await getPostTypes();
	const pluralPostTypes = postTypes.map((postType) => pluralize(postType));
	
	if (postTypes.includes(page) || pluralPostTypes.includes(page)) {
		return `edit.php?post_type=${page}`;
	}

	// Otherwise, return user input back.
	return page;
};


/**
 * Get a list of project menu and submenu pages along with core settings page slugs in a list formatted for `prompts` library `choices`.
 * @returns Array<{ title: string, value: string }>
 */
const getSettingsPageChoices = async () => {
	let menuPages = await getMenuPages();
	let submenuPages = await getSubmenuPages();

	// Add core settings pages.
	let settingsPages = [
		...menuPages,
		...submenuPages,
		'discussion',
		'general',
		'media',
		'permalink',
		'reading',
		'writing',
	];

	// Sort alphabetically
	settingsPages.sort();

	// Format for `prompts`
	return settingsPages.map((page) => ({
		title: page,
		value: page,
	}));
}


module.exports = {
	getMenuPageChoices,
	getMenuPages,
	getMenuPageSlug,
	getSettingsPageChoices,
};
