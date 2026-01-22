import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart, PieChart } from "react-native-gifted-charts";
import Navbar from "../components/Navbar";
import BaseURL from "@/lib/BaseURL";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

interface Expense {
  id: string;
  user_id: string;
  accounts_type: string;
  category: string;
  amount: number;
  description: string;
  transaction_date: string;
  created_at: string;
}

interface ChartDataItem {
  value: number;
  label?: string;
  frontColor: string;
  gradientColor: string;
  spacing: number;
}

const Overview = () => {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [chartData, setChartData] = useState<{
    day: ChartDataItem[];
    week: ChartDataItem[];
    month: ChartDataItem[];
  }>({
    day: [],
    week: [],
    month: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // New State for enhancements
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [pieData, setPieData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Expense[]>([]);

  const { session } = useAuth();

  const PIE_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const processExpenseData = (expenses: Expense[]) => {
    // Sort expenses by created_at date
    const sortedExpenses = [...expenses].sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
    );

    // Process Day View (group by weekday)
    const dayMap = new Map<string, { income: number; expense: number; date: Date }>();
    sortedExpenses.forEach((expense) => {
      const date = new Date(expense.created_at);
      const weekdayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
      const dateKey = date.toISOString().split('T')[0]; // Use date as key to differentiate same weekdays

      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, { income: 0, expense: 0, date: date });
      }

      const current = dayMap.get(dateKey)!;
      if (expense.accounts_type === "income") {
        current.income += expense.amount;
      } else {
        current.expense += expense.amount;
      }
    });

    const dayData: ChartDataItem[] = [];
    const dayEntries = Array.from(dayMap.entries());
    dayEntries.forEach(([key, values], index) => {
      const isLast = index === dayEntries.length - 1;
      const weekdayLabel = values.date.toLocaleDateString("en-US", { weekday: "short" });

      dayData.push(
        {
          value: values.income,
          label: weekdayLabel,
          frontColor: "#22c55e",
          gradientColor: "#86efac",
          spacing: 2,
        },
        {
          value: values.expense,
          frontColor: "#ef4444",
          gradientColor: "#fca5a5",
          spacing: isLast ? 0 : 24,
        }
      );
    });

    // Process Week View (group by week number)
    const weekMap = new Map<string, { income: number; expense: number; weekNum: number; year: number }>();
    sortedExpenses.forEach((expense) => {
      const date = new Date(expense.created_at);
      const weekNumber = getWeekNumber(date);
      const year = date.getFullYear();
      const weekKey = `${year}-W${weekNumber}`;

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { income: 0, expense: 0, weekNum: weekNumber, year: year });
      }

      const current = weekMap.get(weekKey)!;
      if (expense.accounts_type === "income") {
        current.income += expense.amount;
      } else {
        current.expense += expense.amount;
      }
    });

    const weekData: ChartDataItem[] = [];
    const weekEntries = Array.from(weekMap.entries());
    weekEntries.forEach(([key, values], index) => {
      const isLast = index === weekEntries.length - 1;

      weekData.push(
        {
          value: values.income,
          label: `W${values.weekNum}`,
          frontColor: "#22c55e",
          gradientColor: "#86efac",
          spacing: 2,
        },
        {
          value: values.expense,
          frontColor: "#ef4444",
          gradientColor: "#fca5a5",
          spacing: isLast ? 0 : 24,
        }
      );
    });

    // Process Month View (group by month)
    const monthMap = new Map<string, { income: number; expense: number; date: Date }>();
    sortedExpenses.forEach((expense) => {
      const date = new Date(expense.created_at);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { income: 0, expense: 0, date: date });
      }

      const current = monthMap.get(monthKey)!;
      if (expense.accounts_type === "income") {
        current.income += expense.amount;
      } else {
        current.expense += expense.amount;
      }
    });

    const monthData: ChartDataItem[] = [];
    const monthEntries = Array.from(monthMap.entries());
    monthEntries.forEach(([key, values], index) => {
      const isLast = index === monthEntries.length - 1;
      const monthLabel = values.date.toLocaleDateString("en-US", { month: "short" });

      monthData.push(
        {
          value: values.income,
          label: monthLabel,
          frontColor: "#22c55e",
          gradientColor: "#86efac",
          spacing: 2,
        },
        {
          value: values.expense,
          frontColor: "#ef4444",
          gradientColor: "#fca5a5",
          spacing: isLast ? 0 : 18,
        }
      );
    });

    return { day: dayData, week: weekData, month: monthData };
  };

  const calculateSummaryAndPie = (expenses: Expense[]) => {
    // Calculate Summary
    const income = expenses
      .filter(e => e.accounts_type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);

    const expense = expenses
      .filter(e => e.accounts_type !== 'income') // Assuming anything not income is expense
      .reduce((sum, e) => sum + e.amount, 0);

    setSummary({
      income,
      expense,
      balance: income - expense
    });

    // Calculate Recent Transactions
    const sorted = [...expenses].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setRecentTransactions(sorted.slice(0, 20));

    // Calculate Pie Data
    const categoryMap = new Map<string, number>();
    expenses
      .filter(e => e.accounts_type !== 'income')
      .forEach(e => {
        const current = categoryMap.get(e.category) || 0;
        categoryMap.set(e.category, current + e.amount);
      });

    const totalExpenseVal = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
    const pie = Array.from(categoryMap.entries()).map(([name, value], index) => ({
      value,
      color: PIE_COLORS[index % PIE_COLORS.length],
      text: `${Math.round((value / totalExpenseVal) * 100)}%`,
      label: name, // We will use this in legend
      // focused: true, 
    })).sort((a, b) => b.value - a.value); // Sort so biggest slices are consistent

    setPieData(pie);
  };

  // Helper function to get week number
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getExpenseData = async (isRefreshing = false) => {
    if (!session) {
      console.error("No active session for expense fetch");
      setLoading(false);
      return;
    }

    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`${BaseURL()}/api/expenses?t=${Date.now()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }

      const data = await response.json();
      console.log("Fetched expense data:", data);

      if (data.expenses && data.expenses.length > 0) {
        const processedData = processExpenseData(data.expenses);
        calculateSummaryAndPie(data.expenses);
        setChartData(processedData);
        setRefreshKey(prev => prev + 1);
      } else {
        // Reset chart data if no expenses
        setChartData({ day: [], week: [], month: [] });
        setSummary({ income: 0, expense: 0, balance: 0 });
        setPieData([]);
        setRecentTransactions([]);
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      // Optionally show error message to user
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    await getExpenseData(true);
  };

  useEffect(() => {
    if (session) {
      getExpenseData();
    } else {
      // Clear data when no session
      setChartData({ day: [], week: [], month: [] });
      setSummary({ income: 0, expense: 0, balance: 0 });
      setPieData([]);
      setRecentTransactions([]);
      setLoading(false);
    }
  }, [session]);

  const getCurrentData = () => {
    return chartData[viewMode].length > 0 ? chartData[viewMode] : [];
  };

  const getMaxValue = () => {
    const currentData = getCurrentData();
    if (currentData.length === 0) return 100;

    const maxValue = Math.max(...currentData.map((item) => item.value));
    return Math.ceil(maxValue * 1.2); // Add 20% padding
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 px-4 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading data...</Text>
      </SafeAreaView>
    );
  }

  // Get category icon helper (reuse or duplicate if necessary, implementing simple version here)
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      Shopping: "🛍️", Transport: "🚗", Bills: "📄", Dining: "🍽️",
      Food: "🍔", Entertainment: "🎬", Healthcare: "🏥", Education: "📚",
      Travel: "✈️", Groceries: "🛒", Utilities: "💡", Rent: "🏠",
    };
    return iconMap[category] || "💳";
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 mb-20"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3b82f6"]}
            tintColor="#3b82f6"
          />
        }
      >
        <View className="px-4">
          <Navbar title="Overview" />
        </View>

        <View className="px-4">
          {/* View Toggle Buttons */}


          {/* New Financial Summary Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-4 px-4">
            <View className="bg-blue-600 p-4 rounded-2xl w-40 mr-4 shadow-lg shadow-blue-200">
              <Text className="text-blue-100 text-sm font-medium mb-1">Net Balance</Text>
              <Text className="text-white text-xl font-bold">₹{summary.balance.toFixed(2)}</Text>
            </View>
            <View className="bg-white p-4 rounded-2xl w-40 mr-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className="text-gray-500 text-sm font-medium">Income</Text>
              </View>
              <Text className="text-gray-900 text-xl font-bold">₹{summary.income.toFixed(2)}</Text>
            </View>
            <View className="bg-white p-4 rounded-2xl w-40 mr-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                <Text className="text-gray-500 text-sm font-medium">Expense</Text>
              </View>
              <Text className="text-gray-900 text-xl font-bold">₹{summary.expense.toFixed(2)}</Text>
            </View>
          </ScrollView>

          <Text className="text-xl font-semibold mb-4 text-gray-800">Income vs Expense</Text>

          {/* View Toggle Buttons - Moved below title for better flow, or keep as is? 
              User requested additions. Keeping toggle near chart is good. 
          */}
          <View className="flex-row bg-white rounded-xl p-1 mb-4 shadow-sm">
            <TouchableOpacity
              onPress={() => setViewMode("day")}
              className={`flex-1 py-2 rounded-lg ${viewMode === "day" ? "bg-blue-500" : "bg-transparent"
                }`}
            >
              <Text
                className={`text-center font-semibold ${viewMode === "day" ? "text-white" : "text-gray-600"
                  }`}
              >
                Day
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setViewMode("week")}
              className={`flex-1 py-2 rounded-lg ${viewMode === "week" ? "bg-blue-500" : "bg-transparent"
                }`}
            >
              <Text
                className={`text-center font-semibold ${viewMode === "week" ? "text-white" : "text-gray-600"
                  }`}
              >
                Week
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setViewMode("month")}
              className={`flex-1 py-2 rounded-lg ${viewMode === "month" ? "bg-blue-500" : "bg-transparent"
                }`}
            >
              <Text
                className={`text-center font-semibold ${viewMode === "month" ? "text-white" : "text-gray-600"
                  }`}
              >
                Month
              </Text>
            </TouchableOpacity>
          </View>

          {/* Legend */}
          <View className="flex-row justify-center gap-6 mb-4">
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded bg-green-500 mr-2" />
              <Text className="text-sm text-gray-600">Income</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded bg-red-500 mr-2" />
              <Text className="text-sm text-gray-600">Expense</Text>
            </View>
          </View>

          {getCurrentData().length > 0 ? (
            <View className="bg-white rounded-2xl p-4 shadow mb-4">
              <BarChart
                key={`${viewMode}-${refreshKey}`}
                data={getCurrentData()}
                barWidth={22}
                roundedTop
                isAnimated
                animationDuration={1000}
                yAxisThickness={0}
                xAxisThickness={0}
                hideRules
                noOfSections={6}
                maxValue={getMaxValue()}
                yAxisTextStyle={{ color: "#6b7280", fontSize: 12 }}
                xAxisLabelTextStyle={{ color: "#6b7280", fontSize: 12 }}
              />
            </View>
          ) : (
            <View className="bg-white rounded-2xl p-8 shadow items-center mb-4">
              <Text className="text-gray-500 text-center">
                No expense data available
              </Text>
            </View>
          )}

          {/* Spending Distribution Pie Chart */}
          {pieData.length > 0 && (
            <View className="mb-6">
              <Text className="text-xl font-semibold mb-4 text-gray-800">Spending by Category</Text>
              <View className="bg-white rounded-2xl p-6 shadow items-center">
                <PieChart
                  data={pieData}
                  donut
                  showText
                  textColor="white"
                  radius={120}
                  innerRadius={60}
                  textSize={12}
                  focusOnPress
                  strokeWidth={2}
                  strokeColor="white"
                />
                <View className="flex-row flex-wrap justify-center gap-4 mt-6">
                  {pieData.map((item, index) => (
                    <View key={index} className="flex-row items-center">
                      <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                      <Text className="text-gray-600 text-xs">{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Recent Activity Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-gray-800">Recent Activity</Text>
              {/* Optional: Add 'See All' button here if Navigation allows */}
            </View>

            <View className="bg-white rounded-2xl shadow overflow-hidden">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((item, index) => (
                  <View
                    key={item.id}
                    className={`flex-row items-center p-4 ${index !== recentTransactions.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <View className="w-10 h-10 rounded-full bg-gray-50 justify-center items-center mr-3">
                      <Text className="text-lg">{getCategoryIcon(item.category)}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-medium" numberOfLines={1}>{item.description}</Text>
                      <Text className="text-gray-500 text-xs">{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                    <Text className={`font-semibold ${item.accounts_type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {item.accounts_type === 'income' ? '+' : '-'}₹{item.amount.toFixed(2)}
                    </Text>
                  </View>
                ))
              ) : (
                <View className="p-6 items-center">
                  <Text className="text-gray-400">No recent transactions</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView >
  );
};

export default Overview;