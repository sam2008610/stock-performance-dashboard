<template>
  <div class="max-w-7xl mx-auto px-4 py-10">
    <!-- 頁面標題 -->
    <div class="mb-8">
      <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
        交易行為分析
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        深入了解您的投資行為模式，優化投資策略
      </p>
    </div>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- 總交易次數 -->
      <div class="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-100 text-sm font-medium">總交易次數</p>
            <p class="text-3xl font-bold" v-text="totalTransactions"></p>
          </div>
          <div class="p-3 bg-white/20 rounded-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- 近一年交易頻率 -->
      <div class="rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-100 text-sm font-medium">近一年交易頻率</p>
            <p class="text-3xl font-bold" v-text="yearlyFrequency.toFixed(1)"></p>
            <p class="text-green-100 text-xs">次/月</p>
          </div>
          <div class="p-3 bg-white/20 rounded-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- 平均持有時間 -->
      <div class="rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-purple-100 text-sm font-medium">平均持有時間</p>
            <p class="text-3xl font-bold" v-text="averageHoldingDays"></p>
            <p class="text-purple-100 text-xs">天</p>
          </div>
          <div class="p-3 bg-white/20 rounded-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- 交易活躍度 -->
      <div class="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-orange-100 text-sm font-medium">交易活躍度</p>
            <p class="text-3xl font-bold" v-text="activityLevel"></p>
          </div>
          <div class="p-3 bg-white/20 rounded-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 交易頻率分析 -->
    <div class="rounded-2xl shadow-xl bg-white/80 dark:bg-[#23272f]/80 backdrop-blur p-8 mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <span class="inline-block w-2 h-8 bg-gradient-to-b from-[#06b6d4] to-[#8b5cf6] rounded-full mr-2"></span>
          交易頻率分析
        </h2>
        <div class="flex bg-gray-100 dark:bg-[#282a36] rounded-lg p-1 gap-1">
          <button
            @click="frequencyPeriod = 6"
            :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
              frequencyPeriod === 6 
                ? 'bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white shadow' 
                : 'text-gray-600 dark:text-[#8be9fd] hover:text-[#8b5cf6] dark:hover:text-[#50fa7b]'
            ]"
          >
            6個月
          </button>
          <button
            @click="frequencyPeriod = 12"
            :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
              frequencyPeriod === 12 
                ? 'bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white shadow' 
                : 'text-gray-600 dark:text-[#8be9fd] hover:text-[#8b5cf6] dark:hover:text-[#50fa7b]'
            ]"
          >
            12個月
          </button>
        </div>
      </div>
      <div class="h-80">
        <Bar
          v-if="frequencyChartData"
          :data="frequencyChartData"
          :options="frequencyChartOptions"
        />
      </div>
    </div>

    <!-- 股票持有時間分析 -->
    <div class="rounded-2xl shadow-xl bg-white/80 dark:bg-[#23272f]/80 backdrop-blur p-8 mb-8">
      <h2 class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <span class="inline-block w-2 h-8 bg-gradient-to-b from-[#50fa7b] to-[#ff79c6] rounded-full mr-2"></span>
        股票持有時間分析
      </h2>
      <div class="overflow-x-auto rounded-xl border border-gray-100 dark:border-[#6272a4] bg-white/70 dark:bg-[#23272f]/70">
        <table class="min-w-full text-sm text-left">
          <thead class="bg-gradient-to-r from-[#f3f4f6] to-[#e0e7ef] dark:from-[#23272f] dark:to-[#23272f]">
            <tr>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">股票代碼</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">股票名稱</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">首次買入</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">持有天數</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">交易次數</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">狀態</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stock in stockHoldingAnalysis" :key="stock.symbol" class="hover:bg-[#f3f4f6] dark:hover:bg-[#282a36] transition">
              <td class="px-6 py-4 font-mono text-base text-gray-900 dark:text-[#f8f8f2]" v-text="stock.symbol"></td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]" v-text="stock.stockName"></td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]" v-text="stock.firstBuyDate"></td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]" v-text="stock.holdingDays"></td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]" v-text="stock.transactionCount"></td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                  :class="stock.isHolding ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'"
                >
                  <span v-text="stock.isHolding ? '持有中' : '已賣出'"></span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 交易行為洞察 -->
    <div class="rounded-2xl shadow-xl bg-white/80 dark:bg-[#23272f]/80 backdrop-blur p-8">
      <h2 class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <span class="inline-block w-2 h-8 bg-gradient-to-b from-[#ff79c6] to-[#bd93f9] rounded-full mr-2"></span>
        交易行為洞察
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 買賣比例 -->
        <div class="bg-gray-50 dark:bg-[#282a36] rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">買賣比例</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">買入交易</span>
              <span class="font-semibold text-green-600 dark:text-green-400" v-text="`${buyTransactions} 次 (${buyPercentage.toFixed(1)}%)`"></span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">賣出交易</span>
              <span class="font-semibold text-red-600 dark:text-red-400" v-text="`${sellTransactions} 次 (${sellPercentage.toFixed(1)}%)`"></span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                class="bg-gradient-to-r from-green-500 to-red-500 h-3 rounded-full"
                :style="{ width: '100%' }"
              >
                <div 
                  class="bg-green-500 h-3 rounded-l-full"
                  :style="{ width: buyPercentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 交易活躍月份 -->
        <div class="bg-gray-50 dark:bg-[#282a36] rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">最活躍交易月份</h3>
          <div class="space-y-3">
            <div v-for="month in topActiveMonths" :key="month.month" class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400" v-text="month.monthName"></span>
              <span class="font-semibold text-blue-600 dark:text-blue-400" v-text="`${month.count} 次`"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTransactions, type Transaction } from '~/composables/useTransactions'
