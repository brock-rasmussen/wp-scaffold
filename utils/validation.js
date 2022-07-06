const isValidURL = (url) => {
	try {
		new URL(url);
		return true;
	} catch(error) {
		return error.message;
	}
};

module.exports = {
	isValidURL,
};