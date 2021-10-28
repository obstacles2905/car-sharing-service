import supertest = require("supertest");
import StatusCodes from 'http-status-codes';
import {app} from "../server";

const server = app.listen();
const request = supertest.agent(server);

describe('Users endpoints', () => {
    afterAll(() => {
        server.close();
    });

    describe('POST /register', () => {
        it('Should throw a bad request if body is empty', async() => {
            const response = await request.post('/users/register')
                .send({});
            expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        });

        it('Should throw a bad request if body is incorrect', async() => {
            const requestBody = {
                name: 0,
                login: 1,
                password: 2
            };

            const response = await request.post('/users/login')
                .send(requestBody);
            expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        });

        it ('Should throw forbidden if user already exists', async() => {
            const userCredentials = {
                name: "testUser2",
                login: "testLogin2",
                password: "testPassword2",
            };
            await request.post('/users/register')
                .send(userCredentials);
            const response = await request.post('/users/register')
                .send(userCredentials);

            expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
        });

        it('Should correctly add a new user', async () => {
            const newUserCredentials = {
                name: "testUser1",
                login: "testLogin1",
                password: "testPassword1"
            };
            await request.post('/users/register')
                .send(newUserCredentials);

            const response = await request.get('/users');
            const {body} = response;

            const isUserExist = body.find((user: any) => user.login === newUserCredentials.login);
            expect(isUserExist).not.toBeUndefined();
        });
    });

    describe('POST /login', () => {
        it('Should throw a bad request if body is empty', async() => {
            const response = await request.post('/users/login')
                .send({});
            expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        });

        it('Should throw a bad request if body is incorrect', async() => {
            const requestBody = {
                login: 1,
                password: 2
            };

            const response = await request.post('/users/login')
                .send(requestBody);
            expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        });

        it('Should correctly log in an existing user', async() => {
            const credentials = {
                login: "testLogin1",
                password: "testPassword1"
            };

            const response = await request.post('/users/login')
                .send(credentials);

            expect(response.body).toEqual("You've successfully logged in");
        })
    });
});