import { View, Text } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

interface NavbarProps {
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = "Home" }) => {
  return (
    <View className="flex flex-row justify-between shadow-inherit items-center mb-4">
      <MaterialIcons name="dashboard" size={30} color="black" />
      <Text className="text-2xl font-bold">{title}</Text>
      <MaterialIcons name="notifications" size={30} color="black" />
    </View>
  );
};

export default Navbar;
