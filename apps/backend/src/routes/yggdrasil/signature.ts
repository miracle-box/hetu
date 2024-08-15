import { createPrivateKey, createSign, getHashes } from 'node:crypto';

export function sign(pem: string, data: string): string {
	const key = createPrivateKey({
		key: pem,
		format: 'pem',
	});

	console.log(getHashes());

	const signer = createSign('RSA-SHA1');
	signer.update(data);
	return signer.sign(key, 'base64');
}
