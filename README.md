## Starting the project

To start the project, these are all the necessary steps :

1. Copy .env.example to .env and fill in the desired values
2. Run make certs to generate the SSL certificate
3. Run make all to build and start everything
4. Visit https://localhost:8443 and accept the certificate warning

## How to demonstrate our public API

The public API uses API key authentication and is separate from the regular user-facing endpoints.

**Step 1 — Log in**
```bash
curl -k -c cookies.txt -X POST https://localhost:8443/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```
The session cookie is saved automatically to `cookies.txt`.

**Step 2 — Generate an API key**
```bash
curl -k -b cookies.txt -X POST https://localhost:8443/api/api-keys \
  -H "Content-Type: application/json" \
  -d '{"name":"my test key"}'
```
Copy the `key` value from the response.

**Step 3 — Use the public API**

Dev test API key : cabeabffda2624178cb489e99d5e356780292c6a594be531ab9e9324f608f8db
```bash
# Without API key — returns 401
curl -k https://localhost:8443/api/public-api/item

# With API key — returns items list
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

**Step 4 — How to test rate limiting**
```bash
for i in {1..35}; do curl -k -o /dev/null -w "%{http_code}\n" https://localhost:8443/api/public-api/item -H "x-api-key: YOUR_KEY_HERE"; done
```
After 30 requests in 60 seconds you will see `429 Too Many Requests`.

**Step 5 — View the API documentation**

Visit `https://localhost:8443/docs?key=YOUR_API_KEY` in the browser to see the full Swagger documentation. A valid API key is required — you will get a 401 without one.

## Backups & Recovery

Backups run automatically every night via the `db-backup` service.
Retention: Last 20 backups

For a manual backup:
make backup

To restore from a backup:
  1. Make sure the stack is running (make up)
  2. Run: make restore
  3. Follow the prompts to select a backup file

## Privacy policy and Terms of Service

To access the privacy policy page and terms of service page, add /privacy or /terms to the URL