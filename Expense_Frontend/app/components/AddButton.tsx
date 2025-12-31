import { View, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function AddButton({ onPress, accessibilityState }: any) {
  const focused = accessibilityState?.selected;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="justify-center items-center"
      style={{ top: -25 }} // must stay in style (absolute offset)
    >
      <View
        className="
          w-16 h-16 
          rounded-full 
          bg-[#7B61FF] 
          justify-center items-center
        "
        style={{
          // extended shadow (NativeWind doesn't support this fully)
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 6,
        }}
      >
        <MaterialIcons name="add" size={32} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}
