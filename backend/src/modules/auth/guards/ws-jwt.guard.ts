import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { AuthenticatedSocket } from "../interfaces/auth-socket.interface";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { extractWsToken } from "../utils/extract-ws-token.util";

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
        const token = extractWsToken(client);
        if (!token) {
            this.logger.warn('Websocket connect denied: No token given..');
            throw new WsException('Unauthorized: Token missing');
        }

        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
                secret: process.env.JWT_SECRET || 'MySecret',
            });
            if (payload.tokenType !== 'access') {
                this.logger.warn('Websocket connection denied: non-access token used');
                throw new WsException('Unauthorized: Token invalid');
            }
            client.user = { userId: payload.sub, username: payload.username };
            return true;
        } catch (err) {
            console.log(err);
            this.logger.warn('Connection failed: Invalid or Expired Token...');
            throw new WsException('Unauthorized: Token invalid');
        }
    }

}
