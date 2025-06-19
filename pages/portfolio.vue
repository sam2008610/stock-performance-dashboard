<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-[#44475a] shadow rounded-lg p-6 transition-colors duration-200">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-[#f8f8f2]">投資組合</h2>
        <button 
          @click="clearCacheAndRefresh"
          :disabled="isClearing"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50"
        >
          {{ isClearing ? '清除中...' : '清除快取' }}
        </button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-[#6272a4]">
          <thead class="bg-gray-50 dark:bg-[#6272a4]/30">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">股票代碼</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">股票名稱</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">持有數量</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">平均成本</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">當前價格</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">總成本</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">當前價值</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">報酬率</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-[#44475a] divide-y divide-gray-200 dark:divide-[#6272a4]">
            <tr v-for="stock in portfolio" :key="stock.symbol" class="hover:bg-gray-50 dark:hover:bg-[#6272a4]/20 transition-colors duration-200">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">{{ stock.symbol }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">{{ stock.stockName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">{{ stock.quantity }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">NT$ {{ stock.avgCost.toFixed(2) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">NT$ {{ stock.currentPrice.toFixed(2) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">NT$ {{ stock.totalCost.toLocaleString() }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">NT$ {{ stock.currentValue.toLocaleString() }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm" :class="stock.returnRate >= 0 ? 'text-green-600 dark:text-[#50fa7b]' : 'text-red-600 dark:text-[#ff5555]'">
                {{ stock.returnRate.toFixed(2) }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="bg-white dark:bg-[#44475a] shadow rounded-lg p-6 transition-colors duration-200">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-[#f8f8f2]">資產配置</h2>
        <div class="flex bg-gray-100 dark:bg-[#6272a4]/30 rounded-lg p-1">
          <button
            @click="chartType = 'pie'"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
              chartType === 'pie' 
                ? 'bg-white dark:bg-[#bd93f9] text-gray-900 dark:text-[#282a36] shadow-sm' 
                : 'text-gray-600 dark:text-[#f8f8f2] hover:text-gray-900 dark:hover:text-[#bd93f9]'
            ]"
          >
            圓餅圖
          </button>
          <button
            @click="chartType = 'area'"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
              chartType === 'area' 
                ? 'bg-white dark:bg-[#bd93f9] text-gray-900 dark:text-[#282a36] shadow-sm' 
                : 'text-gray-600 dark:text-[#f8f8f2] hover:text-gray-900 dark:hover:text-[#bd93f9]'
            ]"
          >
            面積圖
          </button>
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

const { portfolio, transactions, initialize, updateStockPrices, updateStockNames } = useTransactions()
const { clearCache } = useStockPrice()

// 圖表類型切換
const chartType = ref<'pie' | 'area'>('pie')

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

// 圓餅圖數據
const pieChartData = computed(() => {
  checkTheme() // 每次計算時檢查主題
  return {
    labels: portfolio.value.map(stock => stock.stockName || stock.symbol),
    datasets: [{
      data: portfolio.value.map(stock => stock.currentValue),
      backgroundColor: generateColors(portfolio.value.length),
      borderWidth: 2,
      borderColor: isDarkMode.value ? '#44475a' : '#e5e7eb' // 根據主題調整邊框顏色
    }]
  }
})

// 面積圖數據
const areaChartData = computed(() => {
  checkTheme()
  
  // 生成時間序列數據（模擬歷史數據）
  const months: string[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short' }))
  }
  
  const colors = generateColors(portfolio.value.length)
  const datasets = portfolio.value.map((stock, index) => {
    // 生成模擬的歷史價值數據
    const baseValue = stock.currentValue
    const data = months.map((_, monthIndex) => {
      // 模擬價值變化（隨機波動但總體向上趨勢）
      const progress = monthIndex / (months.length - 1)
      const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
      const trendFactor = 0.7 + progress * 0.3 // 從 0.7 到 1.0 的趨勢
      return Math.round(baseValue * trendFactor * randomFactor)
    })
    
    return {
      label: stock.stockName || stock.symbol,
      data: data,
      borderColor: colors[index],
      backgroundColor: colors[index] + '40', // 添加透明度
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 6
    }
  })
  
  return {
    labels: months,
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
              const stock = portfolio.value[index]
              const value = data.datasets[0].data[index]
              const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              
              return {
                text: `${stock.stockName || stock.symbol} (${percentage}%)`,
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
          const index = context[0].dataIndex
          const stock = portfolio.value[index]
          return `${stock.symbol} - ${stock.stockName || stock.symbol}`
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
        }
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
      radius: 0,
      hoverRadius: 6
    }
  }
}))

onMounted(async () => {
  // 檢查初始主題
  checkTheme()
  
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