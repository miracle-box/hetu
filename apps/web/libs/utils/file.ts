export function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			// Strip data:image/png;base64, header.
			return resolve((reader.result as string).split(',')[1] as string);
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}
