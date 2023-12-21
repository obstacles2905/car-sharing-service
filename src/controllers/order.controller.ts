import express, {Request, Response} from "express";
import {body, query, validationResult} from "express-validator";
import StatusCodes from "http-status-codes";
import {dataSourceManager} from "../../server";
import {CarEntity, CarStatusEnum} from "../entities/car.entity";
import {UserEntity} from "../entities/user.entity";
import moment from "moment/moment";
import {CreateOrderDTO, OrderStatusEnum} from "../contracts/order.contracts";
import {getUserBalance} from "../services/balance.service";
import {OrderEntity} from "../entities/order.entity";
import {TransactionEntity} from "../entities/transaction.entity";
import {CreateTransactionDTO, TransactionTypeEnum} from "../contracts/transaction.contracts";

export const ordersController = express.Router();

ordersController.get(
    '/active-orders',
    query('userId').isNumeric(),
    async (request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }

        const { userId } = request.query;

        const user = await dataSourceManager.findOne(UserEntity, {
            where: { id: Number(userId) }
        })
        if (!user) {
            return response.status(StatusCodes.NOT_FOUND).send(`User with id ${userId} not found`);
        }

        const activeOrders = await dataSourceManager.find(
            OrderEntity,
            {
                where: { userId: Number(userId), status: OrderStatusEnum.ACTIVE }
            }
        );
        return response.json({ activeOrders });
})

ordersController.post(
    '/start-rent',
    body('userId').isNumeric(),
    body('carId').isNumeric(),
    body('daysAmount').isNumeric(),
    async (request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }

        const { userId, carId, daysAmount } = request.body;

        const user = await dataSourceManager.findOne(UserEntity, {
            where: { id: Number(userId) }
        })
        if (!user) {
            return response.status(StatusCodes.NOT_FOUND).send(`User with id ${userId} not found`);
        }

        const car = await dataSourceManager.findOne(CarEntity, {
            where: { id: Number(carId), status: CarStatusEnum.AVAILABLE }
        });
        if (!car) {
            return response.status(StatusCodes.NOT_FOUND).send(`No available cars with id ${carId}`);
        }

        const { rentPrice } = car;
        const totalRentPrice = Number(rentPrice) * Number(daysAmount);

        const newOrder: CreateOrderDTO = {
            userId,
            carId,
            startTime: moment().format(),
            endTime: moment().add(daysAmount, 'days').format(),
            cost: totalRentPrice,
            status: OrderStatusEnum.UNPAID,
            pickupLocation: 'somePickupLocation',
            dropOffLocation: 'someDropOffLocation'
        };

        const userBalance = await getUserBalance(Number(userId));
        const isSufficientFunds = userBalance - totalRentPrice >= 0;
        if (!isSufficientFunds) {
            dataSourceManager.create(OrderEntity, newOrder);
            return response.status(StatusCodes.FORBIDDEN).send(`Insufficient funds`);
        }

        let orderStatus: OrderStatusEnum = OrderStatusEnum.UNPAID;

        try {
            await dataSourceManager.transaction(async (transactionManager) => {
                const order = await transactionManager.save(OrderEntity, newOrder);

                const transaction: CreateTransactionDTO = {
                    userId: Number(userId),
                    orderId: Number(order.id),
                    transactionType: TransactionTypeEnum.PAYMENT,
                    amount: totalRentPrice,
                }
                await transactionManager.save(TransactionEntity, transaction);

                await transactionManager.update(UserEntity, { id: userId }, { balance: userBalance - totalRentPrice })
                await transactionManager.update(OrderEntity, { id: order!.id } , { status: OrderStatusEnum.ACTIVE });
                await transactionManager.update(CarEntity, { id: carId }, { status: CarStatusEnum.IN_USAGE });

                await transactionManager.findOne(OrderEntity, { where: { id: order.id } });
            })

            orderStatus = OrderStatusEnum.ACTIVE;
        } catch (err) {
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
        }

        return response.send({
            orderStatus,
            ...car,
        });
    })

ordersController.post(
    '/finish-rent',
    body('orderId').isNumeric(),
    body('latitude').isFloat(),
    body('longitude').isFloat(),
    async (request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }

        const { orderId, latitude, longitude } = request.body;

        const order = await dataSourceManager.findOne(OrderEntity, {
            where: {
                id: Number(orderId),
                status: OrderStatusEnum.ACTIVE
            }
        });
        if (!order) {
            return response.status(StatusCodes.NOT_FOUND).send(`Order with id ${orderId} doesnt exist or is not in active state`);
        }
        const { carId } = order;

        try {
            await dataSourceManager.transaction(async (transactionManager) => {
                await transactionManager.update(CarEntity, { id: carId }, { status: CarStatusEnum.AVAILABLE, latitude, longitude });
                await transactionManager.update(OrderEntity, { id: orderId }, { status: OrderStatusEnum.FINISHED });
            })
        } catch (err) {
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
        }

        return response.send(`Order with id ${orderId} successfully finished`);
    })

ordersController.post(
    '/calculate-rent-price',
    body('carId').isNumeric(),
    body('daysAmount').isNumeric(),
    async (request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }

        const { carId, daysAmount } = request.body;

        const car = await dataSourceManager.findOne(CarEntity, {
            where: { id: Number(carId), status: CarStatusEnum.AVAILABLE }
        });
        if (!car) {
            return response.status(StatusCodes.NOT_FOUND).send(`No available cars with id ${carId}`);
        }

        const { rentPrice } = car;
        const totalRentPrice = Number(rentPrice) * Number(daysAmount);
        return response.json({totalRentPrice});
    })
