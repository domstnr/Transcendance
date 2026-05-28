import type { AuthenticatedSocket } from '../interfaces/auth-socket.interface';

export function extractWsToken(client: AuthenticatedSocket): string | undefined {
    const cookieToken = extractCookieToken(client.handshake.headers.cookie);
    if (cookieToken) return cookieToken;

    const handshakeToken = client.handshake.auth?.token;
    if (typeof handshakeToken === 'string' && handshakeToken.length > 0) return handshakeToken;

    return client.handshake.headers?.authorization?.split(' ')[1];
}

function extractCookieToken(rawCookieHeader?: string): string | undefined {
    if (!rawCookieHeader) return undefined;
    for (const part of rawCookieHeader.split(';')) {
        const [rawName, ...rawValue] = part.trim().split('=');
        if (rawName === 'jwt') return decodeURIComponent(rawValue.join('='));
    }
    return undefined;
}
