import express, {Request, Response} from "express";
import {dataSourceManager} from "../../server";
import {UserEntity} from "../entities/user.entity";
import StatusCodes from "http-status-codes";
import {body, param, validationResult} from "express-validator";
import {getUserBalance} from "../services/balance.service";

export const balanceController = express.Router();

balanceController.get(
    '/:userId',
    param('userId').isNumeric(),
    async (request: Request, response: Response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }

        const {userId} = request.params;

        const balance = Number(await getUserBalance(Number(userId)));
        return response.send({ balance });
    } catch(err) {
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
    }
})

balanceController.post(
    '/deposit',
    body('userId').isNumeric(),
    body('amount').isNumeric(),
    async (request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }

        const { userId, amount } = request.body;

        const user = await dataSourceManager.findOne(UserEntity, { where: {id: Number(userId)} });
        if (!user) {
            return response.status(StatusCodes.NOT_FOUND).send(`User with id ${userId} not found`);
        }

        const { balance } = user;
        const balanceAfterDeposit = Number(balance) + Number(amount);

        await dataSourceManager.update(UserEntity,
            { id: Number(userId) },
            { balance: balanceAfterDeposit }
        )

        const userUpdated = await dataSourceManager.findOne(UserEntity, { where: {id: Number(userId)} });
        return response.json(userUpdated);
    });
