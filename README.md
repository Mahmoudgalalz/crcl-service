## Installation

```bash
$ pnpm install
```

## running the services via docker compose

```bash
docker compose up -d
## or docker-compose up -d
```

## running the Migration to the database

```bash
npx prisma migrate dev
```

## Running the app

```bash

# watch mode
$ pnpm run start:dev

```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
