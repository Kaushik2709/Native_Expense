import express from 'express';
import cors from 'cors';
import exprenseRouter from './routes/expense.route.js';

const app = express();
app.use(
  cors({
    origin: "*", // your frontend port
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Expense Backend is running!" });
});

app.use('/api', exprenseRouter);


export default app;