import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, randomBytes } from 'crypto';
import QRCode from 'qrcode';
import { UserService } from '../user/user.service';

@Injectable()
export class TwoFactorService {
    constructor(private readonly userService: UserService) {}

    async generateSetup(userId: string, email: string) {
        const secret = generateBase32Secret();
        const otpauthUrl = buildOtpAuthUrl(email, 'Transauction', secret);

        const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

        await this.userService.updateTwoFactorSecret(userId, secret);

        return {
            qrCodeDataUrl,
        };
    }

    verifyCode(secret: string, code: string) {
        return verifyTotp(secret, code);
    }

    async enable(userId: string, secret: string, code: string) {
        const isValid = this.verifyCode(secret, code);

        if (!isValid) {
            throw new BadRequestException('Invalid 2FA code.');
        }

        await this.userService.enableTwoFactor(userId);

        return { message: '2FA enabled successfully.' };
    }
}

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateBase32Secret() {
    return encodeBase32(randomBytes(20));
}

function encodeBase32(buffer: Buffer) {
    let bits = '';
    let output = '';

    for (const byte of buffer) {
        bits += byte.toString(2).padStart(8, '0');
    }

    for (let index = 0; index + 5 <= bits.length; index += 5) {
        output += BASE32_ALPHABET[Number.parseInt(bits.slice(index, index + 5), 2)];
    }

    return output;
}

function decodeBase32(secret: string) {
    const cleanSecret = secret.replace(/=+$/g, '').replace(/\s/g, '').toUpperCase();
    let bits = '';
    const bytes: number[] = [];

    for (const char of cleanSecret) {
        const value = BASE32_ALPHABET.indexOf(char);
        if (value === -1) {
            throw new UnauthorizedException('Invalid 2FA secret.');
        }
        bits += value.toString(2).padStart(5, '0');
    }

    for (let index = 0; index + 8 <= bits.length; index += 8) {
        bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
    }

    return Buffer.from(bytes);
}

function buildOtpAuthUrl(email: string, issuer: string, secret: string) {
    const label = `${issuer}:${email}`;
    const params = new URLSearchParams({
        secret,
        issuer,
        algorithm: 'SHA1',
        digits: '6',
        period: '30',
    });

    return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}

function generateTotp(secret: string, step: number) {
    const key = decodeBase32(secret);
    const counter = Buffer.alloc(8);
    counter.writeBigUInt64BE(BigInt(step));

    const hash = createHmac('sha1', key).update(counter).digest();
    const offset = hash[hash.length - 1] & 0xf;
    const binary = (
        ((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff)
    );

    return String(binary % 1_000_000).padStart(6, '0');
}

function verifyTotp(secret: string, code: string) {
    if (!/^\d{6}$/.test(code)) {
        return false;
    }

    const currentStep = Math.floor(Date.now() / 1000 / 30);

    return [-1, 0, 1].some((windowOffset) => (
        generateTotp(secret, currentStep + windowOffset) === code
    ));
}
