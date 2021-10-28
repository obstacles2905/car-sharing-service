import express from "express";
import * as bodyParser from "body-parser";
import cors from "cors";

import {amenitiesRouter} from "./src/endpoints/amenities";
import {bookingsRouter} from "./src/endpoints/bookings";
import {csvRouter} from "./src/endpoints/csv";
import {usersRouter} from "./src/endpoints/users";
import {logger} from "./src/logger";
import cookieParser = require("cookie-parser");

const port = process.env.APPLICATION_PORT;

export const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.use('/amenities', amenitiesRouter);
app.use('/bookings', bookingsRouter);
app.use('/csv', csvRouter);
app.use('/users', usersRouter);

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {logger.info(`Server is running on ${port}`)});
}