const { getFolderFileNames } = require('../utils/project-data');


/**
 * Get list of post types in project and core post types in list formatted for `prompts` library `choices`.
 * @return Array<{ title: string, value: string }>
 */
const getPostTypeChoices = async () => {
	let postTypes = await getPostTypes();
	// Add core post types.
	postTypes.push('page', 'post');
	// Sort alphabetically.
	postTypes.sort();
	// Format for `prompts`
	return postTypes.map((postType) => ({
		title: postType,
		value: postType,
	}));
};


/**
 * Get list of files (without extension) from the `post-types` folder.
 * @returns string[]
 */
const getPostTypes = async () => {
	return getFolderFileNames('post-types');
};


module.exports = {
	getPostTypeChoices,
	getPostTypes,
};
