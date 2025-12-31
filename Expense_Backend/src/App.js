import express from 'express';
import cors from 'cors';
import exprenseRouter from './routes/expense.route.js';

const app = express();
app.use(
  cors({
    origin: "http://localhost:8081", // your frontend port
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api',exprenseRouter);


export default app;