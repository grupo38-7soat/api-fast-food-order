FROM node:20.13.1-alpine

WORKDIR /app

COPY /package*.json .

RUN ls -la

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
