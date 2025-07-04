<template>
  <div class="max-w-7xl mx-auto px-4 py-10 grid gap-10">
    <!-- Summary 區塊：總資金與總報酬率（柔和色調） -->
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div class="flex flex-col md:flex-row gap-4 w-full">
        <div class="flex-1 rounded-xl bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 shadow p-6">
          <div class="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-200">總投資資金</div>
          <div class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">NT$ {{ totalValue.toLocaleString() }}</div>
        </div>
        <div class="flex-1 rounded-xl bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 shadow p-6">
          <div class="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-200">總報酬率</div>
          <div class="text-3xl font-extrabold tracking-tight" :class="totalReturnRate >= 0 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'">
            {{ totalReturnRate.toFixed(2) }}%
          </div>
        </div>
        <div class="flex-1 rounded-xl bg-gradient-to-r from-green-200 to-green-100 dark:from-green-700 dark:to-green-800 shadow p-6">
          <div class="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-200">現金餘額</div>
          <div class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">NT$ {{ currentAssets?.cash?.toLocaleString() || '0' }}</div>
        </div>
        <div class="flex-1 rounded-xl bg-gradient-to-r from-purple-200 to-purple-100 dark:from-purple-700 dark:to-purple-800 shadow p-6">
          <div class="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-200">總資產</div>
          <div class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">NT$ {{ totalAssets.toLocaleString() }}</div>
        </div>
      </div>
    </div>

    <!-- 投資組合卡片 -->
    <div class="rounded-2xl shadow-xl bg-white/80 dark:bg-[#23272f]/80 backdrop-blur p-8 mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <span class="inline-block w-2 h-8 bg-gradient-to-b from-[#8b5cf6] to-[#06b6d4] rounded-full mr-2"></span>
          投資組合
        </h2>
        <button 
          @click="clearCacheAndRefresh"
          :disabled="isClearing"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-600 dark:bg-slate-700 text-white font-medium shadow-md hover:bg-slate-700 dark:hover:bg-slate-600 transition disabled:opacity-50"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5 9A7 7 0 0112 5a7 7 0 017 7v3m-7 7a7 7 0 01-7-7v-3m7 7a7 7 0 007-7"/></svg>
          {{ isClearing ? '清除中...' : '清除快取' }}
        </button>
      </div>
      <div class="overflow-x-auto rounded-xl border border-gray-100 dark:border-[#6272a4] bg-white/70 dark:bg-[#23272f]/70">
        <table class="min-w-full text-sm text-left">
          <thead class="bg-gradient-to-r from-[#f3f4f6] to-[#e0e7ef] dark:from-[#23272f] dark:to-[#23272f]">
            <tr>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">代碼</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">名稱</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">資產類型</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">持有數量</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">平均成本</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">當前價格</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">總成本</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">當前價值</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">報酬率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stock in portfolio" :key="stock.symbol" class="hover:bg-[#f3f4f6] dark:hover:bg-[#282a36] transition">
              <td class="px-6 py-4 font-mono text-base text-gray-900 dark:text-[#f8f8f2]" v-text="stock.symbol"></td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]">
                <NuxtLink 
                  :to="`/stock/${stock.symbol}`"
                  class="hover:text-[#8b5cf6] dark:hover:text-[#50fa7b] transition-colors cursor-pointer"
                >
                  <span v-text="stock.stockName"></span>
                </NuxtLink>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" :class="getAssetTypeClass(stock.assetType)" v-text="getAssetTypeName(stock.assetType)"></span>
              </td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]">{{ stock.quantity }}</td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]">{{ formatCurrency(stock.avgCost, stock.assetType) }}</td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]">{{ formatCurrency(stock.currentPrice, stock.assetType) }}</td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]">{{ formatCurrency(stock.totalCost, stock.assetType, true) }}</td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]">{{ formatCurrency(stock.currentValue, stock.assetType, true) }}</td>
              <td class="px-6 py-4 text-base font-bold" :class="stock.returnRate >= 0 ? 'text-green-600 dark:text-[#50fa7b]' : 'text-red-600 dark:text-[#ff5555]'">
                {{ stock.returnRate.toFixed(2) }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 資產配置卡片 -->
    <div class="rounded-2xl shadow-xl bg-white/80 dark:bg-[#23272f]/80 backdrop-blur p-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <span class="inline-block w-2 h-8 bg-gradient-to-b from-[#06b6d4] to-[#8b5cf6] rounded-full mr-2"></span>
          資產配置
        </h2>
        <div class="flex items-center gap-4">
          <!-- 時間範圍選擇 -->
          <div class="flex bg-gray-100 dark:bg-[#282a36] rounded-lg p-1 gap-1">
            <button
              @click="timeRange = 6"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                timeRange === 6 
                  ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-md' 
                  : 'text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
              ]"
            >
              6個月
            </button>
            <button
              @click="timeRange = 12"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                timeRange === 12 
                  ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-md' 
                  : 'text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
              ]"
            >
              12個月
            </button>
            <button
              @click="timeRange = 24"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                timeRange === 24 
                  ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-md' 
                  : 'text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
              ]"
            >
              24個月
            </button>
          </div>
          <!-- 圖表類型切換 -->
          <div class="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1 gap-2">
            <button
              @click="chartType = 'pie'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                chartType === 'pie' 
                  ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-md' 
                  : 'text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
              ]"
            >
              圓餅圖
            </button>
            <button
              @click="chartType = 'area'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                chartType === 'area' 
                  ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-md' 
                  : 'text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
              ]"
            >
              面積圖
            </button>
          </div>
          
          <!-- 投資組合日期選擇 (只在圓餅圖模式顯示) -->
          <div v-if="chartType === 'pie'" class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-600 dark:text-slate-400">選擇日期:</label>
            <div class="relative">
              <input
                type="date"
                v-model="selectedDate"
                :max="today"
                :min="earliestDate"
                class="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div class="h-96">
        <Pie
          v-if="chartType === 'pie' && pieChartData"
          :data="pieChartData"
          :options="pieChartOptions"
        />
        <Line
          v-if="chartType === 'area' && areaChartData"
          :data="areaChartData"
          :options="areaChartOptions"
        />
      </div>
    </div>

    <!-- 資產變化趨勢圖 -->
    <div class="rounded-2xl shadow-xl bg-white/80 dark:bg-[#23272f]/80 backdrop-blur p-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <span class="inline-block w-2 h-8 bg-gradient-to-b from-[#50fa7b] to-[#ff79c6] rounded-full mr-2"></span>
          資產變化趨勢
        </h2>
        <div class="flex items-center gap-4">
          <div class="flex bg-gray-100 dark:bg-[#282a36] rounded-lg p-1 gap-1">
            <button
              @click="assetTimeRange = 6"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                assetTimeRange === 6 
                  ? 'bg-emerald-600 dark:bg-emerald-700 text-white shadow-md' 
                  : 'text-gray-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              ]"
            >
              6個月
            </button>
            <button
              @click="assetTimeRange = 12"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                assetTimeRange === 12 
                  ? 'bg-emerald-600 dark:bg-emerald-700 text-white shadow-md' 
                  : 'text-gray-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              ]"
            >
              12個月
            </button>
            <button
              @click="assetTimeRange = 24"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                assetTimeRange === 24 
                  ? 'bg-emerald-600 dark:bg-emerald-700 text-white shadow-md' 
                  : 'text-gray-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              ]"
            >
              24個月
            </button>
          </div>
        </div>
      </div>
      <div class="h-96">
        <Line
          v-if="assetTrendChartData"
          :data="assetTrendChartData"
          :options="assetTrendChartOptions"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  TimeScale
} from 'chart.js'
import { Pie, Line } from 'vue-chartjs'
import { useTransactions } from '~/composables/useTransactions'
import { useStockPrice } from '~/composables/useStockPrice'
import { useAssetHistory } from '~/composables/useAssetHistory'

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  TimeScale
)

