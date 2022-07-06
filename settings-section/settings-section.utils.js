const { getFolderFileNames } = require('../utils/project-data');


/**
 * Get list of files (without extension) from the `settings-sections` folder.
 * @returns string[]
 */
const getSettingsSections = async () => {
	return getFolderFileNames('settings-sections');
};


/**
 * Get a list of project settings sections in a list formatted for `prompts` library `choices`.
 * @returns Array<{ title: string, value: string }>
 */
const getSettingsSectionChoices = async () => {
	let settingsSections = await getSettingsSections();
	// Sort alphabetically.
	settingsSections.sort();
	// Format for `prompts`.
	return settingsSections.map((section) => ({
		title: section,
		value: section,
	}));
}


module.exports = {
	getSettingsSectionChoices,
	getSettingsSections,
};
