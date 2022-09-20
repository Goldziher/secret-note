import {
    getCryptographicKeyOrThrow,
    getOrCreateCryptographicKey,
    KMSService,
} from '../../src/utils';

describe('KMS util Tests', () => {
    afterEach(() => {
        jest.resetModules();
    });

    describe('getOrCreateCryptographicKey', () => {
        it('should create a new key and set it if none exists for the provided ID', async () => {
            const id = 'id1';
            expect(await KMSService.get(id)).toBeNull();
            expect(typeof (await getOrCreateCryptographicKey(id))).toEqual(
                'string',
            );
            expect(await KMSService.get(id)).not.toBeNull();
        });

        it('should return an existing key for the provided ID', async () => {
            const id = 'id2';
            expect(await KMSService.get(id)).toBeNull();
            const key = await getOrCreateCryptographicKey(id);
            expect(typeof (await getOrCreateCryptographicKey(id))).toEqual(
                'string',
            );
            expect(await KMSService.get(id)).not.toBeNull();
            expect(await getOrCreateCryptographicKey(id)).toEqual(key);
        });
    });

    describe('getCryptographicKeyOrThrow', () => {
        it('should throw when no key matches the provided ID', async () => {
            await expect(async () =>
                getCryptographicKeyOrThrow('someString'),
            ).rejects.toThrow();
        });
        it('should return a key if one exists for the provided ID', async () => {
            const id = 'id3';
            const key = 'key123';
            await KMSService.set(id, key);
            expect(await getCryptographicKeyOrThrow(id)).toEqual(key);
        });
    });
});
