import express from "express";
import * as bodyParser from "body-parser";
import cors from "cors";

import * as dotenv from 'dotenv';
import {usersController} from "./src/controllers/users.controller";
import {logger} from "./src/logger";
import cookieParser = require("cookie-parser");
import "reflect-metadata";
import {DataSource} from "typeorm";
import {carsController} from "./src/controllers/cars.controller";
import {carLocationsController} from "./src/controllers/car-locations.controller";
import {balanceController} from "./src/controllers/balance.controller";
import {ordersController} from "./src/controllers/order.controller";
import morgan from "morgan";

dotenv.config();

const port = process.env.APPLICATION_PORT;

export const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(morgan('combined'));

app.use('/balance', balanceController);
app.use('/cars', carsController);
app.use('/car-locations', carLocationsController);
app.use('/orders', ordersController);
app.use('/users', usersController);

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT!),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [
        "src/entities/**/*.ts"
    ],
    synchronize: true
})

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })

export const dataSourceManager = AppDataSource.manager;


if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {logger.info(`Server is running on ${port}`)});
}
