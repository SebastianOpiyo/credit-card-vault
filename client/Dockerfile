FROM node:16-alpine

WORKDIR /app

COPY client/package.json .

RUN npm install --force

COPY client/ .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]