# Car sharing service

## Description

Service to comfortably rent cars

## Endpoints

### Balance

TBD

### Users

1. GET /users - list all users
2. POST /users/register - register user. Endpoint requires three fields: name, login and password
3. POST /users/login - login user. Endpoint requires two fields: login and password

### Cars

TBD

### Car locations

TBD 
### Orders


## Environment
Required environment variables
```bash
NODE_ENV

POSTGRES_HOST
POSTGRES_PORT
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD

APPLICATION_PORT
```

You can change them in the .env file

## How to run

1. Install dependencies with:

```bash
yarn install
```

2. Setup Postgres and PGAdmin containers by running a

```bash
docker-compose up -d
```

docker-compose will also setup some stock data for tables that's stored in init.sql file 

3. Launch a typescript build watcher

```bash
yarn watch-ts
```

4. Start an application

```bash
yarn start
```

After performing those operations a server will start. A default port is 8080.

## Tests
To properly launch tests you need to bootstrap a postgres image from a docker-compose first

```bash
yarn test
```