const { portfolio, initialize, updateStockPrices, updateStockNames } = useTransactions()
const { clearCache } = useStockPrice()
const { assetHistory, initialSetup, loadAssetHistory, currentAssets, getStockHistory } = useAssetHistory()

// 圖表類型切換
const chartType = ref<'pie' | 'area'>('pie')

// 時間範圍選擇 (用於面積圖)
const timeRange = ref<6 | 12 | 24>(12)

// 投資組合日期選擇 (用於圓餅圖)
const selectedDate = ref('')
const today = new Date().toISOString().split('T')[0]
const earliestDate = ref('')

// 資產變化趨勢時間範圍
const assetTimeRange = ref<6 | 12 | 24>(12)

// 清除快取狀態
const isClearing = ref(false)

// 清除快取並重新整理
const clearCacheAndRefresh = async () => {
  isClearing.value = true
  try {
    // 清除快取
    await clearCache()
    
    // 重新初始化和更新股價
    await initialize()
    await Promise.all([
      updateStockPrices(),
      updateStockNames()
    ])
    
    // 顯示成功訊息
    console.log('快取已清除並重新載入資料')
  } catch (error) {
    console.error('清除快取時發生錯誤:', error)
  } finally {
    isClearing.value = false
  }
}

// 獲取資產類型名稱
const getAssetTypeName = (assetType: string) => {
  const names: Record<string, string> = {
    tw_stock: '台股',
    us_stock: '美股',
    crypto: '加密貨幣',
    bond: '債券',
    financial_product: '金融商品'
  }
  return names[assetType] || '台股'
}

