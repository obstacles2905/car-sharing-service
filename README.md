# Amenity Service

## Description

An amenity service is an app that stores users, amenities and bookings data

## Endpoints

### Amenities

1. GET /amenities - list all amenities
2. POST /amenities - add a new amenity. Endpoint requires a name parameter

### Users

1. GET /users - list all users
2. POST /users/register - register user. Endpoint requires three fields: name, login and password
3. POST /users/login - login user. Endpoint requires two fields: login and password

### Bookings

1. GET /bookings/ - get all bookings for a listed amenity id and a listed timestamp. Endpoint requires two fields: amenitiyId and timestamp
2. POST /bookings - add a new booking. Endpoint requires a number of fields: userId, amenityId, startTime, endTime, date.
3. GET /bookings/:userId - get all bookings made by a specific user. Endpoint requires userId

### Csv

1. POST /csv - process a csv file and get JSON parsed data. An endpoint requires user to be logged in the system by a POST /login endpoint 

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