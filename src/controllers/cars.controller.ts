import express, {Request, Response} from "express";
import {dataSourceManager} from "../../server";
import {CarEntity, CarStatusEnum} from "../entities/car.entity";
import StatusCodes from "http-status-codes";
import {body, validationResult} from "express-validator";

export const carsController = express.Router();

carsController.get('/', async (request: Request, response: Response) => {
    const cars = await dataSourceManager.find(CarEntity, {});
    return response.json(cars);
})

carsController.get('/:id', async (request: Request, response: Response) => {
    try {
        const {id: carId} = request.params;
        const car = await dataSourceManager.findOne(CarEntity, {
            where: {id: Number(carId)}
        });

        if (!car) {
            return response.status(StatusCodes.NOT_FOUND).send(`Car with id ${carId} not found`);
        }

        return response.json(car);
    } catch(err) {
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
    }
})

carsController.get('/', async (request: Request, response: Response) => {
    try {
        const {id: carId} = request.params;
        const car = await dataSourceManager.findOne(CarEntity, {
            where: {id: Number(carId)}
        });

        if (!car) {
            return response.status(StatusCodes.NOT_FOUND).send(`Car with id ${carId} not found`);
        }

        return response.json(car);
    } catch(err) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
    }
})

carsController.post('/',
    body('brand').isString(),
    body('model').isString(),
    body('year').isNumeric(),
    body('registrationNumber').isString(),
    body('color').isString(),
    body('fuelType').isString(),
    body('mileage').isNumeric(),
    body('condition').isString(),
    body('latitude').isString(),
    body('longitude').isString(),
    body('photoUrl').isURL(),
    body('status').isString(),
    body('rentPrice').isNumeric(),
    async (request: Request, response: Response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
            }

            const newCar = await dataSourceManager.save(CarEntity, {
                brand: request.body.brand,
                model: request.body.model,
                year: request.body.year,
                registrationNumber: request.body.registrationNumber,
                color: request.body.color,
                fuelType: request.body.fuelType,
                mileage: request.body.mileage,
                condition: request.body.condition,
                latitude: request.body.latitude,
                longitude: request.body.longitude,
                photoUrl: request.body.photoUrl,
                rentPrice: request.body.rentPrice,
                status: request.body.status
            });

            return response.json(newCar);
        } catch (err) {
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
        }
})
