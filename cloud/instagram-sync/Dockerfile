FROM node:18-slim
WORKDIR /usr/src/app
COPY . .
# No build step required (ESM script). Install none; node 18 has fetch/FormData.
CMD ["node", "index.mjs"]
