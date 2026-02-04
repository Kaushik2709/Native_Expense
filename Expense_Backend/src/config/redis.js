import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD || '7EFR4rLE8fNxYSi0FUNWrF3UUb6HsUEr',
    socket: {
        host: process.env.REDIS_HOST || 'redis-19428.crce276.ap-south-1-3.ec2.cloud.redislabs.com',
        port: parseInt(process.env.REDIS_PORT) || 19428
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

await redisClient.connect();

export default redisClient;
