import express, {Request, Response} from "express";
import { db } from "../db/dbProvider";
import * as bcrypt from 'bcrypt';
import { logger } from "../logger";
import StatusCodes from 'http-status-codes';
import {
    ILoginRequest,
    ILoginResponse,
    IRegisterRequest
} from "../contracts/user.contracts";

export const usersRouter = express.Router();

usersRouter.get('/', async(request: Request, response: Response) => {
    const users = await db.any('SELECT id, name, login FROM users');
    response.json(users);
});

usersRouter.post('/register', async(request: Request, response: Response) => {
    const {name, login, password} = request.body as IRegisterRequest;
    if (!name || !login || !password) {
        return response.status(StatusCodes.BAD_REQUEST).send('Required properties name, login and password are not provided');
    }

    const isUserExist = await db.any(`SELECT * FROM users WHERE login = '${login}'`);

    if (isUserExist.length > 0) {
        return response.status(StatusCodes.FORBIDDEN).send('Such login already exists');
    }

    const salt = await bcrypt.genSalt(5);
    const encryptedPassword = await bcrypt.hash(password, salt);

    await db.any(`INSERT INTO users (name, login, salt) VALUES ('${name}', '${login}', '${encryptedPassword}')`);
    return response.status(StatusCodes.ACCEPTED).send(`You've successfully registered`);
});

usersRouter.post('/login', async(request: Request, response: Response) => {
    const {login, password} = request.body as ILoginRequest;
    if (!login || !password) {
        return response.status(StatusCodes.BAD_REQUEST).send('Required properties login and password are not provided');
    }

    const userData = await db.any(`SELECT * FROM users WHERE login = '${login}'`) as ILoginResponse[];
    if (userData.length === 0) {
        return response.status(StatusCodes.FORBIDDEN).send(`User doesn't exist`);
    }

    const isValidPassword = await bcrypt.compare(password, userData[0].salt);
    if (!isValidPassword) {
        return response.status(StatusCodes.FORBIDDEN).send('A password is not correct');
    }

    response.cookie('isAuthenticated', true, {maxAge: 1000 * 20});
    return response.json(`You've successfully logged in`);
});

usersRouter.post('/logout', async(request: Request, response: Response) => {
    response.clearCookie('isAuthenticated');
    return response.json(`You've successfully logged out`);
});