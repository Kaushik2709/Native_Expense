import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Image, ActivityIndicator, Alert, ScrollView, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        // Default Mock Data
        setRecentSplits([
          {
            id: '1',
            title: 'Lunch at Cafe',
            amount: 45.00,
            date: 'Today, 12:30 PM',
            paidBy: 'You',
            splitWith: ['Alice', 'Bob'],
            status: 'owed'
          },
          {
            id: '2',
            title: 'Movie Tickets',
            amount: 32.50,
            date: 'Yesterday, 8:00 PM',
            paidBy: 'Alice',
            splitWith: ['You'],
            status: 'owing'
          }
        ]);
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
      const { data: { session }, error } = await supabase.auth.getSession();

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
            const updatedSplits = recentSplits.filter(s => s.id !== splitId);
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
      className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row items-center border border-gray-100"
    >
      <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${item.status === 'owed' ? 'bg-green-100' : 'bg-red-100'}`}>
        <MaterialIcons
          name={item.title.toLowerCase().includes('food') || item.title.toLowerCase().includes('lunch') ? "restaurant" : "receipt"}
          size={24}
          color={item.status === 'owed' ? '#22c55e' : '#ef4444'}
        />
      </View>
      <View className="flex-1">
        <Text className="font-bold text-gray-800 text-lg">{item.title}</Text>
        <Text className="text-gray-500 text-sm">{item.date}</Text>
        <Text className="text-gray-400 text-xs mt-1">
          {item.status === 'owed' ? `You paid, split with ${item.splitWith.join(', ')}` : `${item.paidBy} paid, you owe`}
        </Text>
      </View>
      <View className="items-end">
        <Text className={`font-bold text-lg ${item.status === 'owed' ? 'text-green-600' : 'text-red-500'}`}>
          {item.status === 'owed' ? '+' : '-'}${item.amount.toFixed(2)}
        </Text>
        <Text className="text-xs text-gray-400">{item.status === 'owed' ? 'you lent' : 'you owe'}</Text>
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
    <SafeAreaView className='flex-1 bg-gray-50'>
      <View className='px-4 flex-1'>
        <Navbar title="Split Bills" />

        <View className="flex-1">
          {/* Summary Cards */}
          <View className="flex-row justify-between mb-6 mt-2">
            <View className="bg-green-500 p-4 rounded-2xl flex-1 mr-2 shadow-sm">
              <Text className="text-green-100 font-medium mb-1">Total Owed to you</Text>
              <Text className="text-white text-2xl font-bold">$45.00</Text>
            </View>
            <View className="bg-red-500 p-4 rounded-2xl flex-1 ml-2 shadow-sm">
              <Text className="text-red-100 font-medium mb-1">Total You Owe</Text>
              <Text className="text-white text-2xl font-bold">$32.50</Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="flex-row items-center bg-purple-600 p-4 rounded-xl mb-6 justify-center shadow-md active:bg-purple-700"
          >
            <MaterialIcons name="add-circle-outline" size={24} color="white" />
            <Text className="text-white font-bold text-lg ml-2">New Expense Split</Text>
          </TouchableOpacity>

          {/* Recent Splits */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingBottom: 150 }}
          >
            <Text className="text-xl font-bold text-gray-800 mb-4">Recent Activity</Text>

            <FlatList
              data={recentSplits}
              renderItem={renderSplitItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </ScrollView>
        </View>

        {/* Add Split Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6 h-[80%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-gray-800">New Split</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} className='p-2 bg-gray-100 rounded-full'>
                  <MaterialIcons name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-gray-500 font-medium mb-2 uppercase text-xs tracking-wider">Total Expense</Text>
                <View className="bg-gray-50 p-6 rounded-2xl mb-6 border border-gray-100 flex-row items-center justify-between">
                  {/* Total Input */}
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500 mb-1">Total Amount</Text>
                    <View className="flex-row items-center">
                      <MaterialIcons name="attach-money" size={28} color="#1f2937" />
                      <TextInput
                        placeholder="0.00"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                        className="text-4xl font-bold text-gray-800 flex-1 ml-1"
                      />
                    </View>
                  </View>

                  {/* Split Math */}
                  {amount ? (
                    <View className="bg-purple-100 px-4 py-3 rounded-xl ml-4 items-end">
                      <Text className="text-purple-700 font-bold text-lg">
                        ${(parseFloat(amount) / (selectedUsers.length + 1)).toFixed(2)}
                      </Text>
                      <Text className="text-purple-500 text-xs">/ person</Text>
                    </View>
                  ) : null}
                </View>

                <Text className="text-gray-500 font-medium mb-2 uppercase text-xs tracking-wider">What was it for?</Text>
                <View className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                  <TextInput
                    placeholder="e.g. Dinner, Rent, Groceries"
                    value={description}
                    onChangeText={setDescription}
                    className="text-lg text-gray-800"
                  />
                </View>

                <Text className="text-gray-500 font-medium mb-3 uppercase text-xs tracking-wider mt-4">Split with who?</Text>

                {/* Add Person Input */}
                <View className="flex-row items-center mb-4 gap-2">
                  <TextInput
                    placeholder="Add friend's name"
                    value={newPerson}
                    onChangeText={setNewPerson}
                    className="flex-1 bg-white border border-gray-200 p-3 rounded-xl text-gray-800"
                  />
                  <TouchableOpacity
                    onPress={handleAddPerson}
                    className="bg-purple-100 p-3 rounded-xl border border-purple-200"
                  >
                    <MaterialIcons name="person-add" size={24} color="#7B61FF" />
                  </TouchableOpacity>
                </View>

                {loading ? (
                  <ActivityIndicator color="#7B61FF" />
                ) : (
                  <View className="flex-row flex-wrap gap-2">
                    {users.map(user => (
                      <TouchableOpacity
                        key={user.id}
                        onPress={() => toggleUserSelection(user.id)}
                        className={`px-4 py-2 rounded-full border ${selectedUsers.includes(user.id)
                          ? 'bg-purple-100 border-purple-500'
                          : 'bg-white border-200'
                          }`}
                      >
                        <Text className={`${selectedUsers.includes(user.id) ? 'text-purple-700 font-bold' : 'text-gray-600'
                          }`}>
                          {user.email.split('@')[0]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleCreateSplit}
                  className="bg-purple-600 p-4 rounded-xl mt-8 shadow-lg items-center"
                >
                  <Text className="text-white font-bold text-lg">Split Expense</Text>
                </TouchableOpacity>
              </ScrollView>
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
          <View className="flex-1 justify-center items-center bg-black/60 px-4">
            <View className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
              {selectedSplit && (
                <>
                  <View className="flex-row justify-between items-start mb-6">
                    <View>
                      <Text className="text-2xl font-bold text-gray-900">{selectedSplit.title}</Text>
                      <Text className="text-gray-500 text-sm mt-1">{selectedSplit.date}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setDetailsModalVisible(false)} className="bg-gray-100 p-2 rounded-full">
                      <MaterialIcons name="close" size={20} color="black" />
                    </TouchableOpacity>
                  </View>

                  <View className="items-center mb-8">
                    <Text className="text-gray-500 text-sm mb-1 uppercase tracking-widest font-medium">Total Bill</Text>
                    <Text className="text-4xl font-extrabold text-gray-900">${selectedSplit.amount.toFixed(2)}</Text>
                    <View className={`mt-2 px-3 py-1 rounded-full ${selectedSplit.status === 'owed' ? 'bg-green-100' : 'bg-red-100'}`}>
                      <Text className={`text-xs font-bold ${selectedSplit.status === 'owed' ? 'text-green-700' : 'text-red-700'}`}>
                        {selectedSplit.status === 'owed' ? 'YOU PAID' : `${selectedSplit.paidBy.toUpperCase()} PAID`}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-gray-500 font-medium mb-3 uppercase text-xs tracking-wider">Split Breakdown</Text>
                  <View className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    {getSplitBreakdown(selectedSplit).map((person, index) => (
                      <View key={index} className={`flex-row justify-between items-center py-3 ${index !== 0 ? 'border-t border-gray-200' : ''}`}>
                        <View className="flex-row items-center">
                          <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${person.isPayer ? 'bg-green-200' : 'bg-gray-200'}`}>
                            <Text className={`font-bold text-xs ${person.isPayer ? 'text-green-800' : 'text-gray-600'}`}>{person.name[0].toUpperCase()}</Text>
                          </View>
                          <Text className="font-semibold text-gray-700 text-base">{person.name}</Text>
                        </View>
                        <Text className="font-bold text-gray-900 text-base">${person.amount.toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>

                  <View className="mt-6 flex-row justify-center">
                    <Text className="text-center text-gray-400 text-xs">
                      Everyone shares the cost equally.
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