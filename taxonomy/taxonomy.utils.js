const { getFolderFileNames } = require('../utils/project-data');


/**
 * Get list of files (without extension) from the `taxonomies` folder.
 * @returns string[]
 */
const getTaxonomies = async () => {
	return getFolderFileNames('taxonomies');
};


/**
 * Get list of taxonomies in project and core taxonomies in list formatted for `prompts` library `choices`.
 * @return Array<{ title: string, value: string }>
 */
const getTaxonomyChoices = async () => {
	let taxonomies = await getTaxonomies();
	// Add core taxonomies.
	taxonomies.push('category', 'tag');
	// Sort alphabetically.
	taxonomies.sort();
	// Format for `prompts`
	return taxonomies.map((taxonomy) => ({
		title: taxonomy,
		value: taxonomy,
	}));
};


module.exports = {
	getTaxonomies,
	getTaxonomyChoices,
};
