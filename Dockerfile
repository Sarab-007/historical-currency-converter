FROM node:22-alpine AS build

ENV NODE_ENV=development
WORKDIR /home/node/app

COPY --chown=node:node apps/api/package*.json ./
RUN npm ci

COPY --chown=node:node apps/api ./
RUN npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=7860
WORKDIR /home/node/app

COPY --chown=node:node apps/api/package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node --from=build /home/node/app/dist ./dist

USER node
EXPOSE 7860

CMD ["npm", "run", "start:prod"]
