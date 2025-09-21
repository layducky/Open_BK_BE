FROM node:18-bullseye

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 5000

CMD ["npm", "start"]