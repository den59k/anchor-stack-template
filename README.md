# Template for fast deploy awesome fullStack apps ⚓

* Fastify

* Prisma

* Vue3

# Features

* Run backend and frontend one command

* Auto collect fastify routes and plugins

* Auto generate doc

* Auto collect frontend Vue components

## Development

Create `.env` file with next properties 📝

```
PG_DATABASE_URL=postgresql://postgres:5678@localhost:5432/test
```

Install dependencies 🐣
```
yarn install
```

Run migrations 💎
```
yarn prisma migrate deploy
```

Create root user 👤
```
yarn init:db
```

Run the app ⚡
```
yarn dev
```