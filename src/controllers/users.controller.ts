import express, {Request, Response} from "express";
import * as bcrypt from 'bcrypt';
import StatusCodes from 'http-status-codes';
import {
    ILoginRequest,
    IRegisterRequest
} from "../contracts/user.contracts";
import {body, param, validationResult} from 'express-validator';
import {UserEntity} from "../entities/user.entity";
import {dataSourceManager} from "../../server";

export const SALT_ROUNDS = 5;

export const usersController = express.Router();

usersController.get('/', async (request: Request, response: Response) => {
    const users = await dataSourceManager.find(UserEntity);
    return response.json(users);
});

usersController.get('/:userId', param('userId').isNumeric(), async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
    }

    const { userId } = request.params;

    const user = await dataSourceManager.findOne(UserEntity, { where: { id: Number(userId) }});
    return response.json(user);
})

usersController.post('/register',
    body('email', 'email must be a string').isEmail(),
    body('password', 'password must be a string').isString(),
    async(request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
        }

        const {email, password, firstName, lastName, phoneNumber} = request.body as IRegisterRequest;

        const userExists = await dataSourceManager.findOne(UserEntity, {where: { email }});
        if (userExists) {
            return response.status(StatusCodes.FORBIDDEN).send({ message: 'User with such email already exists' });
        }

        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const encryptedPassword = await bcrypt.hash(password, salt);

        const newUser = await dataSourceManager.save(UserEntity, {firstName, lastName, phoneNumber, email, password: encryptedPassword});
        return response.json({ message: `You've successfully registered`, userId: newUser.id });
});

usersController.post('/login',
    body('email', 'login should be a string').isString(),
    body('password', 'password should be a string').isString(),
    async(request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
        }

        const { email, password } = request.body as ILoginRequest;

        const user = await dataSourceManager.findOne(UserEntity, {where: {email}});
        if (!user) {
            return response.status(StatusCodes.FORBIDDEN).send({ message: `User doesn't exist` });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return response.status(StatusCodes.FORBIDDEN).send({ message: 'Incorrect credentials' });
        }

        response.cookie('isAuthenticated', true, {maxAge: 1000 * 20});
        return response.json({ message: `You've successfully logged in`, userId: user.id });
});

usersController.post('/logout', async(request: Request, response: Response) => {
    response.clearCookie('isAuthenticated');
    return response.json(`You've successfully logged out`);
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
            return response.status(StatusCodes.NOT_FOUND).send({ message: `User with id ${id} not found` });
        }

        const users = await dataSourceManager.update(UserEntity, { id}, {...request.body});
        return response.json(users);
    });
