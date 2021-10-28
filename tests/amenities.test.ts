import supertest = require("supertest");
import StatusCodes from 'http-status-codes';
import {app} from "../server";

const server = app.listen();
const request = supertest.agent(server);

describe('Amenities endpoints', () => {
    describe('POST /amenities', () => {
        it('Should throw a bad request if a provided amenity name is incorrect', async() => {
            const response = await request.post('/amenities')
                .send({name: 123});

            expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
        });

        it('Should throw a bad request if there is no amenity name provided', async() => {
            const response = await request.post('/amenities');

            expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
        });

        it('Should correctly add a new amenity', async() => {
            const name = 'Amenity1';
            const addAmenityResponse = await request.post('/amenities')
                .send({name});
            expect(addAmenityResponse.statusCode).toBe(StatusCodes.ACCEPTED);

            const getAmenitiesResponse = await request.get('/amenities');
            expect(getAmenitiesResponse.body.length).toBeGreaterThan(0);

            await request.delete('/amenities').send({name});
        })
    });
});