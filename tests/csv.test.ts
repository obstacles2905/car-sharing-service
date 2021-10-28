import supertest = require("supertest");
import StatusCodes from 'http-status-codes';
import {app} from "../server";

const server = app.listen();
const request = supertest.agent(server);

describe('Csv endpoints', () => {
    describe('POST /csv', () => {
        it(`Should return an unauthorized if user is not authorized`, async() => {
            const response = await request.post('/csv');

            expect(response.body).toEqual(`You're not authenticated to the system to use this endpoint`);
            expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
        });

        it('Should correctly parse a csv file', async() => {
            const name = 'csvName1';
            const login = 'csvLogin1';
            const password = 'csvPassword1';

            await request.post('/users/register')
                .send({name, login, password});

            await request.post('/users/login')
                .send({login, password});

            const response = await request.post('/csv')
                .set('Content-Type', 'multipart/form-data')
                .attach('file', 'tests/mocks/Amenity.csv');

            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0]).toHaveProperty('name');

            const getUsersResponse = (await request.get('/users')).body;
            const {id: userId} = getUsersResponse.pop();
            await request.delete('/users').send({userId});
        })
    })
});