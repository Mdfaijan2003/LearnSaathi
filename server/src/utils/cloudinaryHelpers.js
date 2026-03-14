export const getPublicId = (url) => {
	const parts = url.split("/");
	const fileName = parts[parts.length - 1];
	const folder = parts[parts.length - 2];

	return `${folder}/${fileName.split(".")[0]}`;
};