// 獲取資產類型樣式
const getAssetTypeClass = (assetType: string) => {
  const classes: Record<string, string> = {
    tw_stock: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    us_stock: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    crypto: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    bond: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    financial_product: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
  return classes[assetType] || classes.tw_stock
}

// 格式化貨幣顯示
const formatCurrency = (amount: number, assetType: string, useLocale: boolean = false) => {
  const currencies: Record<string, string> = {
    tw_stock: 'NT$',
    us_stock: 'USD',
    crypto: 'USD',
    bond: 'USD',
    financial_product: 'USD'
  }
  
  const currency = currencies[assetType] || 'NT$'
  const formattedAmount = useLocale ? amount.toLocaleString() : amount.toFixed(2)
  
  return `${currency} ${formattedAmount}`
}

// 主題偵測
const isDarkMode = ref(false)

// 檢查當前主題
const checkTheme = () => {
  if (typeof window !== 'undefined') {
    isDarkMode.value = document.documentElement.classList.contains('dark')
  }
}

// 生成配合主題的顏色
const generateColors = (count: number) => {
  const darkColors = [
    '#bd93f9', // Purple (primary accent)
    '#8be9fd', // Cyan
    '#50fa7b', // Green
    '#ffb86c', // Orange
    '#ff79c6', // Pink
    '#f1fa8c', // Yellow
    '#ff5555', // Red
    '#6272a4', // Blue gray
    '#44475a', // Dark gray
    '#282a36'  // Darker gray
  ]
  
  const lightColors = [
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#10b981', // Green
    '#f59e0b', // Orange
    '#ec4899', // Pink
    '#eab308', // Yellow
    '#ef4444', // Red
    '#6366f1', // Indigo
    '#64748b', // Slate
    '#374151'  // Gray
  ]
  
  return (isDarkMode.value ? darkColors : lightColors).slice(0, count)
}

// 圓餅圖數據 (基於選擇的時間範圍)
const pieChartData = computed(() => {
  checkTheme() // 每次計算時檢查主題
  
  if (!assetHistory.value || assetHistory.value.length === 0) {
    // 如果沒有歷史資料，使用當前數據
    const stockLabels = portfolio.value.map(stock => stock.stockName || stock.symbol)
    const stockData = portfolio.value.map(stock => stock.currentValue)
    const cashValue = currentAssets.value?.cash || 0
    const labels = cashValue > 0 ? ['現金', ...stockLabels] : stockLabels
    const data = cashValue > 0 ? [cashValue, ...stockData] : stockData
    
    return {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: generateColors(labels.length),
        borderWidth: 2,
        borderColor: isDarkMode.value ? '#334155' : '#e5e7eb'
      }]
    }
  }
  
  // 根據選擇的日期獲取目標日期
  const targetDate = selectedDate.value ? new Date(selectedDate.value) : new Date()
  
  // 找到最接近目標日期的資產快照
  const sortedHistory = [...assetHistory.value].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  let targetSnapshot = sortedHistory.find(snapshot => 
    new Date(snapshot.date) <= targetDate
  ) || sortedHistory[sortedHistory.length - 1] // 如果沒找到，使用最早的記錄
  
  // 如果還是沒有資料，使用最新的
  if (!targetSnapshot) {
    targetSnapshot = sortedHistory[0]
  }
  
  if (!targetSnapshot) {
    return { labels: [], datasets: [] }
  }
  
  // 解析投資組合數據
  const portfolioData: Record<string, number> = {}
  const stockHistory = targetSnapshot.stocks || {}
  
  // 加入股票數據
  Object.entries(stockHistory).forEach(([symbol, stockData]: [string, any]) => {
    if (stockData && typeof stockData === 'object' && stockData.value > 0) {
      const stockName = stockData.stockName || symbol
      portfolioData[stockName] = stockData.value
    }
  })
  
  // 加入現金數據
  if (targetSnapshot.cash > 0) {
    portfolioData['現金'] = targetSnapshot.cash
  }
  
  const labels = Object.keys(portfolioData)
  const data = Object.values(portfolioData)
  
  return {
    labels: labels,
    datasets: [{
      data: data,
      backgroundColor: generateColors(labels.length),
      borderWidth: 2,
      borderColor: isDarkMode.value ? '#334155' : '#e5e7eb'
    }]
  }
})

