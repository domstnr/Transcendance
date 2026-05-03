import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { AuthenticatedSocket } from "../interfaces/auth-socket.interface";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

/**
 * 1. Prouver l'identité de l'enchérisseur
Sans sécurité, n'importe qui pourrait envoyer un message au serveur en disant :
"Je mise 1000€ au nom de Jean". Le JWT permet au serveur de vérifier mathématiquement que c'est bien Jean qui parle.
2. Éviter les tricheries
Les enchères sont des données critiques. Le JWT garantit que :
L'utilisateur est connecté : Seuls les membres inscrits peuvent miser.
Les données sont intègres : Le jeton est signé, donc personne ne peut modifier son contenu (comme changer son userId) sans que le serveur ne s'en rende compte immédiatement.
3. La performance (Le mode "Stateless")
Contrairement aux anciennes méthodes qui obligent le serveur à vérifier dans sa base de données à chaque message, le JWT contient déjà toutes les infos nécessaires.
Le serveur n'a qu'à "regarder" le jeton pour savoir qui mise,
ce qui est ultra-rapide pour des enchères en temps réel
 */
@Injectable()
export class WsJwtGuard implements CanActivate {
    private readonly logger = new Logger(WsJwtGuard.name);

    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient<AuthenticatedSocket>();
        const token = this.extractToken(client);
        if (!token) {
            this.logger.warn('Websocket connect denied: No token given..');
            throw new WsException('Unauthorized: Token missing');
        }

        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
                secret: process.env.JWT_SECRET || 'MySecret',
            });
            client.user = { userId: payload.sub, username: payload.username };
            return true;
        } catch (err) {
            console.log(err);
            this.logger.warn('Connection failed: Invalid or Expired Token...');
            throw new WsException('Unauthorized: Token invalid');
        }
    }

    private extractToken(client: AuthenticatedSocket): string | undefined {
        const cookieToken = this.extractCookieToken(client.handshake.headers.cookie);
        if (cookieToken) {
            return cookieToken;
        }

        const handshakeToken = client.handshake.auth?.token;
        if (typeof handshakeToken === 'string' && handshakeToken.length > 0) {
            return handshakeToken;
        }

        return client.handshake.headers?.authorization?.split(' ')[1];
    }

    private extractCookieToken(rawCookieHeader?: string): string | undefined {
        if (!rawCookieHeader) {
            return undefined;
        }

        for (const part of rawCookieHeader.split(';')) {
            const [rawName, ...rawValue] = part.trim().split('=');
            if (rawName === 'jwt') {
                return decodeURIComponent(rawValue.join('='));
            }
        }

        return undefined;
    }
}
