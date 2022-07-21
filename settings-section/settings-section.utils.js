const { readdirFilenames } = require('../utils/project-data');


/**
 * Get a list of settings pages in a list formatted for `prompts` library `choices`.
 * @returns {{ title: string, value: string }[]}
 */
const getSettingsPageChoices = async () => {
	let menuPages = await readdirFilenames('menu-pages');
	let submenuPages = await readdirFilenames('submenu-pages');

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


/**
 * Get a list of project settings sections in a list formatted for `prompts` library `choices`.
 * @returns {{ title: string, value: string }[]}
 */
const getSettingsSectionChoices = async () => {
	let settingsSections = await readdirFilenames('settings-sections');
	
	// Sort alphabetically
	settingsSections.sort();
	
	// Format for `prompts`
	return settingsSections.map((section) => ({
		title: section,
		value: section,
	}));
}


module.exports = {
	getSettingsPageChoices,
	getSettingsSectionChoices,
};
