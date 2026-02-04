import { View, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import BaseURL from "@/lib/BaseURL";
import { useAuth } from "@/contexts/AuthContext";
import { useRefresh } from "@/contexts/RefreshContext";
interface BalanceCardProps {
  onExternalRefresh?: () => void;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ onExternalRefresh }) => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const { refreshTrigger, triggerRefresh } = useRefresh();

  const fetchBalanceData = async () => {
    if (!session) {
      console.error("No active session for balance fetch");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${BaseURL()}/api/expenses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
  ``

      if (!data.expenses || !Array.isArray(data.expenses)) {
        console.error("Invalid data format, expected {expenses: []}");
        setTotalBalance(0);
        setTotalIncome(0);
        setTotalExpense(0);
        setLoading(false);
        return;
      }

      // Calculate totals using reduce for better performance
      const { income, expense } = data.expenses.reduce(
        (acc: { income: number; expense: number }, expense: any) => {
          if (expense.accounts_type === 'income') {
            acc.income += expense.amount;
          } else if (expense.accounts_type === 'expense') {
            acc.expense += expense.amount;
          }
          return acc;
        },
        { income: 0, expense: 0 }
      );
   
      
      const balance = income - expense;

      setTotalIncome(income);
      setTotalExpense(expense);
      setTotalBalance(balance);
    } catch (error) {
      console.error("Error fetching balance data:", error);
      // Set defaults on error
      setTotalBalance(0);
      setTotalIncome(0);
      setTotalExpense(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) {
      setTotalBalance(0);
      setTotalIncome(0);
      setTotalExpense(0);
      setLoading(false);
      return;
    }
    fetchBalanceData();
  }, [session]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchBalanceData();
    }
  }, [refreshTrigger]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleRefresh = () => {
    fetchBalanceData();
    triggerRefresh();
  };

  return (
    <LinearGradient
      colors={["#594FAE", "#D072AC", "#FF9D8E"]}
      start={{ x: 0, y: 1.5 }}
      end={{ x: 1.5, y: 0 }}
      className="w-full px-5 py-6 rounded-3xl overflow-hidden"
    >
      {/* Total Balance */}
      <View className="flex flex-row justify-between items-center mb-6">
        <View>
          <View className="flex flex-row items-center">
            <Text className="text-white text-[16px] mb-2">Net Balance</Text>
            
          </View>

          <Text className="text-white text-2xl font-bold">
            {loading ? "..." : formatCurrency(totalBalance)}
          </Text>
        </View>
        <MaterialIcons name="more-horiz" size={26} color="white" />
      </View>
      {/* Income expense */}
      <View className="flex flex-row justify-between">
        {/* Income */}
        <View className="flex-1">
          <View className="flex flex-row items-center gap-2">
            <View className="rounded-full overflow-hidden">
              <BlurView intensity={50} tint="light" className="p-1.5">
                <MaterialIcons name="arrow-downward" size={24} color="white" />
              </BlurView>
            </View>

            <Text className="text-white font-bold text-lg">Income</Text>
          </View>

          <Text className="text-white text-2xl font-bold mt-2 ml-2">
            {loading ? "..." : formatCurrency(totalIncome)}
          </Text>
        </View>

        {/* Expense */}
        <View className="flex-1 items-end">
          <View className="flex flex-row items-center gap-2">
            <View className="rounded-full overflow-hidden">
              <BlurView intensity={50} tint="light" className="p-1.5">
                <MaterialIcons name="arrow-upward" size={24} color="white" />
              </BlurView>
            </View>

            <Text className="text-white font-bold text-lg">Expense</Text>
          </View>

          <Text className="text-white text-2xl font-bold mt-2 mr-2">
            {loading ? "..." : formatCurrency(totalExpense)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default BalanceCard;
