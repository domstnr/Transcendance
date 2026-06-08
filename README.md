*This project has been created as part of the 42 curriculum by pkurt, lcroxatt, kbaga, nvignal, razaccar*

---

## Description

**Transauction** is a real-time marketplace web application where users can list items for auction and compete by placing live bids. Each auction has its own chat room so participants can communicate directly during a listing.

Key features:
- Real-time bidding and chat powered by WebSockets
- User profiles with avatar upload and online presence
- Friends system with friend requests and online status
- GitHub OAuth and Two-Factor Authentication (TOTP)
- Public REST API with API key authentication, rate limiting, and Swagger documentation
- Automated nightly database backups with restore capability

---

## Instructions

### Prerequisites

- Docker and Docker Compose
- Make
- A GitHub OAuth App (for GitHub login), set `VITE_GITHUB_CLIENT_ID` and `GITHUB_SECRET` in `.env`
- OpenSSL (for generating SSL certificates)

### Setup and run

1. Copy the example environment file and fill in your values:
   ```bash
   cp .env.example .env
   ```

2. Generate the SSL certificate:
   ```bash
   make certs
   ```

3. Build and start everything:
   ```bash
   make all
   ```

4. Visit `https://localhost:8443` and accept the self-signed certificate warning.

### Available make commands

| Command | Description |
|---------|-------------|
| `make all` | Build and start all containers |
| `make up` | Start containers without rebuilding |
| `make down` | Stop all containers |
| `make re` | Rebuild and restart everything |
| `make certs` | Generate SSL certificates |
| `make backup` | Trigger a manual database backup |
| `make restore` | Restore from a backup interactively |
| `make clean` | Stop containers and remove volumes |

---

## Resources

### References

