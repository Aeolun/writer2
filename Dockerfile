FROM node:16

COPY . /application

WORKDIR /application

RUN npm install -g pnpm && pnpm install && pnpm run build

CMD pnpm start

EXPOSE 3000
