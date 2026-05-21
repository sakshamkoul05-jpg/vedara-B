FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

ARG DATABASE_URL=postgresql://dummy:password@localhost:5432/dummy
RUN npm install
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src/

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