import { useTheme } from '~/composables/useTheme'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'vue-chartjs'

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// 設定頁面標題
useHead({
  title: '交易行為分析 - 股票投資追蹤器'
})

// 類型定義
interface StockAnalysisData {
  symbol: string
  stockName: string
  transactions: Transaction[]
  firstBuyDate: string | null
  isHolding: boolean
}

interface StockHoldingResult {
  symbol: string
  stockName: string
  firstBuyDate: string
  holdingDays: number
  transactionCount: number
  isHolding: boolean
}

const { transactions } = useTransactions()
const { isDarkMode } = useTheme()

// 分析時間範圍
const frequencyPeriod = ref(12)

// 基本統計計算
const totalTransactions = computed(() => transactions.value.length)

const buyTransactions = computed(() => 
  transactions.value.filter(t => t.type === 'buy').length
)

const sellTransactions = computed(() => 
  transactions.value.filter(t => t.type === 'sell').length
)

const buyPercentage = computed(() => 
  totalTransactions.value > 0 ? (buyTransactions.value / totalTransactions.value) * 100 : 0
)

const sellPercentage = computed(() => 
  totalTransactions.value > 0 ? (sellTransactions.value / totalTransactions.value) * 100 : 0
)

// 近一年交易頻率計算
const yearlyFrequency = computed(() => {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  
  const recentTransactions = transactions.value.filter(t => 
    new Date(t.date) >= oneYearAgo
  )
  
  return recentTransactions.length / 12 // 每月平均次數
})

// 交易活躍度評估
const activityLevel = computed(() => {
  const frequency = yearlyFrequency.value
  if (frequency >= 4) return '高'
  if (frequency >= 2) return '中'
  if (frequency >= 0.5) return '低'
  return '極低'
})

