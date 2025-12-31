import express from "express";
import expenseController from "../controllers/expense.controller.js";

const router = express.Router();

router.post('/expenses', expenseController.addExpense);
router.get('/expenses', expenseController.getExpenses);
router.get('/user', expenseController.getCurrentUser);
router.get('/users', expenseController.getAllUsers);

export default router;