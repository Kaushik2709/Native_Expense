import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart } from "react-native-gifted-charts";

const Navbar = () => (
  <View className="mb-6">
    <Text className="text-2xl font-bold">Finance Tracker</Text>
  </View>
);

const Overview = () => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  // Day view data (7 days)
  const dayData = [
    // Monday
    { value: 850, label: "Mon", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 620, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 24 },
    // Tuesday
    { value: 920, label: "Tue", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 780, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 24 },
    // Wednesday
    { value: 650, label: "Wed", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 890, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 24 },
    // Thursday
    { value: 1100, label: "Thu", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 720, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 24 },
    // Friday
    { value: 980, label: "Fri", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 850, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 24 },
    // Saturday
    { value: 750, label: "Sat", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 940, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 24 },
    // Sunday
    { value: 680, label: "Sun", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 520, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 0 },
  ];

  // Week view data (4 weeks)
  const weekData = [
    // Week 1
    { value: 5500, label: "W1", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 4800, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 24 },
    // Week 2
    { value: 6200, label: "W2", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 5300, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 24 },
    // Week 3
    { value: 5800, label: "W3", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 6100, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 24 },
    // Week 4
    { value: 6500, label: "W4", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 5600, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 0 },
  ];

  // Month view data (12 months)
  const monthData = [
    // Jan
    { value: 25000, label: "Jan", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 21000, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 18 },
    // Feb
    { value: 28000, label: "Feb", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 23500, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 18 },
    // Mar
    { value: 32000, label: "Mar", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 26000, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 18 },
    // Apr
    { value: 29000, label: "Apr", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 24500, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 18 },
    // May
    { value: 31000, label: "May", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 27000, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 18 },
    // Jun
    { value: 27000, label: "Jun", frontColor: "#22c55e", gradientColor: "#86efac", spacing: 2 },
    { value: 25500, frontColor: "#ef4444", gradientColor: "#fca5a5", spacing: 0 },
  ];

  const getCurrentData = () => {
    switch (viewMode) {
      case 'day':
        return dayData;
      case 'week':
        return weekData;
      case 'month':
        return monthData;
      default:
        return dayData;
    }
  };

  const getMaxValue = () => {
    switch (viewMode) {
      case 'day':
        return 1200;
      case 'week':
        return 7000;
      case 'month':
        return 35000;
      default:
        return 1200;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4">
      <Navbar title="Overview" />
      
      {/* View Toggle Buttons */}
      <View className="flex-row bg-white rounded-xl p-1 mb-4 shadow-sm">
        <TouchableOpacity
          onPress={() => setViewMode('day')}
          className={`flex-1 py-2 rounded-lg ${
            viewMode === 'day' ? 'bg-blue-500' : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              viewMode === 'day' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Day
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setViewMode('week')}
          className={`flex-1 py-2 rounded-lg ${
            viewMode === 'week' ? 'bg-blue-500' : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              viewMode === 'week' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Week
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setViewMode('month')}
          className={`flex-1 py-2 rounded-lg ${
            viewMode === 'month' ? 'bg-blue-500' : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              viewMode === 'month' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Month
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-xl font-semibold mb-4">Income vs Expense</Text>
      
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

      <View className="bg-white rounded-2xl p-4 shadow">
        <BarChart
          key={viewMode} // Force re-render on view change
          data={getCurrentData()}
          barWidth={22}
          roundedTop
          isAnimated
          animationDuration={1000}
          yAxisThickness={0}
          xAxisThickness={0}
          hideRules
          noOfSections={5}
          maxValue={getMaxValue()}
          yAxisTextStyle={{ color: "#6b7280", fontSize: 12 }}
          xAxisLabelTextStyle={{ color: "#6b7280", fontSize: 12 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Overview;