import supertest = require("supertest");
import StatusCodes from 'http-status-codes';
import {app} from "../server";
import {IPostBookingRequest} from "../src/contracts/booking.contracts";
import moment = require("moment");

const server = app.listen();
const request = supertest.agent(server);

describe('Bookings endpoints', () => {
    afterAll(() => {
        server.close();
    });

    describe('GET /bookings', () => {
       it('Should correctly return bookings for a listed amenity id and a specific timestamp', async() => {
            const timestamp = 1635422294612;
            const timestampTransformed = moment(timestamp).startOf('day').valueOf();

            const booking1 = {userId: 1, amenityId: 1, startTime: 0, endTime: 120, timestamp};
            const booking2 = {userId: 1, amenityId: 1, startTime: 180, endTime: 240, timestamp};

            await request.post('/bookings')
                .send(booking1);
            await request.post('/bookings')
                .send(booking2);

            const {body} = await request.get(`/bookings?amenityId=${1}&timestamp=${timestampTransformed}`);
            expect(body).toHaveLength(2);

            await request.delete('/bookings')
                .send(booking1);
            await request.delete('/bookings')
                .send(booking2);
       })
    });

    describe('POST /bookings', () => {
        it('Should correctly add a new booking', async() => {
            const requestBody: IPostBookingRequest = {
                userId: 1,
                amenityId: 1,
                startTime: 120,
                endTime: 180,
                timestamp: 1635412765840
            };

            const response = await request.post('/bookings')
                .send(requestBody);

            await request.delete('/bookings') //a workaround to not overwrite a table with the same record
                .send(requestBody);
            expect(response.statusCode).toEqual(StatusCodes.ACCEPTED);
        });

        it('Should throw a bad request if body is empty', async() => {
            const response = await request.post('/bookings')
                .send({});
            expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        });

        it('Should throw a bad request if body is invalid', async() => {
            const response = await request.post('/bookings')
                .send({userId: "someUserId"});
            expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        })
    });

    describe('GET /bookings/:userId', () => {
        it('Should correctly return user bookings', async() => {
            const addUserRequestBody = {
                name: "testUser3",
                login: "testLogin3",
                password: "testPassword3"
            };

            const addUserResponse = await request.post('/users/register')
                .send(addUserRequestBody);
            expect(addUserResponse.statusCode).toEqual(StatusCodes.ACCEPTED);

            const {body} = await request.get('/users');
            const userData = body.pop();
            const {id: userId} = userData;

            const addBookingRequestBody: IPostBookingRequest = {
                userId,
                amenityId: 1,
                startTime: 0,
                endTime: 60,
                timestamp: 1635415673262
            };

            const addBookingRequest = await request.post('/bookings')
                .send(addBookingRequestBody);
            expect(addBookingRequest.statusCode).toEqual(StatusCodes.ACCEPTED);

            const userBookingsResponse = await request.get(`/bookings/${userId}`);
            expect(userBookingsResponse.body.length).toBeGreaterThan(0);

            await request.delete(`/bookings`)
                .send({userId, amenityId: 1, startTime: addBookingRequestBody.startTime, endTime: addBookingRequestBody.endTime});
            await request.delete(`/users/`)
                .send({userId});
        })
    })
});