import { decrypt, encrypt } from '../../src/utils';
import { randomBytes } from 'crypto';

describe('Cryptography Util Tests', () => {
    it('encrypts and decrypts the provided value correctly', async () => {
        const content = 'lorem ipsum';
        const key = randomBytes(32).toString('hex');
        const { encryptedContent, initializationVector } = await encrypt({
            content,
            key,
        });
        expect(encryptedContent).not.toEqual(content);
        expect(typeof encryptedContent).toEqual('string');
        expect(typeof initializationVector).toEqual('string');
        expect(
            await decrypt({
                content: encryptedContent,
                initializationVector,
                key,
            }),
        ).toEqual(content);
    });
});