- [NestJS documentation](https://docs.nestjs.com)
- [React documentation](https://react.dev)
- [Prisma documentation](https://www.prisma.io/docs)
- [Socket.io documentation](https://socket.io/docs)
- [PostgreSQL documentation](https://www.postgresql.org/docs)
- [@nestjs/terminus health checks](https://docs.nestjs.com/recipes/terminus)
- [Argon2 password hashing](https://github.com/ranisalt/node-argon2)
- [RFC 6238, TOTP standard](https://datatracker.ietf.org/doc/html/rfc6238)

### AI usage

AI was used during this project to assist in the making of placeholder pages to serve as testing grounds, as well as being an educational tool to explain numerous concepts used during this project. AI was also used as an assistant in the formatting of the documentation for the project.

---

## Team Information

| Member | Login | Role | Responsibilities |
|--------|-------|------|-----------------|
| Guy | nvignal | Product Owner / Developer | Overviewer of the project, polishing  of the product |
| Léo | lcroxatt | Project Manager / Developer | Organizer of the project, maintains team communication, plans meetings and regular checks. |
| Raphael | razaccar | Tech Lead / Developer | Developer of main features and implicated in tech design choices. |
| Peter | pkurt | Developer | Developer of features and overall assistance |
| Kenny | kbaga | Developer | Developer of architecture/features and overall assistance |


---

## Project Management

- **Task distribution**: The task distribution for this project has been fairly straight forward, we have attempted GitHub Issues but have found it to be more of a bother, since we have had good chemistry as a group and communication has been easy between us. We ended up communicating clearly on who worked on what at the present time and it worked out for us.
- **Meetings**: Multiple times a week, at school or in a discord voice channel.
- **Communication**: A Discord server established for the project.
- **Version control**: Git with feature branches per member, merged into `dev`, then `main`.

---

## Technical Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React + React Router | Component-based SPA with straightforward routing |
| Styling | Bootstrap | Rapid responsive layout without custom CSS overhead |
| Backend | NestJS (TypeScript) | Structured, decorator-based framework with built-in DI and modular architecture |
| ORM | Prisma | Type-safe database access with auto-generated client and easy migrations |
| Database | PostgreSQL | Relational integrity for users, auctions, bids, and friendships |
| Cache | Redis | Write-behind caching for high-frequency bid updates to reduce DB load |
| Real-time | Socket.io | WebSocket abstraction for live bidding, chat, and presence |
| Auth | JWT (httpOnly cookies) + argon2 | Stateless auth with secure password hashing |
| 2FA | TOTP (speakeasy + QR code) | Standard time-based one-time passwords compatible with any authenticator app |
| Reverse proxy | Nginx | SSL termination, static routing, WebSocket upgrade |
| Containerization | Docker + Docker Compose | Single-command deployment, isolated services |
| API docs | Swagger (@nestjs/swagger) | Auto-generated interactive documentation |

---

## Database Schema

### Tables

**User**, registered accounts  
`id` (UUID PK), `username` (unique), `email` (unique), `password` (argon2 hash), `avatarUrl`, `isOnline`, `lastSeen`, `twoFactorEnabled`, `twoFactorSecret`, `createdAt`, `updatedAt`

**Item**, marketplace listings  
`id` (UUID PK), `sellerId` (FK → User), `title`, `description`, `condition` (1–10), `category` (enum: ELECTRONICS, FASHION, HOME, COLLECTIBLES, GAMING, BOOKS, SPORTS, OTHER), `createdAt`, `updatedAt`

**Auction**, auction attached to an item  
`id` (UUID PK), `itemId` (FK → Item, unique), `sellerId` (FK → User), `startPrice`, `currentPrice`, `highestBidderId` (FK → User, nullable), `status` (OPEN / CLOSED), `version` (optimistic lock), `endDate`, `createdAt`, `updatedAt`

**Bid**, individual bid placed on an auction  
`id` (UUID PK), `auctionId` (FK → Auction), `userId` (FK → User), `amount`, `status` (ACCEPTED / REJECTED), `createdAt`

**Message**, chat message in an auction room  
`id` (UUID PK), `auctionId` (FK → Auction), `senderId` (FK → User), `content`, `mediaUrl` (nullable), `isOffer`, `offerPrice` (nullable), `createdAt`

**ChatParticipation**, tracks which users joined which chat room  
`id` (UUID PK), `userId` (FK → User), `auctionId` (FK → Auction), `lastReadAt`, unique on (userId, auctionId)

**Friendship**, friend requests and accepted friendships  
`id` (UUID PK), `senderId` (FK → User), `receiverId` (FK → User), `status` (PENDING / ACCEPTED / BLOCKED), `createdAt`, `updatedAt`, unique on (senderId, receiverId)

**ApiKey**, public API keys generated by users  
`id` (UUID PK), `key` (unique), `name`, `userId` (FK → User), `createdAt`

### Relationships

```
User ──< Item (seller)
User ──< Auction (seller)
User ──< Auction (highestBidder)
User ──< Bid
User ──< Message
User ──< ChatParticipation
User ──< Friendship (sender)
User ──< Friendship (receiver)
User ──< ApiKey
Item ──── Auction (one-to-one)
Auction ──< Bid
Auction ──< Message
Auction ──< ChatParticipation
```

---

## Features List

| Feature | Description | Implemented by |
|---------|-------------|----------------|
| Registration | Email + password signup with argon2 hashing and input validation | Kenny, Peter |
| Login | Email + password login with JWT httpOnly cookie session | Kenny, Peter |
| GitHub OAuth | Login or register via GitHub OAuth 2.0 flow | Peter |
| Two-Factor Authentication | TOTP-based 2FA setup, enable/disable via QR code | Guy |
| User profile | View and edit username, email, avatar | Raphael, Léo, Guy |
| Public profiles | View another user's profile and their listings | Raphael, Guy |
| Friends system | Send, accept, decline, cancel friend requests; remove friends | Léo, Guy |
| Item listings | Create, view, and manage marketplace item listings | Raphael |
| Real-time bidding | Place bids on live auctions via WebSocket with optimistic locking | Raphael |
| Auction chat | Per-auction chat room with persistent message history | Léo, Guy |
| Public API | REST API secured by API key with rate limiting and Swagger docs | Léo |
| Health status page | Live system status showing database and memory health | Léo |
| Automated backups | Nightly PostgreSQL backups with manual backup/restore via Make | Léo |
| Privacy Policy | Full privacy policy page accessible from footer | Guy |
| Terms of Service | Full terms of service page accessible from footer | Guy |
| Password change | Authenticated users can change their password | Raphael |

---

## Modules

| Module | Category | Type | Points | Why | Implemented by |
|--------|----------|------|--------|-----|----------------|
| Use a framework for both frontend (React) and backend (NestJS) | Web | Major | 2 | We were already comfortable with React, and NestJS gives the backend enough structure for a team to work in parallel without stepping on each other | Everyone |
| Real-time features using WebSockets (Socket.io), live bidding, chat, presence | Web | Major | 2 | Bidding and chat both need to feel instant. With WebSockets every connected user sees price updates and messages the moment they happen instead of having to refresh | Raphael, Léo |
| User interaction, basic chat, profile system, friends system | Web | Major | 2 | A marketplace without social features is just a storefront. Profiles, chat, and friends let buyers size up sellers and stay connected around auctions they care about | Raphael, Léo |
| Public API, API key auth, rate limiting, Swagger docs, 6 endpoints | Web | Major | 2 | We wanted the platform to be usable beyond the browser. Power users can automate their listings or integrate with other tools, and the Swagger docs mean evaluators can explore the API without reading the source | Léo |
| ORM (Prisma) | Web | Minor | 1 | Working as a team on a shared schema without an ORM gets messy fast. Prisma keeps the types in sync between the database and the backend and makes migrations straightforward | Kenny, Peter |
| Standard user management, profile, avatar, friends, online status | User Management | Major | 2 | Profiles and online status matter in a marketplace, you want to know who you're bidding against and whether the seller is around to answer questions | Raphael, Léo |
| Remote authentication via OAuth 2.0 (GitHub) | User Management | Minor | 1 | A big part of our audience is developers. Letting them log in with GitHub means one less password to manage and removes friction from the very first impression | Peter |
| Two-Factor Authentication (TOTP) | User Management | Minor | 1 | Account security in a marketplace has real stakes, someone hijacking your account could place bids or modify listings in your name. TOTP is the standard solution and works with any authenticator app | Guy |
| Health check and status page system with automated backups and disaster recovery procedures | Devops | Minor | 1 | If the database goes down mid-auction, bids can be lost permanently. Automated backups and a live status page meant we could catch and recover from problems before they became serious | Léo |
| Support for additional browsers (tested with Firefox, Brave, Opera GX) | Accessibility and Internationalization | Minor | 1 | We didn't want the site to break for someone just because they prefer a different browser. Testing across Firefox, Brave, and Opera GX covers both rendering engines | Everyone |
| Real-time auction and bidding system, full auction lifecycle (OPEN/CLOSED states, end date enforcement), concurrent bid placement with optimistic locking to prevent race conditions, Redis write-behind caching for high-frequency bid updates, WebSocket broadcast of live price changes to all connected participants, per-auction bid history with ACCEPTED/REJECTED status, and automatic highest-bidder tracking | Gameplay and user experience | Major | 2 | This is the heart of the app. Getting concurrent bids right, no double-wins, no stale prices, no race conditions, required optimistic locking and Redis caching on top of WebSockets, which is exactly the kind of complexity that makes it worth calling a module | Raphael, Kenny |
| **Total** | | | **17** | | |


---

## How to demonstrate our public API

The public API uses API key authentication and is separate from the regular user-facing endpoints.

**Step 1, Log in**

Will not work if 2FA is active on the account.
```bash
curl -k -c cookies.txt -X POST https://localhost:8443/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```
The session cookie is saved automatically to `cookies.txt`.

**Step 2, Generate an API key**
```bash
curl -k -b cookies.txt -X POST https://localhost:8443/api/api-keys \
  -H "Content-Type: application/json" \
  -d '{"name":"my test key"}'
```
Copy the `key` value from the response.

**Step 3, Use the public API**

```bash
# Without API key, returns 401
curl -k https://localhost:8443/api/public-api/item

# With API key, returns items list
curl -k https://localhost:8443/api/public-api/item \
  -H "x-api-key: YOUR_KEY_HERE"

# Get a specific item
curl -k https://localhost:8443/api/public-api/item/ITEM_ID \
  -H "x-api-key: YOUR_KEY_HERE"

# Should work - with API key
curl -k -X POST https://localhost:8443/api/public-api/item \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY_HERE" \
  -d '{"title":"test","description":"test","condition": 3,"category":"ELECTRONICS", "startPrice":10.00,"endDate":"2026-12-31T00:00:00Z"}'

# Should work - update it
curl -k -X PUT https://localhost:8443/api/public-api/item/ITEM_ID \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY_HERE" \
  -d '{"title":"updated title"}'

# Should work - delete it
curl -k -X DELETE https://localhost:8443/api/public-api/item/ITEM_ID \
  -H "x-api-key: YOUR_KEY_HERE"
```

**Step 4, How to test rate limiting**
```bash
for i in {1..35}; do curl -k -o /dev/null -w "%{http_code}\n" https://localhost:8443/api/public-api/item -H "x-api-key: YOUR_KEY_HERE"; done
```
After 30 requests in 60 seconds you will see `429 Too Many Requests`.

**Step 5, View the API documentation**

Visit `https://localhost:8443/docs?key=YOUR_API_KEY` in the browser to see the full Swagger documentation. A valid API key is required, you will get a 401 without one.

---

## Backups & Recovery

Backups run automatically every night via the `db-backup` service.
Retention: Last 20 backups

For a manual backup:
```bash
make backup
```

To restore from a backup:
1. Make sure the stack is running (`make up`)
2. Run: `make restore`
3. Follow the prompts to select a backup file

---

## Individual Contributions

| Member | Contributions |
|--------|--------------|
| nvignal | Two-Factor Authentication (TOTP setup, QR code, enable/disable); user profile (view/edit); public user profiles; friends system (requests, accept/decline); auction chat; Privacy Policy and Terms of Service pages; Huge UI implication |
| lcroxatt | Friends system; auction chat; public REST API (API key auth, rate limiting, Swagger docs, 6 endpoints); health status page; automated nightly backups with disaster recovery; real-time WebSockets (co-implemented) |
| razaccar | Item listings (create/view/manage); real-time bidding system (WebSocket bids, optimistic locking, Redis write-behind cache); public profiles; user profile; password change; real-time WebSockets (co-implemented); standard user management (co-implemented) |
| pkurt | Registration and login systems; GitHub OAuth 2.0 flow; ORM setup (Prisma schema, migrations) |
| kbaga | Registration and login systems (co-implemented); ORM setup (Prisma, co-implemented); Event bus |
