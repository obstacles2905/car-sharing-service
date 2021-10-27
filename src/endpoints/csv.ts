import express, {NextFunction, Request, Response} from "express";
import multer from "multer";
import * as fs from "fs";
import * as csv from 'fast-csv';
import * as path from "path";
import {logger} from "../logger";
import StatusCodes from 'http-status-codes';

export const csvRouter = express.Router();

const upload = multer({dest: 'src/csv' });

export function isAuthenticated(request: Request, response: Response, next: NextFunction) {
    if (!request.cookies.isAuthenticated) {
        return response.status(StatusCodes.FORBIDDEN).json(`You're not authenticated to the system to use this endpoint`);
    }
    next();
}

csvRouter.post(
    "/",
    isAuthenticated,
    upload.single('file'),
    async(request: Request, response: Response) => {
    const filePath = path.resolve(__dirname, '../csv', request.file!.filename);

    const data: any[] = [];
    fs.createReadStream(filePath)
        .pipe(csv.parse())
        .on("error", (error) => {
            throw error.message;
        })
        .on("data", (row) => {
            data.push(row);
        })
        .on('end', () => {
            logger.info(`The file ${request.file!.originalname} has been processed`);
            const dataTransformed = transformCsvData(data);
            return response.json(dataTransformed);
        });
});

function transformCsvData(data: any[]) {
    const result: any[] = [];
    const headers: string[] = data.shift()[0].split(';');

    data.forEach(row => {
        const dataParsed = row[0].split(';');
        const rowTransformed: any = {};

        headers.forEach((header, headerIndex) => {
            rowTransformed[header] = dataParsed[headerIndex];
        });
        result.push(rowTransformed);
    });

    return result;
}