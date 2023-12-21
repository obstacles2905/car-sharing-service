import express, {Request, Response} from "express";
import * as bcrypt from 'bcrypt';
import StatusCodes from 'http-status-codes';
import {
    ILoginRequest,
    IRegisterRequest
} from "../contracts/user.contracts";
import {body, validationResult} from 'express-validator';
import {UserEntity} from "../entities/user.entity";
import {dataSourceManager} from "../../server";

export const SALT_ROUNDS = 5;

export const usersController = express.Router();

usersController.get('/', async(request: Request, response: Response) => {
    const users = await dataSourceManager.find(UserEntity);
    return response.json(users);
});

usersController.put('/',
    body('userId', 'userId must be a valid number').isNumeric(),
    async(request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
        }

        const {userId: id} = request.body;

        const userExists = await dataSourceManager.findOne(UserEntity, {where: {id}});
        if (!userExists) {
            return response.status(StatusCodes.NOT_FOUND).send(`User with id ${id} not found`);
        }

        const users = await dataSourceManager.update(UserEntity, { id}, {...request.body});
        return response.json(users);
});

usersController.post('/register',
    body('email', 'email must be a string').isEmail(),
    body('login', 'login must be a string').isString(),
    body('password', 'password must be a string').isString(),
    async(request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
        }

        const {email, login, password} = request.body as IRegisterRequest;

        const isUserExist = await dataSourceManager.findOne(UserEntity, {where: {email, login}});
        if (isUserExist) {
            return response.status(StatusCodes.FORBIDDEN).send('User with such login or email already exists');
        }

        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const encryptedPassword = await bcrypt.hash(password, salt);

        await dataSourceManager.insert(UserEntity, {email, login, password: encryptedPassword});
        return response.status(StatusCodes.ACCEPTED).send(`You've successfully registered`);
});

usersController.post('/login',
    body('login', 'login should be a string').isString(),
    body('password', 'password should be a string').isString(),
    async(request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
        }

        const {login, password} = request.body as ILoginRequest;

        const userData = await dataSourceManager.findOne(UserEntity, {where: {login}});
        if (!userData) {
            return response.status(StatusCodes.FORBIDDEN).send(`User doesn't exist`);
        }

        const isValidPassword = await bcrypt.compare(password, userData.password);
        if (!isValidPassword) {
            return response.status(StatusCodes.FORBIDDEN).send('A password is not correct');
        }

        response.cookie('isAuthenticated', true, {maxAge: 1000 * 20});
        return response.json(`You've successfully logged in`);
});

usersController.post('/logout', async(request: Request, response: Response) => {
    response.clearCookie('isAuthenticated');
    return response.json(`You've successfully logged out`);
});
