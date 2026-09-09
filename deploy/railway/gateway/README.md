# gateway

Deploy this service publicly. It is the only Railway service that should receive an HTTPS domain.

Required environment variables:

- `FLOWSTATE_BASE_URL=http://flowstate.railway.internal:8080`
- `AKILII_FLOWSTATE_TOKEN=<long random secret>`

Health: `GET /health`
Authenticated capability probe: `GET /v1/capabilities`
Generation: `POST /v1/generate`
