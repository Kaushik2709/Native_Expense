import expenseServices from "../services/expense.services.js";
import { supabase } from "../config/supabase.js";
import redisClient from "../config/redis.js";
const expenseController = {
  addExpense: async (req, res) => {
    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
      if (!token) return res.status(401).json({ message: "Missing token" });

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      if (error || !user)
        return res.status(401).json({ message: "Invalid token" });

      const { description, amount, accounts_type, category } = req.body;

      if (!amount || !accounts_type) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const expense = await expenseServices.createExpense({
        description,
        amount,
        accounts_type,
        category,
        user_id: user.id, // ✅ comes from verified token
      });

      // Invalidate cache after adding new expense
      const cacheKey = `expenses:${user.id}`;
      await redisClient.del(cacheKey);

      return res
        .status(201)
        .json({ message: "Expense added successfully", expense });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  getExpenses: async (req, res) => {
    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
      if (!token) return res.status(401).json({ message: "Missing token" });

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      if (error || !user)
        return res.status(401).json({ message: "Invalid token" });

      const cacheKey = `expenses:${user.id}`;
      const cachedExpenses = await redisClient.get(cacheKey);

      if (cachedExpenses) {
        console.log("Serving from cache");
        return res.status(200).json({
          expenses: JSON.parse(cachedExpenses),
          source: 'cache'
        });
      }

      const expenses = await expenseServices.getExpenses(user.id);

      // Store in Redis for 1 hour
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(expenses));

      return res.status(200).json({ expenses, source: 'db' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  deleteExpense: async (req, res) => {
    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
      if (!token) return res.status(401).json({ message: "Missing token" });

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      if (error || !user)
        return res.status(401).json({ message: "Invalid token" });

      const { id } = req.params;
      const deletedExpense = await expenseServices.deleteExpense(id, user.id);

      // Invalidate cache after deleting expense
      const cacheKey = `expenses:${user.id}`;
      await redisClient.del(cacheKey);

      return res.status(200).json({ message: "Expense deleted successfully" });
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
        name: saveUserData.name,
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
