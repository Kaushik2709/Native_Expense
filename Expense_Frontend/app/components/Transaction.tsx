import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import BaseURL from "@/lib/BaseURL";
import { useRefresh } from "@/contexts/RefreshContext";

interface TransactionType {
  id: string;
  account_id: string;
  account_name: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
  icon: string;
}

interface TransactionProps {
  onExternalRefresh?: () => void;
}

const Transaction: React.FC<TransactionProps> = ({ onExternalRefresh }) => {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { session } = useAuth();
  const { refreshTrigger, triggerRefresh } = useRefresh();
  const [item, setItems] = useState<any>([]);

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTime = (dateString: any) => {
    const date = new Date(dateString.replace(" ", "T"));
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getExpense = useCallback(async () => {
    try {
      if (!session) {
        console.error("❌ No active session");
        return;
      }
      const response = await fetch(`${BaseURL()}/api/expenses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();

      // Map the fetched data to the expected format
      const mappedTransactions = data.expenses.map((expense: any) => {
        const createdDate = new Date(expense.created_at);
        const localDate = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, "0")}-${String(createdDate.getDate()).padStart(2, "0")}`;
        return {
          id: expense.id,
          account_id: expense.user_id,
          account_name: "Default Account",
          type: expense.accounts_type,
          category: expense.category,
          amount: expense.amount,
          description: expense.description,
          date: localDate,
          created_at: expense.created_at,
          icon: getCategoryIcon(expense.category),
        };
      });

      // Sort by created_at in descending order (latest first)
      const sortedTransactions = mappedTransactions.sort(
        (a: TransactionType, b: TransactionType) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        },
      );

      setTransactions(sortedTransactions);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  }, [session]);

  // Helper function to get category icons
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      Shopping: "🛍️",
      Transport: "🚗",
      Bills: "📄",
      Dining: "🍽️",
      Food: "🍔",
      Entertainment: "🎬",
      Healthcare: "🏥",
      Education: "📚",
      Travel: "✈️",
      Groceries: "🛒",
      Utilities: "💡",
      Rent: "🏠",
    };
    return iconMap[category] || "💳";
  };

  useEffect(() => {
    if (!session) {
      setTransactions([]);
      setItems([]);
    }
  }, [session]);

  useEffect(() => {
    getExpense();
  }, [getExpense]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      getExpense();
    }
  }, [refreshTrigger]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getExpense();
    triggerRefresh();
    setRefreshing(false);
  }, [getExpense, triggerRefresh]);

  const groupTransactionsByDate = () => {
    const grouped: { [key: string]: TransactionType[] } = {};

    transactions.forEach((transaction) => {
      const dateKey = formatDate(transaction.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });
    return grouped;
  };

  const groupedTransactions = groupTransactionsByDate();

  const DeleteData = async (id: string) => {
    const deleteResponse = await fetch(`${BaseURL()}/api/expenses/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
    });
    const deleteData = await deleteResponse.json();
    getExpense();
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50 mb-20"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#3b82f6"]} // Android
          tintColor="#3b82f6" // iOS
        />
      }
    >
      <View className="p-5 bg-white border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-900 mb-1">
          Transactions
        </Text>
        <Text className="text-sm text-gray-600">
          {transactions.length} transactions
        </Text>
      </View>

      {Object.entries(groupedTransactions).map(([date, transactions]) => (
        <View key={date} className="mt-4 mb-3">
          <Text className="text-sm font-semibold text-gray-600 px-5 py-2 bg-gray-50">
            {date}
          </Text>

          {transactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              className="flex-row items-center bg-white p-4 border-b border-gray-100"
              activeOpacity={0.7}
              onLongPress={() => {
                Alert.alert(
                  "Delete Transaction",
                  "Are you sure you want to delete this transaction?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => DeleteData(transaction.id),
                    },
                  ],
                );
              }}
            >
              <View className="w-12 h-12 rounded-full bg-gray-100 justify-center items-center mr-3">
                <Text className="text-2xl">{transaction.icon}</Text>
              </View>

              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  {transaction.category}
                </Text>
                <Text className="text-sm text-gray-600 mb-0.5">
                  {transaction.description}
                </Text>
                <Text className="text-xs text-gray-400">
                  {transaction.account_name} •{" "}
                  {formatTime(transaction.created_at)}
                </Text>
              </View>

              <View className="items-end">
                <Text
                  className={`text-base font-bold ${
                    transaction.type === "income"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}₹
                  {transaction.amount.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {transactions.length === 0 && (
        <View className="flex-1 justify-center items-center p-8 mt-20">
          <Text className="text-6xl mb-4">📊</Text>
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            No Transactions Yet
          </Text>
          <Text className="text-sm text-gray-600 text-center">
            Your transactions will appear here once you add them
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default Transaction;
