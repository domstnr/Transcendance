import * as argon2 from "argon2";

export async function generateHash(password: string): Promise<string> {
    return argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
        hashLength: 32,
    });
}

export async function verifyHash(plainText: string, storedHash: string): Promise<boolean> {
    try {
        return await argon2.verify(storedHash, plainText);
    } catch (err) {
        console.log('Error, Argon2 engine:', err);
        return false;
    }
}