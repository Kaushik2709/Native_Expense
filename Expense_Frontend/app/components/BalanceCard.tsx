import { View, Text } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur"


const BalanceCard = () => {
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
            <Text className="text-white text-[16px] mb-2">Total Balance</Text>
            <MaterialIcons
              name="arrow-drop-down"
              size={22}
              color="white"
              className="mb-2"
              style={{ marginTop: 2 }} // tiny nudge for perfect alignment
            />
          </View>

          <Text className="text-white text-2xl font-bold">$12,345.67</Text>
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
            $8,500.00
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
            $850.00
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default BalanceCard;
