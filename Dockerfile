FROM node:20-bullseye

WORKDIR /usr/src/app

COPY package*.json ecosystem.config.js ./
RUN npm install

COPY . .
EXPOSE 5000

# PM2 cluster mode - tận dụng 2 vCPUs của t3.small
CMD ["npx", "pm2-runtime", "start", "ecosystem.config.js"]