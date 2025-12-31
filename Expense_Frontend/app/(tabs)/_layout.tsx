import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs, Redirect } from "expo-router";
import AddButton from "../components/AddButton";
import { IconButton } from "react-native-paper";
import "@/global.css";
import { useEffect } from "react";
import { callBackend } from "@/lib/Token";

export default function TabsLayout() {


  useEffect(() => {
  callBackend()
    .then(() => console.log("Backend called"))
    .catch(console.error);
}, []);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#7B61FF",
        tabBarInactiveTintColor: "#BDBDBD",
        tabBarStyle: {
          position: "absolute",
          left: 20,
          right: 20,
          height: 60,
          borderRadius: 35,
          backgroundColor: "#FFFFFF",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <IconButton icon="home" size={size} iconColor={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="overview"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="analytics" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="addExprense"
        options={{
          tabBarButton: (props) => <AddButton {...props} />,
        }}
      />

      <Tabs.Screen
        name="split"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="call-split" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
