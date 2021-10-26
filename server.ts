import express from "express";
import * as bodyParser from "body-parser";
import * as dotenv from "dotenv";
import {router} from "./src/routes/router";
import cors from "cors";

import {logger} from "./src/logger";
import {usersRouter} from "./src/routes/users";
import {bookingsRouter} from "./src/routes/bookings";
dotenv.config();

const port = process.env.APPLICATION_PORT;

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use("/", router);
app.use('/users', usersRouter);
app.use('/bookings', bookingsRouter);

const server = app.listen(port, () => {logger.info(`Server is running on ${port}`)});