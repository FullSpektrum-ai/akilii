FROM node:24-alpine
WORKDIR /app
COPY backend/flowstate.js /app/backend/flowstate.js
COPY runtime/flowstate-client.mjs /app/runtime/flowstate-client.mjs
COPY runtime/gateway/server.mjs /app/runtime/gateway/server.mjs
COPY runtime/gateway/hosted-smoke.mjs /app/runtime/gateway/hosted-smoke.mjs
USER node
EXPOSE 8788
CMD ["node", "/app/runtime/gateway/server.mjs"]
