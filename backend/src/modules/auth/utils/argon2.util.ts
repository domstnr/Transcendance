import { argon2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const ARGON2_PARAMS = {
    memory: 65536, //memory used to create hash
    passes: 3,  //number of hashing rounds
    parallelism: 4, //number of lane created
    tagLength: 32, //length of hash (64 characters)
};

export function generateHash(password: string): string {
    const salt = randomBytes(16);

    const derivedKey = argon2Sync('argon2id', {
        message: password,
        nonce: salt,
        ...ARGON2_PARAMS,
    });

    const saltBase64 = salt.toString('base64').replace(/=/g, '');
    const hashBase64 = derivedKey.toString('base64').replace(/=/g, '');

    return `$argon2id$v=18$m=${ARGON2_PARAMS.memory},t=${ARGON2_PARAMS.passes},p=${ARGON2_PARAMS.parallelism}$${saltBase64}$${hashBase64}`;
}

export function verifyHash(plainText: string, storedHashStr: string): boolean {
    try {
        const parts = storedHashStr.split('$');
        if (parts.length !== 6) return false;

        const saltBase64 = parts[4];
        const originalHashBase64 = parts[5];

        const saltBuffer = Buffer.from(saltBase64, 'base64');
        const originalHashbuff = Buffer.from(originalHashBase64, 'base64');

        const derivedKey = argon2Sync('argon2id', {
            message: plainText,
            nonce:  saltBuffer,
            ...ARGON2_PARAMS,
        });

        if (originalHashbuff.length !== derivedKey.length){
            return false;
        }
        return timingSafeEqual(originalHashbuff, derivedKey);
    } catch (err) {
        console.log('Error, Argon2 engine:', err);
        return false;
    }
}