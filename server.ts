import express from "express";
import * as bodyParser from "body-parser";
import * as dotenv from "dotenv";
import cors from "cors";

import {usersRouter} from "./src/endpoints/users";
import {bookingsRouter} from "./src/endpoints/bookings";
import {csvRouter} from "./src/endpoints/csv";
import {logger} from "./src/logger";
import cookieParser = require("cookie-parser");
dotenv.config();

const port = process.env.APPLICATION_PORT;

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.use("/csv", csvRouter);
app.use('/users', usersRouter);
app.use('/bookings', bookingsRouter);

app.listen(port, () => {logger.info(`Server is running on ${port}`)});