// 面積圖數據
const areaChartData = computed(() => {
  checkTheme()
  
  // 生成連續的時間軸
  const months: string[] = []
  const now = new Date()
  for (let i = timeRange.value - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(date.toISOString().split('T')[0]) // 使用 YYYY-MM-DD 格式
  }
  
  const colors = generateColors(portfolio.value.length + 1) // +1 for cash
  const datasets = []
  
  // 檢查是否有足夠的資產歷史數據
  const hasValidHistory = assetHistory.value.length > 1 && 
    new Set(assetHistory.value.map(item => item.date)).size > 1
  
  if (hasValidHistory) {
    // 使用真實的歷史數據
    
    // 加入現金數據集
    const cashData = months.map(monthDate => {
      const monthDateObj = new Date(monthDate)
      
      // 先找該月份之前或當月的快照（向後找）
      const snapshotsBefore = assetHistory.value
        .filter(item => new Date(item.date) <= monthDateObj)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      if (snapshotsBefore.length > 0) {
        // 有該月份之前的快照，使用最近的一個
        return snapshotsBefore[0].cash
      }
      
      // 沒有該月份之前的快照，找該月份之後的快照（向前找）
      const snapshotsAfter = assetHistory.value
        .filter(item => new Date(item.date) > monthDateObj)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      if (snapshotsAfter.length > 0) {
        // 有該月份之後的快照，使用最近的一個
        return snapshotsAfter[0].cash
      }
      
      // 沒有任何快照，使用初始設定
      if (initialSetup.value.isCompleted) {
        return initialSetup.value.initialCash
      }
      
      return 0
    })
    
    if (cashData.some(value => value > 0)) {
      datasets.push({
        label: '現金',
        data: cashData,
        borderColor: isDarkMode.value ? '#50fa7b' : '#10b981',
        backgroundColor: isDarkMode.value ? '#50fa7b40' : '#10b98140',
        fill: 'origin',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 6
      })
    }
    
    // 加入股票數據集 - 使用歷史持有量數據
    portfolio.value.forEach((stock, index) => {
      const stockHistory = getStockHistory(stock.symbol)
      
      const stockData = months.map(monthDate => {
        const monthDateObj = new Date(monthDate)
        
        // 先找該月份之前或當月的股票持有量（向後找）
        const historyBefore = stockHistory
          .filter(h => new Date(h.date) <= monthDateObj)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        if (historyBefore.length > 0) {
          // 有該月份之前的歷史記錄，使用最近的一個
          const historyItem = historyBefore[0]
          if (historyItem.quantity > 0) {
            return historyItem.totalCost
          }
          return 0
        }
        
        // 沒有該月份之前的歷史記錄，找該月份之後的記錄（向前找）
        const historyAfter = stockHistory
          .filter(h => new Date(h.date) > monthDateObj)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        
        if (historyAfter.length > 0) {
          // 有該月份之後的歷史記錄，使用最近的一個
          const historyItem = historyAfter[0]
          if (historyItem.quantity > 0) {
            return historyItem.totalCost
          }
          return 0
        }
        
        // 沒有任何歷史記錄，返回0
        return 0
      })
      
      // 只有當股票有價值時才加入數據集
      if (stockData.some(value => value > 0)) {
        datasets.push({
          label: stock.stockName || stock.symbol,
          data: stockData,
          borderColor: colors[index + (cashData.some(value => value > 0) ? 1 : 0)],
          backgroundColor: colors[index + (cashData.some(value => value > 0) ? 1 : 0)] + '40',
          fill: '-1',
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 6
        })
      }
    })
  } else {
    // 如果沒有有效的歷史數據，使用當前資產數據
    const currentCash = currentAssets.value?.cash || 0
    
    // 加入現金數據集 - 所有月份使用相同的現金數據
    const cashData = months.map(() => currentCash)
    
    if (cashData.some(value => value > 0)) {
      datasets.push({
        label: '現金',
        data: cashData,
        borderColor: isDarkMode.value ? '#50fa7b' : '#10b981',
        backgroundColor: isDarkMode.value ? '#50fa7b40' : '#10b98140',
        fill: 'origin',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 6
      })
    }
    
    // 加入股票數據集 - 使用當前投資組合的數據
    portfolio.value.forEach((stock, index) => {
      const currentValue = stock.currentValue || 0
      
      // 所有月份使用相同的股票價值
      const stockData = months.map(() => currentValue)
      
      // 只有當股票有價值時才加入數據集
      if (stockData.some(value => value > 0)) {
        datasets.push({
          label: stock.stockName || stock.symbol,
          data: stockData,
          borderColor: colors[index + (cashData.some(value => value > 0) ? 1 : 0)],
          backgroundColor: colors[index + (cashData.some(value => value > 0) ? 1 : 0)] + '40',
          fill: '-1',
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 6
        })
      }
    })
  }
  
  return {
    labels: months.map(monthDate => {
      const date = new Date(monthDate)
      return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short' })
    }),
    datasets: datasets
  }
})

