import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Image, ActivityIndicator, Alert, ScrollView, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';

// Interfaces
interface User {
  id: string; // auth_id or id from backend
  email: string;
  // Assuming the backend returns some user info. 
  // If only email/id, we'll work with that.
}

interface SplitExpense {
  id: string;
  title: string;
  amount: number;
  date: string;
  paidBy: string; // 'You' or User Name
  splitWith: string[]; // List of names
  status: 'owed' | 'owing' | 'settled';
}

const Split = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [newPerson, setNewPerson] = useState('');

  const [selectedSplit, setSelectedSplit] = useState<SplitExpense | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Mock Data for Splits (since no backend endpoint for splits yet)
  const [recentSplits, setRecentSplits] = useState<SplitExpense[]>([]);

  const totalOwed = recentSplits.filter((s: SplitExpense) => s.status === 'owed').reduce((sum: number, s: SplitExpense) => sum + s.amount, 0);
  const totalOwing = recentSplits.filter((s: SplitExpense) => s.status === 'owing').reduce((sum: number, s: SplitExpense) => sum + s.amount, 0);

  // Load splits from storage
  useEffect(() => {
    loadSplits();
  }, []);

  const loadSplits = async () => {
    try {
      const storedSplits = await AsyncStorage.getItem('recentSplits');
      if (storedSplits) {
        setRecentSplits(JSON.parse(storedSplits));
      } else {
        // No dummy data, start empty
        setRecentSplits([]);
      }
    } catch (error) {
      console.error('Failed to load splits', error);
    }
  };

  const saveSplits = async (splits: SplitExpense[]) => {
    try {
      await AsyncStorage.setItem('recentSplits', JSON.stringify(splits));
    } catch (error) {
      console.error('Failed to save splits', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      if (!session) {
        // No session/backend fails in dev, defaulting to empty or local users
        setUsers([]);
        return;
      }

      const accessToken = session.access_token;
      // Using the same IP as in Token.ts
      const baseURL = Platform.OS === 'web' ? 'http://localhost:5000' : 'http://10.158.248.202:5000';

      const response = await fetch(`${baseURL}/api/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Backend returns generic users, mapping them here
        // If data is array of users
        setUsers(Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []));
      } else {
        console.log("Failed to fetch users");
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUsers().then(() => setRefreshing(false));
    loadSplits();
  }, []);

  const handleCreateSplit = () => {
    if (!amount || !description || selectedUsers.length === 0) {
      Alert.alert('Missing Fields', 'Please fill in all fields and select at least one friend.');
      return;
    }

    const newSplit: SplitExpense = {
      id: Date.now().toString(),
      title: description,
      amount: parseFloat(amount),
      date: new Date().toLocaleDateString('en-US', { hour: 'numeric', minute: 'numeric' }), // Better date formatting
      paidBy: 'You',
      splitWith: selectedUsers.map(id => users.find(u => u.id === id)?.email.split('@')[0] || 'Friend'),
      status: 'owed'
    };

    const updatedSplits = [newSplit, ...recentSplits];
    setRecentSplits(updatedSplits);
    saveSplits(updatedSplits);

    setModalVisible(false);
    setAmount('');
    setDescription('');
    setSelectedUsers([]);
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSplitPress = (split: SplitExpense) => {
    setSelectedSplit(split);
    setDetailsModalVisible(true);
  };

  const handleAddPerson = () => {
    if (!newPerson.trim()) return;

    // Check if already exists (simple name check)
    if (users.some(u => u.email.split('@')[0].toLowerCase() === newPerson.trim().toLowerCase())) {
      Alert.alert('User already exists');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: newPerson.trim() // Using email field for name
    };

    setUsers([...users, newUser]);
    setNewPerson('');
    // Auto Select
    setSelectedUsers(prev => [...prev, newUser.id]);
  };

  const handleDeleteSplit = (splitId: string) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedSplits = recentSplits.filter((s: SplitExpense) => s.id !== splitId);
            setRecentSplits(updatedSplits);
            saveSplits(updatedSplits);
          }
        }
      ]
    );
  };

  const renderSplitItem = ({ item }: { item: SplitExpense }) => (
    <TouchableOpacity
      onPress={() => handleSplitPress(item)}
      onLongPress={() => handleDeleteSplit(item.id)}
      delayLongPress={500}
      activeOpacity={0.7}
      className="bg-white p-5 rounded-2xl mb-4 shadow-sm border border-gray-100/50 flex-row items-center"
    >
      <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${item.status === 'owed' ? 'bg-emerald-50' : 'bg-red-50'}`}>
        <MaterialIcons
          name={item.title.toLowerCase().includes('food') || item.title.toLowerCase().includes('lunch') ? "restaurant" : "receipt"}
          size={26}
          color={item.status === 'owed' ? '#10b981' : '#ef4444'}
        />
      </View>
      <View className="flex-1 space-y-1">
        <Text className="font-bold text-gray-900 text-lg tracking-tight">{item.title}</Text>
        <Text className="text-gray-400 text-xs font-medium">{item.date}</Text>
        <Text className="text-gray-500 text-xs mt-1">
          {item.status === 'owed' ? `Split with ${item.splitWith.join(', ')}` : `Paid by ${item.paidBy}`}
        </Text>
      </View>
      <View className="items-end">
        <Text className={`font-bold text-xl ${item.status === 'owed' ? 'text-emerald-600' : 'text-red-500'}`}>
          {item.status === 'owed' ? '+' : '-'}${item.amount.toFixed(2)}
        </Text>
        <View className={`px-2 py-1 rounded-md mt-1 ${item.status === 'owed' ? 'bg-emerald-100' : 'bg-red-100'}`}>
          <Text className={`text-[10px] font-bold uppercase tracking-wider ${item.status === 'owed' ? 'text-emerald-700' : 'text-red-700'}`}>
            {item.status === 'owed' ? 'Lent' : 'Borrowed'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getSplitBreakdown = (split: SplitExpense) => {
    const totalPeople = split.splitWith.length + 1;
    const perPerson = split.amount / totalPeople;

    return [
      { name: split.paidBy, amount: perPerson, isPayer: true },
      ...split.splitWith.map(name => ({ name, amount: perPerson, isPayer: false }))
    ];
  };

  return (
    <SafeAreaView className='flex-1 bg-[#F8F9FA]'>
      <View className='px-5 flex-1'>
        <Navbar title="Split Bills" />

        <View className="flex-1">
          {/* Summary Cards */}
          <View className="flex-row justify-between mb-8 mt-4 gap-4">
            <LinearGradient
              colors={['#10b981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-5 rounded-3xl flex-1 shadow-lg shadow-emerald-200"
              style={{ borderRadius: 24 }}
            >
              <View className="bg-white/20 w-10 h-10 rounded-full items-center justify-center mb-3">
                <MaterialIcons name="arrow-upward" size={20} color="white" />
              </View>
              <Text className="text-emerald-50 text-sm font-medium mb-1 tracking-wide">Owed to you</Text>
              <Text className="text-white text-3xl font-bold">${totalOwed.toFixed(2)}</Text>
            </LinearGradient>

            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-5 rounded-3xl flex-1 shadow-lg shadow-red-200"
              style={{ borderRadius: 24 }}
            >
              <View className="bg-white/20 w-10 h-10 rounded-full items-center justify-center mb-3">
                <MaterialIcons name="arrow-downward" size={20} color="white" />
              </View>
              <Text className="text-red-50 text-sm font-medium mb-1 tracking-wide">You Owe</Text>
              <Text className="text-white text-3xl font-bold">${totalOwing.toFixed(2)}</Text>
            </LinearGradient>
          </View>

          {/* Action Button - Moved below cards but above list for better hierarchy */}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
            className="mb-8 shadow-indigo-200 shadow-xl"
          >
            <LinearGradient
              colors={['#8b5cf6', '#6d28d9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex-row items-center justify-center p-4 rounded-2xl"
              style={{ borderRadius: 16 }}
            >
              <MaterialIcons name="add" size={28} color="white" />
              <Text className="text-white font-bold text-lg ml-2">New Expense Split</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Recent Splits */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingBottom: 150 }}
            className="flex-1"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Recent Activity</Text>
              <TouchableOpacity>
                <Text className="text-purple-600 font-semibold">See All</Text>
              </TouchableOpacity>
            </View>

            {recentSplits.length > 0 ? (
              <FlatList
                data={recentSplits}
                renderItem={renderSplitItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View className="items-center justify-center py-20">
                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <MaterialIcons name="receipt-long" size={40} color="#9ca3af" />
                </View>
                <Text className="text-gray-500 text-lg font-medium">No splits yet</Text>
                <Text className="text-gray-400 text-sm text-center px-10 mt-2">
                  Add an expense to start tracking bills with your friends.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Add Split Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-white rounded-t-[32px] h-[85%] shadow-2xl">
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mt-3 mb-2" />

              <View className="p-6 flex-1">
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-2xl font-bold text-gray-900">New Split</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className='p-2 bg-gray-50 rounded-full border border-gray-100'
                  >
                    <MaterialIcons name="close" size={24} color="#374151" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">

                  {/* Amount Input */}
                  <View className="mb-8 items-center">
                    <Text className="text-gray-500 font-medium mb-4 uppercase text-xs tracking-wider">How much was it?</Text>
                    <View className="flex-row items-end">
                      <Text className="text-4xl font-bold text-gray-400 mb-2">$</Text>
                      <TextInput
                        placeholder="0.00"
                        placeholderTextColor="#d1d5db"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                        className="text-6xl font-bold text-gray-900 ml-1 py-0"
                        style={{ lineHeight: 70 }}
                      />
                    </View>
                    {amount && selectedUsers.length > 0 && (
                      <View className="bg-purple-50 px-4 py-2 rounded-full mt-4 flex-row items-center border border-purple-100">
                        <Text className="text-purple-700 font-semibold mr-1">
                          ${(parseFloat(amount) / (selectedUsers.length + 1)).toFixed(2)}
                        </Text>
                        <Text className="text-purple-400 text-xs">per person</Text>
                      </View>
                    )}
                  </View>

                  {/* Description Input */}
                  <View className="mb-8">
                    <Text className="text-gray-500 font-medium mb-3 uppercase text-xs tracking-wider">What for?</Text>
                    <View className="bg-gray-50 p-1 rounded-2xl border border-gray-200 focus:border-purple-500">
                      <TextInput
                        placeholder="e.g. Dinner at Mario's"
                        placeholderTextColor="#9ca3af"
                        value={description}
                        onChangeText={setDescription}
                        className="text-lg text-gray-900 p-4"
                      />
                    </View>
                  </View>

                  {/* People Selection */}
                  <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-gray-500 font-medium uppercase text-xs tracking-wider">With whom?</Text>
                      <TouchableOpacity onPress={() => {/* Maybe toggle a search view */ }}>
                        <Text className="text-purple-600 text-xs font-bold">Search</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Add Person Input */}
                    <View className="flex-row items-center mb-4 gap-3">
                      <TextInput
                        placeholder="Add friend's name"
                        value={newPerson}
                        onChangeText={setNewPerson}
                        className="flex-1 bg-white border border-gray-200 p-4 rounded-2xl text-gray-900 shadow-sm"
                      />
                      <TouchableOpacity
                        onPress={handleAddPerson}
                        className="bg-purple-600 w-14 h-14 items-center justify-center rounded-2xl shadow-lg shadow-purple-200"
                      >
                        <MaterialIcons name="person-add" size={24} color="white" />
                      </TouchableOpacity>
                    </View>

                    {loading ? (
                      <ActivityIndicator color="#7c3aed" className="my-4" />
                    ) : (
                      <View className="flex-row flex-wrap gap-2">
                        <TouchableOpacity
                          onPress={() => { }}
                          className="px-5 py-3 rounded-xl bg-purple-100 border border-purple-300 mb-2"
                        >
                          <Text className="text-purple-800 font-bold">You</Text>
                        </TouchableOpacity>
                        {users.map(user => (
                          <TouchableOpacity
                            key={user.id}
                            onPress={() => toggleUserSelection(user.id)}
                            className={`px-5 py-3 rounded-xl border mb-2 transition-all ${selectedUsers.includes(user.id)
                              ? 'bg-purple-600 border-purple-600 shadow-md shadow-purple-200'
                              : 'bg-white border-gray-200'
                              }`}
                          >
                            <Text className={`font-semibold ${selectedUsers.includes(user.id) ? 'text-white' : 'text-gray-600'
                              }`}>
                              {user.email.split('@')[0]}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  onPress={handleCreateSplit}
                  className="bg-gray-900 p-5 rounded-2xl mt-4 shadow-xl mb-4 active:bg-gray-800"
                >
                  <Text className="text-white font-bold text-center text-lg">Split Expense</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* View Details Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={detailsModalVisible}
          onRequestClose={() => setDetailsModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/70 px-4">
            <View className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl">
              {selectedSplit && (
                <>
                  <View className="flex-row justify-between items-start mb-8">
                    <View className={`w-12 h-12 rounded-2xl items-center justify-center ${selectedSplit.status === 'owed' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      <MaterialIcons
                        name={selectedSplit.title.toLowerCase().includes('food') ? "restaurant" : "receipt"}
                        size={24}
                        color={selectedSplit.status === 'owed' ? '#10b981' : '#ef4444'}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => setDetailsModalVisible(false)}
                      className="bg-gray-50 p-2 rounded-full border border-gray-100"
                    >
                      <MaterialIcons name="close" size={20} color="#374151" />
                    </TouchableOpacity>
                  </View>

                  <View className="mb-8">
                    <Text className="text-2xl font-bold text-gray-900 leading-tight mb-1">{selectedSplit.title}</Text>
                    <Text className="text-gray-400 font-medium">{selectedSplit.date}</Text>
                  </View>

                  <View className="flex-row items-end mb-8 border-b border-gray-100 pb-8">
                    <Text className="text-5xl font-bold text-gray-900 mr-2">${selectedSplit.amount.toFixed(0)}</Text>
                    <Text className="text-2xl font-bold text-gray-400 mb-1.5">.{selectedSplit.amount.toFixed(2).split('.')[1]}</Text>
                  </View>

                  <Text className="text-gray-400 font-bold mb-4 uppercase text-xs tracking-widest">Details</Text>
                  <View className="space-y-4">
                    {getSplitBreakdown(selectedSplit).map((person, index) => (
                      <View key={index} className="flex-row justify-between items-center">
                        <View className="flex-row items-center gap-3">
                          <LinearGradient
                            colors={person.isPayer ? ['#10b981', '#34d399'] : ['#e5e7eb', '#d1d5db']}
                            className="w-10 h-10 rounded-full items-center justify-center"
                          >
                            <Text className={`font-bold ${person.isPayer ? 'text-white' : 'text-gray-600'}`}>
                              {person.name[0].toUpperCase()}
                            </Text>
                          </LinearGradient>
                          <Text className="font-semibold text-gray-700 text-base">{person.name} {person.isPayer && '(Paid)'}</Text>
                        </View>
                        <Text className="font-bold text-gray-900 text-base">${person.amount.toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>

                  <View className="mt-8 pt-4 border-t border-gray-50">
                    <Text className="text-center text-gray-300 text-xs font-medium">
                      Split via Native Expense
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

export default Split;