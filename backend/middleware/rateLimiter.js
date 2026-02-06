import rateLimit from 'express-rate-limit';

export const deliveryStatusLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 5, 
    message: {
        message: 'Too many status updates from this IP, please try again after a minute'
    },
    standardHeaders: true, 
    legacyHeaders: false,  
});