// 圓餅圖選項
const pieChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        font: {
          family: 'Noto Sans TC'
        },
        color: isDarkMode.value ? '#f8f8f2' : '#374151', // 根據主題調整文字顏色
        generateLabels: (chart: any) => {
          const data = chart.data
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label: string, index: number) => {
              const value = data.datasets[0].data[index]
              const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              
              // 處理現金的顯示
              if (label === '現金') {
                return {
                  text: `現金 (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[index],
                  strokeStyle: data.datasets[0].borderColor,
                  lineWidth: data.datasets[0].borderWidth,
                  fontColor: isDarkMode.value ? '#f8f8f2' : '#374151',
                  hidden: false,
                  index: index
                }
              }
              
              // 處理股票的顯示
              const stockIndex = index - (data.labels[0] === '現金' ? 1 : 0)
              const stock = portfolio.value[stockIndex]
              
              return {
                text: `${stock?.stockName || stock?.symbol || label} (${percentage}%)`,
                fillStyle: data.datasets[0].backgroundColor[index],
                strokeStyle: data.datasets[0].borderColor,
                lineWidth: data.datasets[0].borderWidth,
                fontColor: isDarkMode.value ? '#f8f8f2' : '#374151',
                hidden: false,
                index: index
              }
            })
          }
          return []
        }
      }
    },
    tooltip: {
      backgroundColor: isDarkMode.value ? '#44475a' : '#ffffff',
      titleColor: isDarkMode.value ? '#f8f8f2' : '#374151',
      bodyColor: isDarkMode.value ? '#f8f8f2' : '#374151',
      borderColor: isDarkMode.value ? '#6272a4' : '#d1d5db',
      borderWidth: 1,
      callbacks: {
        title: (context: any) => {
          const label = context[0].label
          if (label === '現金') {
            return '現金'
          }
          const index = context[0].dataIndex
          const stockIndex = index - (context[0].chart.data.labels[0] === '現金' ? 1 : 0)
          const stock = portfolio.value[stockIndex]
          return `${stock?.symbol} - ${stock?.stockName || stock?.symbol}`
        },
        label: (context: any) => {
          const value = context.parsed
          const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `價值: NT$ ${value.toLocaleString()} (${percentage}%)`
        }
      }
    }
  }
}))

// 面積圖選項
const areaChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  scales: {
    x: {
      display: true,
      type: 'category' as const,
      title: {
        display: true,
        text: '時間',
        color: isDarkMode.value ? '#f8f8f2' : '#374151',
        font: {
          family: 'Noto Sans TC'
        }
      },
      ticks: {
        color: isDarkMode.value ? '#f8f8f2' : '#374151',
        font: {
          family: 'Noto Sans TC'
        },
        maxTicksLimit: 12
      },
      grid: {
        color: isDarkMode.value ? '#6272a4' : '#e5e7eb'
      }
    },
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      stacked: true,
      beginAtZero: true,
      title: {
        display: true,
        text: '價值 (NT$)',
        color: isDarkMode.value ? '#f8f8f2' : '#374151',
        font: {
          family: 'Noto Sans TC'
        }
      },
      ticks: {
        color: isDarkMode.value ? '#f8f8f2' : '#374151',
        font: {
          family: 'Noto Sans TC'
        },
        callback: function(value: any) {
          return 'NT$ ' + value.toLocaleString()
        }
      },
      grid: {
        color: isDarkMode.value ? '#6272a4' : '#e5e7eb'
      }
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        color: isDarkMode.value ? '#f8f8f2' : '#374151',
        font: {
          family: 'Noto Sans TC'
        },
        usePointStyle: true,
        pointStyle: 'circle',
        filter: (legendItem: any, chartData: any) => {
          // 只顯示有數據的項目
          const dataset = chartData.datasets[legendItem.datasetIndex]
          return dataset.data.some((value: number) => value > 0)
        }
      }
    },
    tooltip: {
      backgroundColor: isDarkMode.value ? '#44475a' : '#ffffff',
      titleColor: isDarkMode.value ? '#f8f8f2' : '#374151',
      bodyColor: isDarkMode.value ? '#f8f8f2' : '#374151',
      borderColor: isDarkMode.value ? '#6272a4' : '#d1d5db',
      borderWidth: 1,
      callbacks: {
        title: (context: any) => {
          return context[0].label
        },
        label: (context: any) => {
          const label = context.dataset.label || ''
          const value = context.parsed.y
          
          // 特殊處理現金的顯示
          if (label === '現金') {
            return `現金: NT$ ${value.toLocaleString()}`
          }
          
          // 處理股票價值為0的情況
          if (value === 0) {
            return `${label}: 未持有`
          }
          
          return `${label}: NT$ ${value.toLocaleString()}`
        },
        footer: (context: any) => {
          const total = context.reduce((sum: number, item: any) => sum + item.parsed.y, 0)
          return `總計: NT$ ${total.toLocaleString()}`
        }
      }
    }
  },
  elements: {
    line: {
      tension: 0.4
    },
    point: {
      radius: 0,
      hoverRadius: 6
    }
  }
}))

// 資產變化趨勢圖數據
const assetTrendChartData = computed(() => {
  checkTheme()
  
  // 生成連續的時間軸（按月）
  const months: string[] = []
  const now = new Date()
  for (let i = assetTimeRange.value - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(date.toISOString().split('T')[0]) // 使用 YYYY-MM-DD 格式
  }
  
  if (months.length === 0) return null
  
  // 為每個月份生成現金和投資數據
  const cashData = months.map(monthDate => {
    const monthDateObj = new Date(monthDate)
    
    // 先找該月份之前或當月的快照（向後找）
    const snapshotsBefore = assetHistory.value
      .filter(item => new Date(item.date) <= monthDateObj)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    if (snapshotsBefore.length > 0) {
      return snapshotsBefore[0].cash
    }
    
    // 沒有該月份之前的快照，找該月份之後的快照（向前找）
    const snapshotsAfter = assetHistory.value
      .filter(item => new Date(item.date) > monthDateObj)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    if (snapshotsAfter.length > 0) {
      return snapshotsAfter[0].cash
    }
    
    // 沒有任何快照，使用初始設定
    if (initialSetup.value.isCompleted) {
      return initialSetup.value.initialCash
    }
    
    return 0
  })
  
  const investmentData = months.map(monthDate => {
    const monthDateObj = new Date(monthDate)
    
    // 先找該月份之前或當月的快照（向後找）
    const snapshotsBefore = assetHistory.value
      .filter(item => new Date(item.date) <= monthDateObj)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    if (snapshotsBefore.length > 0) {
      return snapshotsBefore[0].investment
    }
    
    // 沒有該月份之前的快照，找該月份之後的快照（向前找）
    const snapshotsAfter = assetHistory.value
      .filter(item => new Date(item.date) > monthDateObj)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    if (snapshotsAfter.length > 0) {
      return snapshotsAfter[0].investment
    }
    
    // 沒有任何快照，投資為0
    return 0
  })
  
  return {
    labels: months.map(monthDate => {
      const date = new Date(monthDate)
      return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short' })
    }),
    datasets: [
      {
        label: '現金',
        data: cashData,
        borderColor: isDarkMode.value ? '#50fa7b' : '#10b981',
        backgroundColor: isDarkMode.value ? '#50fa7b40' : '#10b98140',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6
      },
      {
        label: '投資',
        data: investmentData,
        borderColor: isDarkMode.value ? '#ff79c6' : '#ec4899',
        backgroundColor: isDarkMode.value ? '#ff79c640' : '#ec489940',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6
      }
    ]
  }
})

// 資產變化趨勢圖選項
const assetTrendChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  scales: {
    x: {
      display: true,
      type: 'category' as const,
      title: {
        display: true,
        text: '日期',
        color: isDarkMode.value ? '#f8f8f2' : '#374151',
        font: {
          family: 'Noto Sans TC'
        }
      },
      ticks: {
        color: isDarkMode.value ? '#f8f8f2' : '#374151',
        font: {
          family: 'Noto Sans TC'
        },
        maxTicksLimit: 12
      },
      grid: {
        color: isDarkMode.value ? '#6272a4' : '#e5e7eb'
      }
    },
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      title: {
        display: true,
        text: '金額 (NT$)',
        color: isDarkMode.value ? '#f8f8f2' : '#374151',
        font: {
          family: 'Noto Sans TC'
        }
      },
      ticks: {
        color: isDarkMode.value ? '#f8f8f2' : '#374151',
        font: {
          family: 'Noto Sans TC'
        },
        callback: function(value: any) {
          return 'NT$ ' + value.toLocaleString()
        }
      },
      grid: {
        color: isDarkMode.value ? '#6272a4' : '#e5e7eb'
      }
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        color: isDarkMode.value ? '#f8f8f2' : '#374151',
        font: {
          family: 'Noto Sans TC'
        },
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      backgroundColor: isDarkMode.value ? '#44475a' : '#ffffff',
      titleColor: isDarkMode.value ? '#f8f8f2' : '#374151',
      bodyColor: isDarkMode.value ? '#f8f8f2' : '#374151',
      borderColor: isDarkMode.value ? '#6272a4' : '#d1d5db',
      borderWidth: 1,
      callbacks: {
        title: (context: any) => {
          return context[0].label
        },
        label: (context: any) => {
          const label = context.dataset.label || ''
          const value = context.parsed.y
          return `${label}: NT$ ${value.toLocaleString()}`
        },
        footer: (context: any) => {
          const total = context.reduce((sum: number, item: any) => sum + item.parsed.y, 0)
          return `總計: NT$ ${total.toLocaleString()}`
        }
      }
    }
  },
  elements: {
    line: {
      tension: 0.4
    },
    point: {
      radius: 3,
      hoverRadius: 6
    }
  }
}))

// 在 <script setup lang="ts"> 內加入 summary 計算
const totalValue = computed(() => {
  return portfolio.value.reduce((sum, stock) => sum + (stock.currentValue || 0), 0)
})
const totalCost = computed(() => {
  return portfolio.value.reduce((sum, stock) => sum + (stock.totalCost || 0), 0)
})
const totalReturnRate = computed(() => {
  if (totalCost.value === 0) return 0
  return ((totalValue.value - totalCost.value) / totalCost.value) * 100
})

// 包含現金的總資產計算
const totalAssets = computed(() => {
  const investmentValue = portfolio.value.reduce((sum, stock) => sum + (stock.currentValue || 0), 0)
  const cashValue = currentAssets.value?.cash || 0
  return investmentValue + cashValue
})

onMounted(async () => {
  // 檢查初始主題
  checkTheme()
  
  // 載入資產歷史
  await loadAssetHistory()
  
  // 初始化日期選擇器
  if (assetHistory.value && assetHistory.value.length > 0) {
    const sortedHistory = [...assetHistory.value].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    earliestDate.value = sortedHistory[0].date.split('T')[0]
    selectedDate.value = today // 預設選擇今天
  } else {
    earliestDate.value = today
    selectedDate.value = today
  }
  
  // 監聽主題變化
  if (typeof window !== 'undefined') {
    const observer = new MutationObserver(() => {
      checkTheme()
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
  }
  
  // 初始化交易資料
  await initialize()
  // 更新股價和股票名稱
  await Promise.all([
    updateStockPrices(),
    updateStockNames()
  ])
})
</script>