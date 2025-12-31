import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'

const Transaction = () => {
  const dummyData = {
    "accounts": [
      {
        "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "user_id": "11111111-1111-1111-1111-111111111111",
        "name": "Cash Wallet",
        "type": "cash",
        "currency": "INR",
        "current_balance": 8500.00,
        "created_at": "2025-01-10T10:30:00Z"
      },
      {
        "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "user_id": "11111111-1111-1111-1111-111111111111",
        "name": "SBI UPI",
        "type": "bank",
        "currency": "INR",
        "current_balance": 15250.75,
        "created_at": "2025-01-08T09:15:00Z"
      },
      {
        "id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
        "user_id": "11111111-1111-1111-1111-111111111111",
        "name": "HDFC Savings",
        "type": "bank",
        "currency": "INR",
        "current_balance": 42500.00,
        "created_at": "2025-01-05T11:45:00Z"
      },
      {
        "id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
        "user_id": "11111111-1111-1111-1111-111111111111",
        "name": "HDFC Credit Card",
        "type": "credit_card",
        "currency": "INR",
        "current_balance": -3200.00,
        "created_at": "2025-01-03T14:20:00Z"
      },
      {
        "id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        "user_id": "11111111-1111-1111-1111-111111111111",
        "name": "Paytm Wallet",
        "type": "wallet",
        "currency": "INR",
        "current_balance": 1200.50,
        "created_at": "2025-01-01T08:00:00Z"
      }
    ],
    "transactions": [
      {
        "id": "t1",
        "account_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "account_name": "SBI UPI",
        "type": "expense",
        "category": "Food & Dining",
        "amount": 450.00,
        "description": "Dinner at Domino's",
        "date": "2025-12-14T19:30:00Z",
        "icon": "🍕"
      },
      {
        "id": "t2",
        "account_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
        "account_name": "HDFC Savings",
        "type": "income",
        "category": "Salary",
        "amount": 45000.00,
        "description": "Monthly Salary",
        "date": "2025-12-13T10:00:00Z",
        "icon": "💰"
      },
      {
        "id": "t3",
        "account_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "account_name": "Cash Wallet",
        "type": "expense",
        "category": "Transportation",
        "amount": 120.00,
        "description": "Auto to office",
        "date": "2025-12-13T09:15:00Z",
        "icon": "🚕"
      },
      {
        "id": "t4",
        "account_id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
        "account_name": "HDFC Credit Card",
        "type": "expense",
        "category": "Shopping",
        "amount": 2500.00,
        "description": "Amazon order - Electronics",
        "date": "2025-12-12T15:20:00Z",
        "icon": "🛍️"
      },
      {
        "id": "t5",
        "account_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "account_name": "SBI UPI",
        "type": "expense",
        "category": "Bills & Utilities",
        "amount": 850.00,
        "description": "Electricity Bill",
        "date": "2025-12-11T11:00:00Z",
        "icon": "⚡"
      },
      {
        "id": "t6",
        "account_id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        "account_name": "Paytm Wallet",
        "type": "expense",
        "category": "Entertainment",
        "amount": 350.00,
        "description": "Movie tickets - PVR",
        "date": "2025-12-10T18:00:00Z",
        "icon": "🎬"
      },
      {
        "id": "t7",
        "account_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "account_name": "Cash Wallet",
        "type": "expense",
        "category": "Food & Dining",
        "amount": 250.00,
        "description": "Coffee & snacks",
        "date": "2025-12-10T16:30:00Z",
        "icon": "☕"
      },
      {
        "id": "t8",
        "account_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "account_name": "SBI UPI",
        "type": "income",
        "category": "Freelance",
        "amount": 5000.00,
        "description": "Website project payment",
        "date": "2025-12-09T14:00:00Z",
        "icon": "💻"
      },
      {
        "id": "t9",
        "account_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
        "account_name": "HDFC Savings",
        "type": "expense",
        "category": "Healthcare",
        "amount": 1200.00,
        "description": "Medical checkup",
        "date": "2025-12-08T10:30:00Z",
        "icon": "🏥"
      },
      {
        "id": "t10",
        "account_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "account_name": "Cash Wallet",
        "type": "expense",
        "category": "Transportation",
        "amount": 80.00,
        "description": "Metro ticket",
        "date": "2025-12-08T08:00:00Z",
        "icon": "🚇"
      }
    ]
  }

  const formatDate = (dateString:any) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    }
  }

  const formatTime = (dateString:any) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const groupTransactionsByDate = () => {
    const grouped: { [key: string]: typeof dummyData.transactions } = {}

    dummyData.transactions.forEach(transaction => {
      const dateKey = formatDate(transaction.date)
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(transaction)
    })
    return grouped
  }

  const groupedTransactions = groupTransactionsByDate()
  

  return (
    <ScrollView className="flex-1 bg-gray-50 mb-24">
      <View className="p-5 bg-white border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-900 mb-1">Transactions</Text>
        <Text className="text-sm text-gray-600">
          {dummyData.transactions.length} transactions
        </Text>
      </View>

      {Object.entries(groupedTransactions).map(([date, transactions]) => (
        <View key={date} className="mt-4">
          <Text className="text-sm font-semibold text-gray-600 px-5 py-2 bg-gray-50">
            {date}
          </Text>
          
          {transactions.map((transaction) => (
            <TouchableOpacity 
              key={transaction.id} 
              className="flex-row items-center bg-white p-4 border-b border-gray-100"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 rounded-full bg-gray-100 justify-center items-center mr-3">
                <Text className="text-2xl">{transaction.icon}</Text>
              </View>
              
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  {transaction.description}
                </Text>
                <Text className="text-sm text-gray-600 mb-0.5">
                  {transaction.category}
                </Text>
                <Text className="text-xs text-gray-400">
                  {transaction.account_name} • {formatTime(transaction.date)}
                </Text>
              </View>
              
              <View className="items-end">
                <Text className={`text-base font-bold ${
                  transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  )
}

export default Transaction