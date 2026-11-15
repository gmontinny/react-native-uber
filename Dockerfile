FROM node:20-bookworm-slim
WORKDIR /app
ENV EXPO_NO_TELEMETRY=1
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force
COPY --chown=node:node . .
RUN chown node:node /app
USER node
EXPOSE 8081
CMD ["npx", "expo", "start", "--lan", "--port", "8081"]
