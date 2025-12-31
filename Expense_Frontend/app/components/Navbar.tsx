import { View, Text } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { usePathname } from "expo-router";

const Navbar = () => {
  const pathname = usePathname();
  
  const pageName =
    pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/%20/g, " ")
      ?.replace(/\b\w/g, (c) => c.toUpperCase()) || "Home";

  return (
    <View className="flex flex-row justify-between shadow-inherit items-center mb-4">
      <MaterialIcons name="dashboard" size={30} color="black" />
      <Text className="text-2xl font-bold">{pageName}</Text>
      <MaterialIcons name="notifications" size={30} color="black" />
    </View>
  );
};

export default Navbar;
