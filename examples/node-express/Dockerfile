FROM node:20-alpine
WORKDIR /app

COPY packages/ ./packages/
COPY examples/node-express/ ./examples/node-express/

WORKDIR /app/examples/node-express
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]
