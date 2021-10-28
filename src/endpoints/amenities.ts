import express, {Request, Response} from "express";
import { db } from "../db/dbProvider";
import {body, validationResult} from 'express-validator';
import StatusCodes from 'http-status-codes';

export const amenitiesRouter = express.Router();

amenitiesRouter.get('/', async(request: Request, response: Response) => {
    const amenities = await db.any('SELECT * from amenities');
    return response.json(amenities);
});

amenitiesRouter.post('/', body('name', 'name should be a string').isString(), async(request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
    }

    const {name} = request.body;
    await db.any(`INSERT INTO amenities (name) VALUES ('${name}')`);
    return response.status(StatusCodes.ACCEPTED).send('An amenity has successfully been added')
});

amenitiesRouter.delete('/', body('name','name should be a string').isString(), async(request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
    }

    const {name} = request.body;
    const result = await db.any(`DELETE FROM amenities WHERE name= '${name}'`);

    if (result.length === 0) {
        return response.status(StatusCodes.ACCEPTED).send(`An amenity with such name doesn't exist`);
    }

    return response.status(StatusCodes.ACCEPTED).send('An amenity has successfully been deleted');
});
