import { Injectable } from "@nestjs/common";
import { generateHash, verifyHash } from "./utils/argon2.util";

/**
 * hashPassword() -> used to generate the Argon2id hash
 * comparePassword() -> compare password with hash
 * each password has a salt that identifies uniquely the hash
 */
@Injectable()
export class PasswordService {

    public async hashPassword(password: string): Promise<string> {
        return generateHash(password);
    }

    public async comparePassword(plainText: string, hash: string): Promise<boolean> {
        return verifyHash(plainText, hash);
    }
}


/*
export class PasswordService {
    private readonly saltOrRounds = 10;

    private readonly argon2Params = {
        memory: 65536, //memory used to create hash
        passes: 3,  //number of hashing rounds
        parallelism: 4, //number of lane created
        tagLength: 32, //length of hash (64 characters)
    };

    public async hashPassword(password: string): Promise<string> {
        const salt = randomBytes(16);

        const derivedKey = argon2Sync('argon2id', {
            message: password,
            nonce: salt,
            ...this.argon2Params,
        });

        const   saltBase64 = salt.toString('base64').replace(/=/g, '');
        const   hashBase64 = derivedKey.toString('base64').replace(/=/g, '');

        const fullHash = `$argon2id$v=18$m=${this.argon2Params.memory},t=${this.argon2Params.passes},p=${this.argon2Params.parallelism}$${saltBase64}$${hashBase64}`;
        return Promise.resolve(fullHash);
    }

    public async comparePassword(plainText: string, hash: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, plainText);
        } catch (err) {
            console.log(`an error occured`, err);
            return false;
        }
    }
}
*/