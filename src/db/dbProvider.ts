import pgPromise, {IEventContext, IInitOptions} from "pg-promise";
import * as pg from "pg-promise/typescript/pg-subset";
import {logger} from "../logger";

const initOptions: IInitOptions = {
    error(err: any, event: IEventContext<pg.IClient>) {
        logger.error('PostgreSQL error', { error: err, callstack: new Error().stack });
    }
};

export const dbProvider = pgPromise(initOptions);
export const db = dbProvider({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: 'postgres',
    user: 'admin',
    password: 'admin'
});