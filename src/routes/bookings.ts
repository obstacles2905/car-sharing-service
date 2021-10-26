import express, {Request, Response} from "express";
import StatusCodes from 'http-status-codes';
import moment = require("moment");
import {db} from "../db/dbProvider";

export const bookingsRouter = express.Router();

export interface IGetBookingsRequest {
    amenityId: number;
    timestamp: string;
}

export interface IGetBookingsResponse {
    id: number;
    "user_id": number;
    "amenity_id": number;
    "start_time": number;
    "end_time": number;
    "date": string;
}

export interface IGetBookingsResponseTransformed {
    bookingId: number;
    userId: number;
    startTime: string;
    duration: string;
    amenityName: string;
}

export interface IPostBookingRequest {
    userId: number;
    amenityId: number;
    startTime: number;
    endTime: number;
    date: number;
}

bookingsRouter.get('/', async(request: Request, response: Response) => {
    const {amenityId, timestamp} = request.query as unknown as IGetBookingsRequest;
    if (!amenityId || !timestamp) {
        return response.status(StatusCodes.BAD_REQUEST).send('Required properties amenityId and timestamp are not provided');
    }

    const timestampToZeroHourFormat = moment.unix(Number(timestamp)/1000).startOf('day').valueOf();
    const bookingsForListedDay = await db.any(`SELECT * FROM bookings WHERE amenity_id = '${amenityId}' AND date = '${timestampToZeroHourFormat}'`) as IGetBookingsResponse[];

    const bookingsTransformed: IGetBookingsResponseTransformed[] = bookingsForListedDay.map(booking => ({
        bookingId: booking.id,
        userId: booking.user_id,
        startTime: `${moment.utc(booking.start_time * 60 * 1000).format('HH:mm')}`,
        duration: `${booking.end_time - booking.start_time} minutes`,
        amenityName: 'TODO do a join to fetch it'
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

});