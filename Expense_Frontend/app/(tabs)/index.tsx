import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BalanceCard from "../components/BalanceCard";
import Navbar from "../components/Navbar";
import { usePathname } from "expo-router";
import Transaction from "../components/Transaction";
import { RefreshProvider } from "@/contexts/RefreshContext";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-4">
        {/* Top bar */}
        <Navbar title="Dashboard" />

        <RefreshProvider>
          <BalanceCard />
          <Transaction />
        </RefreshProvider>
      </View>
    </SafeAreaView>
  );
}
