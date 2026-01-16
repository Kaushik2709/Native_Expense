import expenseServices from "../services/expense.services.js";
import { supabase } from "../config/supabase.js";
const expenseController = {
  addExpense: async (req, res) => {
    try {
      const { description, amount, accounts_type } = req.body;
      if (!amount || !accounts_type) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const expense = await expenseServices.createExpense({
        description,
        amount,
        accounts_type,
      });
      return res
        .status(201)
        .json({ message: "Expense added successfully", expense });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getExpenses: async (req, res) => {
    try {
      const expenses = await expenseServices.getExpenses();
      return res.status(200).json({ expenses });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getCurrentUser: async (req, res) => {
    try {
      const userData = await expenseServices.getCurrentUser(req);
      
      const saveUserData = await expenseServices.saveCurrentUser(userData);
      
      
      return res.json({
        id: saveUserData.id,
        email: saveUserData.email,
        name:saveUserData.name
      });
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const usersData = await expenseServices.getAllUsers();
      return res.status(200).json({
        message: "Users fetched successfully",
        users: usersData.users,
        total: usersData.users?.length || 0,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

export default expenseController;
