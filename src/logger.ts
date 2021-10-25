const winston = require("winston");

export const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: "amenity-service"},
    transports: [new winston.transports.Console()]
});
