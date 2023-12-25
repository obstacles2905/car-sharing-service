import express, {Request, Response} from "express";
import {body, validationResult} from "express-validator";
import {dataSourceManager} from "../../server";
import StatusCodes from "http-status-codes";
import {CarEntity, CarStatusEnum} from "../entities/car.entity";

export const carLocationsController = express.Router();

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const EarthRadius = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return EarthRadius * c;
}

carLocationsController.post('/nearest',
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userLatitude = req.body.latitude;
        const userLongitude = req.body.longitude;

        let nearestCar: CarEntity | null = null;
        let shortestDistance = Infinity;

        const availableCars = await dataSourceManager.find(CarEntity, {where: {status: CarStatusEnum.AVAILABLE}});
        console.log("CARS", availableCars)

        availableCars.forEach(car => {
            const distance = calculateDistance(userLatitude, userLongitude, car.latitude, car.longitude);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestCar = car;
            }
        });

        if (nearestCar) {
            return res.json(nearestCar);
        } else {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'No nearest cars are found' });
        }
    }
);
