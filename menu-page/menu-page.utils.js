const pluralize = require('pluralize');
const { readdirFilenames } = require('../utils/project-data');

/**
 * Get list of menu pages in project and core menu pages in list formatted for `prompts` library `choices`.
 * @return {{ title: string, value: string }[]}
 */
const getMenuPageChoices = async () => {
	let [menuPages, postTypes] = await Promise.all([
		readdirFilenames('menu-pages'),
		readdirFilenames('post-types'),
	]);

	let choices = [];

	// Add menu pages
	menuPages.forEach((menuPage) => {
		choices.push({
			title: menuPage,
			value: menuPage,
		})
	});

	// Add post types
	postTypes.forEach((postType) => {
		let postTypePlural = pluralize(postType);

		choices.push({
			title: `${postTypePlural} (edit.php?post_type=${postType})`,
			value: `edit.php?post_type=${postType}`,
		});
	});

	// Add core menu pages
	choices.push(
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
	
	// Sort alphabetically by `title`
	return choices.sort((a, b) => {
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
 * Get the menu page slug with an easier identifier.
 * @param {string} page 
 * @returns {string}
 */
const resolveMenuPage = async (page) => {
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
	const menuPages = await readdirFilenames('menu-pages');
	
	if (menuPages.includes(page)) {
		return page;
	}

	// Check custom post types.
	const postTypes = await readdirFilenames('post-types');
	const pluralPostTypes = postTypes.map((postType) => pluralize(postType));
	
	if (postTypes.includes(page) || pluralPostTypes.includes(page)) {
		return `edit.php?post_type=${page}`;
	}

	// Otherwise, return user input back.
	return page;
};


module.exports = {
	getMenuPageChoices,
	resolveMenuPage,
};
