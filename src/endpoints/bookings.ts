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

export const bookingsRouter = express.Router();

bookingsRouter.get('/', async(request: Request, response: Response) => {
    const {amenityId, timestamp} = request.query as unknown as IGetBookingsRequest;
    if (!amenityId || !timestamp) {
        return response.status(StatusCodes.BAD_REQUEST).send('Required properties amenityId and timestamp are not provided');
    }

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

bookingsRouter.post('/', async(request: Request, response: Response) => {
    const {userId, amenityId, startTime, endTime, date} = request.body as IPostBookingRequest;

    if (!userId || !amenityId || !startTime || !endTime || !date) {
        return response.status(StatusCodes.BAD_REQUEST).send('Required properties userId, amenityId, startTime, endTime and date are not provided');
    }

    const isUserAlreadyHavingAmenity = await db.any(`SELECT * FROM bookings WHERE user_id = '${userId}' AND (end_time > '${endTime}' AND start_time < '${endTime}')`);
    if (isUserAlreadyHavingAmenity.length > 0) {
        return response.status(StatusCodes.BAD_REQUEST).send('User is already having an amenity at this time');
    }

    const dateWithZeroHourFormat = moment(date).startOf('day').valueOf();
    await db.any(`INSERT INTO bookings 
        (user_id, amenity_id, start_time, end_time, date) VALUES 
        ('${userId}', '${amenityId}', '${startTime}', '${endTime}', '${dateWithZeroHourFormat}')`
    );

    return response.status(StatusCodes.ACCEPTED).send('A booking has successfully been added');
});

bookingsRouter.get('/:userId', async(request: Request, response: Response) => {
    const {userId} = request.params;
    if (!userId || !Number(userId)) {
        return response.status(StatusCodes.BAD_REQUEST).send('User id is either missing or is not a numeric type');
    }

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