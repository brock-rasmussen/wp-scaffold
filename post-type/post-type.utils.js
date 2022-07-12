const { readdirFilenames } = require('../utils/project-data');


/**
 * Get list of post types in project and core post types in list formatted for `prompts` library `choices`.
 * @return {{ title: string, value: string }[]}
 */
const getPostTypeChoices = async () => {
	let postTypes = await readdirFilenames('post-types');
	
	// Add core post types
	postTypes.push('page', 'post');
	
	// Sort alphabetically
	postTypes.sort();
	
	// Format for `prompts`
	return postTypes.map((postType) => ({
		title: postType,
		value: postType,
	}));
};


module.exports = {
	getPostTypeChoices,
};
