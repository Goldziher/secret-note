import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-cbc';

export async function encrypt({
    content,
    key,
}: {
    content: string;
    key: string;
}): Promise<{ initializationVector: string; encryptedContent: string }> {
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
    const encryptedData = Buffer.concat([
        cipher.update(content),
        cipher.final(),
    ]);
    return {
        encryptedContent: encryptedData.toString('hex'),
        initializationVector: iv.toString('hex'),
    };
}

export async function decrypt({
    content,
    initializationVector,
    key,
}: {
    content: string;
    initializationVector: string;
    key: string;
}): Promise<string> {
    const decipher = createDecipheriv(
        ALGORITHM,
        Buffer.from(key, 'hex'),
        Buffer.from(initializationVector, 'hex'),
    );
    return Buffer.concat([
        decipher.update(Buffer.from(content, 'hex')),
        decipher.final(),
    ]).toString();
}
