import { randomBytes } from 'crypto';

/* this is a mock 3rd party KMSService */
class MockKMSService {
    private keyStore: Map<string, string> = new Map();

    async get(key: string): Promise<string | null> {
        return Promise.resolve(this.keyStore.get(key) ?? null);
    }

    async set(key: string, value: string): Promise<void> {
        this.keyStore.set(key, value);
        return Promise.resolve();
    }
}

export const KMSService = new MockKMSService();

export async function getOrCreateCryptographicKey(id: string): Promise<string> {
    const storedKey = await KMSService.get(id);
    const key = storedKey ?? randomBytes(32).toString('hex');
    if (!storedKey) {
        await KMSService.set(id, key);
    }
    return key;
}

export async function getCryptographicKeyOrThrow(id: string): Promise<string> {
    const storedKey = await KMSService.get(id);
    if (!storedKey) {
        throw new Error(`Missing Cryptographic Key for ID: ${id}`);
    }
    return storedKey;
}
