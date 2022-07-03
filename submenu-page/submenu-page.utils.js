const { getFolderFileNames } = require('../utils/project-data');


/**
 * Get list of files (without extension) from the `menu-pages` folder.
 * @returns string[]
 */
const getSubmenuPages = async () => {
	return getFolderFileNames('submenu-pages');
};


module.exports = {
	getSubmenuPages,
};
