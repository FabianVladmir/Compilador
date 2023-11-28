FROM node:18-bookworm

WORKDIR /app
COPY . .

RUN apt install python3 -y
RUN npm install

EXPOSE 8080

CMD ["npm", "run", "start"]
