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
import {body, validationResult} from 'express-validator';

export const SALT_ROUNDS = 5;

export const usersRouter = express.Router();

usersRouter.get('/', async(request: Request, response: Response) => {
    const users = await db.any('SELECT id, name, login FROM users');
    return response.json(users);
});

usersRouter.post('/register',
    body('name', 'name should be a string').isString(),
    body('login', 'login should be a string').isString(),
    body('password', 'password should be a string').isString(),
    async(request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
        }

        const {name, login, password} = request.body as IRegisterRequest;

        const isUserExist = await db.any(`SELECT * FROM users WHERE login = '${login}'`);
        if (isUserExist.length > 0) {
            return response.status(StatusCodes.FORBIDDEN).send('Such login already exists');
        }

        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const encryptedPassword = await bcrypt.hash(password, salt);

        await db.any(`INSERT INTO users (name, login, salt) VALUES ('${name}', '${login}', '${encryptedPassword}')`);
        return response.status(StatusCodes.ACCEPTED).send(`You've successfully registered`);
});

usersRouter.post('/login',
    body('login', 'login should be a string').isString(),
    body('password', 'password should be a string').isString(),
    async(request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
        }

        const {login, password} = request.body as ILoginRequest;
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

usersRouter.delete('/', body('userId', 'userId should be a number').isNumeric(), async(request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
    }

    const {userId} = request.body;
    await db.any(`DELETE FROM users WHERE id = '${userId}'`);
    return response.json(`User ${userId} has been deleted`);
});