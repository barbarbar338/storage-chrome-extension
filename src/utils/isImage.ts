// https://stackoverflow.com/questions/9519569/what-is-the-true-way-of-checking-a-string-for-image-url-and-existence-if-valid/9526102
export default async function isImage(str: string): Promise<boolean> {
	return new Promise<boolean>((resolve) => {
		const img = new Image();
		img.onload = () => resolve(true);
		img.onerror = () => resolve(false);
		img.src = str;
	});
}
