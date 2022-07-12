const { readdirFilenames } = require('../utils/project-data');


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
	getSettingsSectionChoices,
};
