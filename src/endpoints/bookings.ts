import express, {Request, Response} from "express";
import StatusCodes from 'http-status-codes';
import moment = require("moment");
import {db} from "../db/dbProvider";
import {
    IGetBookingsRequest,
    IGetBookingsResponse,
    IGetBookingsResponseTransformed,
    IPostBookingRequest
} from "../contracts/booking.contracts";
import {body, query, param, validationResult} from 'express-validator';

export const bookingsRouter = express.Router();

bookingsRouter.get('/',
    query('amenityId', 'amenityId should be a number').isNumeric(),
    query('timestamp', 'timestamp should be a timestamp in milliseconds').isNumeric(),
    async(request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
        }

        const {amenityId, timestamp} = request.query as unknown as IGetBookingsRequest;
        const timestampToZeroHourFormat = moment.unix(Number(timestamp)/1000).startOf('day').valueOf();

        const bookingsForListedDay = await db.any(`SELECT b.id, b.user_id, b.start_time, b.end_time, a.name AS amenity_name FROM bookings AS b 
            INNER JOIN amenities as a
            ON b.amenity_id = a.id WHERE b.amenity_id = '${amenityId}' AND b.date = '${timestampToZeroHourFormat}' ORDER BY b.start_time;`) as IGetBookingsResponse[];

        const bookingsTransformed: IGetBookingsResponseTransformed[] = bookingsForListedDay.map(booking => ({
            bookingId: booking.id,
            userId: booking.user_id,
            startTime: `${moment.utc(booking.start_time * 60 * 1000).format('HH:mm')}`,
            duration: `${booking.end_time - booking.start_time} minutes`,
            amenityName: booking.amenity_name
        }));

        return response.json(bookingsTransformed);
});

bookingsRouter.post('/',
    body('userId', 'userId should be a number').isNumeric(),
    body('amenityId', 'amenityId should be a number').isNumeric(),
    body('startTime', 'startTime should be a 3 or 4 digits number describing a number of minutes since 00:00').isNumeric(),
    body('endTime', 'endTime should be a 3 or 4 digits number describing a number of minutes since 00:00').isNumeric(),
    body('timestamp', 'timestamp should be a timestamp in milliseconds').isNumeric(),
    async(request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
        }

        const {userId, amenityId, startTime, endTime, timestamp} = request.body as IPostBookingRequest;

        const isUserAlreadyHavingAmenity = await db.any(`SELECT * FROM bookings WHERE user_id = '${userId}' AND (end_time >= '${endTime}' AND start_time <= '${endTime}')`);
        if (isUserAlreadyHavingAmenity.length > 0) {
            return response.status(StatusCodes.BAD_REQUEST).send('User is already having an amenity at this time');
        }

        const dateWithZeroHourFormat = moment(timestamp).startOf('day').valueOf();
        await db.any(`INSERT INTO bookings 
            (user_id, amenity_id, start_time, end_time, date) VALUES 
            ('${userId}', '${amenityId}', '${startTime}', '${endTime}', '${dateWithZeroHourFormat}')`
        );

        return response.status(StatusCodes.ACCEPTED).send('A booking has successfully been added');
});

bookingsRouter.get('/:userId',
    param('userId', 'userId should be a number').isNumeric(),
    async(request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
        }

        const {userId} = request.params;
        const userBookings: IGetBookingsResponse[] = await db.any(`SELECT * FROM bookings WHERE user_id = '${userId}' ORDER BY date`);
        const userBookingsTransformed =userBookings.map(booking => ({
            bookingId: booking.id,
            userId: booking.user_id,
            startTime: booking.start_time,
            endTime: booking.end_time,
            date: moment.unix(Number(booking.date)/1000).startOf('day')
        }));
        return response.json(userBookingsTransformed);
});