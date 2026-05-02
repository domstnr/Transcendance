import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { AuthenticatedSocket } from "../interfaces/auth-socket.interface";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import * as cookie from 'cookie'
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
        const rawCookies = client.handshake.headers.cookie;
        console.log('🛡️ [Guard Debug] Tentative de message...');
    console.log('🍪 [Guard Debug] Cookies bruts détectés :', rawCookies);
        /**to check for secret key */
        try {
            if (!rawCookies) {
                this.logger.warn('Websockets connect denied: No cookies found');
                throw new WsException('Unauthorized: No cookies');
            }
            const parsedCookies = cookie.parse(rawCookies)
            const token = parsedCookies['jwt']; //jwt is the cookie name in auth.controller.ts
            
            if (!token) {
                this.logger.warn('Websocket connect denied: No jwt token in cookies');
                throw new WsException('Unauthorized: Token missing');
            }
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token,  {
                secret: process.env.JWT_SECRET || 'MySecret',
            });
            client.user = { userId: payload.sub, username: payload.username};
            return true;
        } catch (err) {
            console.log(err);
            this.logger.warn('Connection failed: Invalid or Expired Token...');
            throw new WsException('Unauthorized: Token invalid');
        }

    }
}

/*
export class WsJwtGuard implements CanActivate {
    private readonly logger = new Logger(WsJwtGuard.name);

    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient<AuthenticatedSocket>();

        //look for bidder token here
        //handshake is the http request/response exchange
        const token =
            (client.handshake.auth?.token as string) ||
            client.handshake.headers?.authorization?.split(' ')[1];
        if (!token) {
            this.logger.warn('Websocket connect denied: No token given..');
            throw new WsException('Unauthorized: Token missing');
        }

        //to check for secret key
        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token,  {
                secret: process.env.JWT_SECRET || 'MySecret',
            });
            client.user = { userId: payload.sub, username: payload.username};
            return true;
        } catch (err) {
            console.log(err);
            this.logger.warn('Connection failed: Invalid or Expired Token...');
            throw new WsException('Unauthorized: Token invalid');
        }

    }
}

*/