// 股票持有時間分析
const stockHoldingAnalysis = computed(() => {
  const stockMap = new Map<string, StockAnalysisData>()
  
  // 分析每支股票的交易記錄
  transactions.value.forEach(transaction => {
    const symbol = transaction.symbol
    if (!stockMap.has(symbol)) {
      stockMap.set(symbol, {
        symbol,
        stockName: transaction.stockName || symbol,
        transactions: [],
        firstBuyDate: null,
        isHolding: false
      })
    }
    
    const stock = stockMap.get(symbol)
    if (stock) {
      stock.transactions.push(transaction)
      
      // 記錄首次買入日期
      if (transaction.type === 'buy' && (!stock.firstBuyDate || new Date(transaction.date) < new Date(stock.firstBuyDate))) {
        stock.firstBuyDate = transaction.date
      }
    }
  })
  
  // 計算每支股票的持有時間和狀態
  const analysis: StockHoldingResult[] = Array.from(stockMap.values()).map((stock: StockAnalysisData) => {
    const sortedTransactions = stock.transactions.sort((a: Transaction, b: Transaction) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    // 計算當前是否持有
    let currentQuantity = 0
    sortedTransactions.forEach((t: Transaction) => {
      if (t.type === 'buy') {
        currentQuantity += t.quantity
      } else {
        currentQuantity -= t.quantity
      }
    })
    
    const isHolding = currentQuantity > 0
    const firstBuyDate = stock.firstBuyDate
    const now = new Date()
    
    if (!firstBuyDate) {
      return {
        symbol: stock.symbol,
        stockName: stock.stockName,
        firstBuyDate: '-',
        holdingDays: 0,
        transactionCount: stock.transactions.length,
        isHolding
      }
    }
    
    const firstBuy = new Date(firstBuyDate)
    
    // 計算持有天數
    let holdingDays = 0
    if (isHolding) {
      // 如果還在持有，計算到現在的天數
      holdingDays = Math.floor((now.getTime() - firstBuy.getTime()) / (1000 * 60 * 60 * 24))
    } else {
      // 如果已賣出，計算最後賣出日期
      const lastSellDate = sortedTransactions
        .filter((t: Transaction) => t.type === 'sell')
        .pop()?.date
      
      if (lastSellDate) {
        holdingDays = Math.floor((new Date(lastSellDate).getTime() - firstBuy.getTime()) / (1000 * 60 * 60 * 24))
      }
    }
    
    return {
      symbol: stock.symbol,
      stockName: stock.stockName,
      firstBuyDate: firstBuyDate ? new Date(firstBuyDate).toLocaleDateString('zh-TW') : '-',
      holdingDays,
      transactionCount: stock.transactions.length,
      isHolding
    }
  })
  
  return analysis.sort((a, b) => b.holdingDays - a.holdingDays)
})

// 平均持有時間
const averageHoldingDays = computed(() => {
  if (stockHoldingAnalysis.value.length === 0) return 0
  
  const totalDays = stockHoldingAnalysis.value.reduce((sum, stock) => sum + stock.holdingDays, 0)
  return Math.round(totalDays / stockHoldingAnalysis.value.length)
})

// 交易頻率圖表數據
const frequencyChartData = computed(() => {
  const months: string[] = []
  const now = new Date()
  
  for (let i = frequencyPeriod.value - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(date.toISOString().slice(0, 7)) // YYYY-MM 格式
  }
  
  const monthCounts = months.map(month => {
    return transactions.value.filter(t => t.date.startsWith(month)).length
  })
  
  return {
    labels: months.map(month => {
      const date = new Date(month + '-01')
      return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short' })
    }),
    datasets: [{
      label: '交易次數',
      data: monthCounts,
      backgroundColor: isDarkMode.value ? '#8b5cf6' : '#6366f1',
      borderColor: isDarkMode.value ? '#a78bfa' : '#4f46e5',
      borderWidth: 1,
      borderRadius: 4
    }]
  }
})

// 交易頻率圖表選項
const frequencyChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        color: isDarkMode.value ? '#f8f8f2' : '#374151'
      },
      grid: {
        color: isDarkMode.value ? '#6272a4' : '#e5e7eb'
      }
    },
    x: {
      ticks: {
        color: isDarkMode.value ? '#f8f8f2' : '#374151'
      },
      grid: {
        color: isDarkMode.value ? '#6272a4' : '#e5e7eb'
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: isDarkMode.value ? '#44475a' : '#ffffff',
      titleColor: isDarkMode.value ? '#f8f8f2' : '#374151',
      bodyColor: isDarkMode.value ? '#f8f8f2' : '#374151',
      borderColor: isDarkMode.value ? '#6272a4' : '#d1d5db',
      borderWidth: 1
    }
  }
}))

// 最活躍交易月份
const topActiveMonths = computed(() => {
  const monthCounts = new Map()
  
  transactions.value.forEach(t => {
    const month = t.date.slice(0, 7) // YYYY-MM
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1)
  })
  
  return Array.from(monthCounts.entries())
    .map(([month, count]) => ({
      month,
      monthName: new Date(month + '-01').toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' }),
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
})

onMounted(() => {
  // 頁面載入時的初始化邏輯
})
</script> 