import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  TextInput,
  Dimensions,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import BaseURL from '@/lib/BaseURL';

const { width, height } = Dimensions.get('window');

const AddExpense = () => {
  const { session } = useAuth();
  const [amount, setAmount] = useState('0');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const buttonScales = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Initialize button scales
  const getButtonScale = (key: string) => {
    if (!buttonScales[key]) {
      buttonScales[key] = new Animated.Value(1);
    }
    return buttonScales[key];
  };

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 60,
        friction: 9,
        useNativeDriver: true,
      }).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    
  }, [modalVisible]);

  const handleNumberPress = (num: string) => {
    // Haptic feedback
    Haptics.selectionAsync();

    // Animation
    const scale = getButtonScale(num);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    if (num === 'clear') {
      setAmount('0');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (num === 'backspace') {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (num === '.') {
      if (!amount.includes('.')) {
        setAmount((prev) => prev + num);
      }
    } else {
      setAmount((prev) => (prev === '0' ? num : prev + num));
    }
  };

  const handleSave = async () => {
    if (amount === '0' || !note.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Missing Information', 'Please enter an amount and a note.');
      return;
    }

    setLoading(true);
    try {
      if (!session) {
        throw new Error("No user ");
      }

      console.log('Saving:', { amount, note, type, category });
      // Using the IP from Token.ts for consistency across the app
      
      
      
      const response = await fetch(`${BaseURL()}/api/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          description: note,
          amount: parseFloat(amount),
          accounts_type: type,
          category: category,// Sending category although backend controller might need update
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save expense");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Transaction saved successfully");

      // Reset form
      setAmount('0');
      setNote('');
      setCategory('');
      setModalVisible(false);

    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", error.message);
      console.error("Save expense error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleType = (newType: 'income' | 'expense') => {
    if (type !== newType) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setType(newType);
    }
  };

  const renderNumberButton = (num: string, icon?: any) => (
    <TouchableOpacity
      key={num}
      className="flex-1"
      onPress={() => handleNumberPress(num)}
      activeOpacity={0.8}
    >
      <Animated.View
        className="flex-1 bg-[#FAFAFA] rounded-[18px] justify-center items-center shadow-sm"
        style={[
          {
            transform: [{ scale: getButtonScale(num) }],
            elevation: 2,
          }
        ]}
      >
        {icon ? (
          <MaterialIcons name={icon} size={28} color="#1A1D29" />
        ) : (
          <Text className="text-[28px] font-semibold text-[#1A1D29]">{num}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );

  const modalTransform = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  const modalBackdropOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#F8F9FF', '#F0F4FC']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          contentContainerClassName="px-5 pt-2.5 pb-24"
          showsVerticalScrollIndicator={false}
        >
          <Navbar title="Add Transaction" />

          {/* Type Toggle - Glassmorphism style */}
          <View className="items-center mb-6">
            <View className="flex-row bg-white rounded-[30px] w-full border border-black/5 shadow-sm">
              <TouchableOpacity
                className="flex-1 h-12 rounded-[26px] overflow-hidden justify-center items-center"
                onPress={() => toggleType('expense')}
                activeOpacity={0.9}
              >
                {type === 'expense' && (
                  <LinearGradient
                    colors={['#FF6B6B', '#EE5A6F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <View className="flex-row items-center gap-2 z-10">
                  <MaterialIcons
                    name="trending-down"
                    size={22}
                    color={type === 'expense' ? '#FFF' : '#8B95A0'}
                  />
                  <Text className={`text-base font-bold tracking-wider ${type === 'expense' ? 'text-white' : 'text-[#8B95A0]'
                    }`}>
                    Expense
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 h-12 rounded-[26px] overflow-hidden justify-center items-center"
                onPress={() => toggleType('income')}
                activeOpacity={0.9}
              >
                {type === 'income' && (
                  <LinearGradient
                    colors={['#4ADE80', '#22C55E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <View className="flex-row items-center gap-2 z-10">
                  <MaterialIcons
                    name="trending-up"
                    size={22}
                    color={type === 'income' ? '#FFF' : '#8B95A0'}
                  />
                  <Text className={`text-base font-bold tracking-wider ${type === 'income' ? 'text-white' : 'text-[#8B95A0]'
                    }`}>
                    Income
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount Display - Premium Card */}
          <TouchableOpacity
            className="mb-8 rounded-[32px] shadow-xl shadow-red-500/30 elevation-10"
            onPress={() => setModalVisible(true)}
            activeOpacity={0.95}
          >
            <LinearGradient
              colors={type === 'expense'
                ? ['#FF6B6B', '#EE5A6F']
                : ['#4ADE80', '#22C55E']}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.9, y: 0.9 }}
              className="py-2 px-6 rounded-[32px] overflow-hidden relative"
            >
              <View className="z-10 items-center">
                <Text className="text-white/80 text-sm font-semibold mb-2 tracking-widest uppercase">
                  Amount
                </Text>
                <View className="flex-row items-center justify-center mb-3">
                  <Text className="text-[32px] font-semibold text-white mr-1.5 opacity-90">₹</Text>
                  <Text
                    className="text-[56px] font-extrabold text-white tracking-tighter"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {amount}
                  </Text>
                </View>
                <View className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-full gap-1.5">
                  <MaterialIcons name="edit" size={14} color="#FFF" />
                  <Text className="text-white text-xs font-semibold">Tap to edit</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Form Fields */}
          <View className="gap-6">
            {/* Category Input */}
            <View className="gap-2.5">
              <Text className="text-xs font-bold text-[#8B95A0] tracking-wider ml-1">
                CATEGORY
              </Text>
              <View className="flex-row items-center bg-white rounded-[20px] p-3 border-[1.5px] border-[#F0F2F5] shadow-sm">
                <View className={`w-11 h-11 rounded-[14px] justify-center items-center mr-3 ${type === 'expense' ? 'bg-[#FFF0F0]' : 'bg-[#F0FDF4]'
                  }`}>
                  <MaterialIcons
                    name="category"
                    size={22}
                    color={type === 'expense' ? '#FF6B6B' : '#22C55E'}
                  />
                </View>
                <TextInput
                  className="flex-1 text-[17px] font-semibold text-[#1A1D29] h-full"
                  placeholder={type === 'income' ? 'e.g., Salary, Freelance' : 'e.g., Food, Transport'}
                  value={category}
                  onChangeText={setCategory}
                  placeholderTextColor="#A0AEC0"
                />
              </View>
            </View>

            {/* Note Input */}
            <View className="gap-2">
              <Text className="text-xs font-bold text-[#8B95A0] tracking-wider ml-1">
                NOTE
              </Text>
              <View className="flex-row items-start bg-white rounded-[20px] p-2 border-[1.5px] border-[#F0F2F5] shadow-sm">
                <View className="w-11 h-10 rounded-[14px] justify-center items-center mr-3 bg-[#F3F0FF] mt-0.5">
                  <MaterialIcons name="description" size={22} color="#7B61FF" />
                </View>
                <TextInput
                  className="flex-1 text-[17px] font-semibold text-[#1A1D29] min-h-[80px] pt-2.5"
                  placeholder="What is this for?"
                  value={note}
                  onChangeText={(text) => setNote(text.replace(/\n/g, ''))}
                  multiline
                  textAlignVertical="top"
                  placeholderTextColor="#A0AEC0"
                />
              </View>
            </View>
          </View>

          {/* Quick Suggestions */}
          <View className="mt-8 mb-3">
            <Text className="text-xs font-bold text-[#8B95A0] tracking-wider mb-2 ml-1">
              QUICK SUGGESTIONS
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="pr-5 gap-2.5"
            >
              {(type === 'income'
                ? ['Salary', 'Freelance', 'Investments', 'Gifts', 'Rental', 'Refunds']
                : ['Groceries', 'Transport', 'Dining', 'Shopping', 'Bills', 'Entertainment']
              ).map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-white px-5 py-3 rounded-3xl border border-[#E8ECEF] shadow-sm"
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCategory(suggestion);
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-[#555] text-sm font-semibold">{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className="mt-2.5 rounded-full overflow-hidden shadow-xl shadow-purple-500/30 elevation-8"
            onPress={handleSave}
            activeOpacity={0.9}
            disabled={loading}
           
          >
            <LinearGradient
              colors={['#7B61FF', '#6247EA']}
              className="flex-row items-center justify-center py-5 rounded-full gap-3"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-lg font-bold tracking-wide">Save Transaction</Text>
                  <MaterialIcons name="arrow-forward" size={24} color="#FFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View className="h-24" />
        </ScrollView>

        {/* Number Pad Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="none"
          onRequestClose={() => setModalVisible(false)}
        >
          <Animated.View style={[styles.customOverlay, { opacity: modalBackdropOpacity }]}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
              <TouchableOpacity
                className="flex-1"
                activeOpacity={1}
                onPress={() => setModalVisible(false)}
              />
            </BlurView>
          </Animated.View>

          <Animated.View
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[36px] px-6 pb-10 pt-3 shadow-2xl elevation-20"
            style={[
              {
                transform: [{ translateY: modalTransform }],
                height: height * 0.65
              },
            ]}
          >
            <View className="w-10 h-1 bg-[#E2E8F0] rounded-full self-center mb-5" />

            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-[22px] font-extrabold text-[#1A1D29]">Enter Amount</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="p-1 bg-[#F7F9FC] rounded-full"
              >
                <MaterialIcons name="close" size={24} color="#1A1D29" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center items-center mb-8 py-2.5">
              <Text className="text-[32px] font-semibold text-[#1A1D29] mr-1.5 opacity-50">₹</Text>
              <Text className="text-[54px] font-extrabold text-[#1A1D29]">{amount}</Text>
            </View>

            <View className="flex-1 gap-4 px-4">
              <View className="flex-1 flex-row gap-4">
                {['1', '2', '3'].map((n) => renderNumberButton(n))}
              </View>
              <View className="flex-1 flex-row gap-4">
                {['4', '5', '6'].map((n) => renderNumberButton(n))}
              </View>
              <View className="flex-1 flex-row gap-4">
                {['7', '8', '9'].map((n) => renderNumberButton(n))}
              </View>
              <View className="flex-1 flex-row gap-4">
                {renderNumberButton('.')}
                {renderNumberButton('0')}
                {renderNumberButton('backspace', 'backspace')}
              </View>
            </View>

            <View className="flex-row items-center mt-5 gap-5">
              <TouchableOpacity
                className="px-5 py-4"
                onPress={() => handleNumberPress('clear')}
              >
                <Text className="text-[#FF6B6B] text-base font-bold">Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 rounded-[24px] overflow-hidden shadow-lg shadow-black/20 elevation-5"
                onPress={() => setModalVisible(false)}
              >
                <LinearGradient
                  colors={['#1A1D29', '#2C3E50']}
                  className="py-[18px] items-center"
                >
                  <Text className="text-white text-lg font-bold tracking-wide">Done</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

// Kept only styles that need absolute positioning or specific non-tailwind support
const styles = StyleSheet.create({
  customOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  }
});

export default AddExpense;