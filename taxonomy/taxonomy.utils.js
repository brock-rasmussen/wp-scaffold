const { readdirFilenames } = require('../utils/project-data');


/**
 * Get list of post types in project and core post types in list formatted for `prompts` library `choices`.
 * @return {{ title: string, value: string }[]}
 */
const getTaxonomyChoices = async () => {
	let taxonomies = await readdirFilenames('taxonomies');
	
	// Add core taxonomies
	taxonomies.push('category', 'tag');
	
	// Sort alphabetically
	taxonomies.sort();
	
	// Format for `prompts`
	return taxonomies.map((taxonomy) => ({
		title: taxonomy,
		value: taxonomy,
	}));
};


module.exports = {
	getTaxonomyChoices,
};
