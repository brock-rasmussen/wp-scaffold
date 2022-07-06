const { getFolderFileNames } = require('../utils/project-data');


/**
 * Get list of files (without extension) from the `submenu-pages` folder.
 * @returns string[]
 */
const getSubmenuPages = async () => {
	return getFolderFileNames('submenu-pages');
};


module.exports = {
	getSubmenuPages,
};
