<template>
  <div class="max-w-7xl mx-auto px-4 py-10 space-y-8">
    <!-- 股票基本資料卡片 -->
    <div class="rounded-2xl shadow-xl bg-white/80 dark:bg-[#23272f]/80 backdrop-blur p-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center text-white text-2xl font-bold">
            <span v-text="stockInfo.symbol?.slice(0, 2) || 'ST'"></span>
          </div>
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              <span v-text="stockInfo.symbol"></span>
            </h1>
            <p class="text-lg text-gray-600 dark:text-gray-400">
              <span v-text="stockInfo.name || '載入中...'"></span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatCurrency(stockInfo.price || 0, stockInfo.assetType || 'tw_stock') }}
            </div>
            <div class="text-sm" :class="stockInfo.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
              {{ stockInfo.changePercent >= 0 ? '+' : '' }}{{ stockInfo.changePercent?.toFixed(2) || 0 }}%
            </div>
          </div>
          <NuxtLink to="/portfolio" class="px-4 py-2 bg-gray-100 dark:bg-[#282a36] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#44475a] transition-colors">
            返回投資組合
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 備註功能 -->
    <div class="rounded-2xl shadow-xl bg-white/80 dark:bg-[#23272f]/80 backdrop-blur p-8">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        自訂標籤
      </h2>
      <div class="space-y-4">
        <!-- 標籤管理 -->
        <div class="flex items-center gap-2 mb-4">
          <input
            v-model="newTagInput"
            @keyup.enter="addCustomTag"
            type="text"
            placeholder="新增自訂標籤..."
            class="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#6272a4] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
          >
          <button
            @click="addCustomTag"
            class="px-3 py-1.5 bg-[#8b5cf6] text-white rounded-lg hover:bg-[#7c3aed] transition-colors text-sm"
          >
            新增
          </button>
        </div>
        
        <!-- 自訂標籤顯示 -->
        <div v-if="customTags.length > 0">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">我的標籤</div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="tag in customTags"
              :key="tag"
              class="px-3 py-1 bg-[#8b5cf6]/10 dark:bg-[#8b5cf6]/20 text-[#8b5cf6] dark:text-[#bd93f9] rounded-full text-sm hover:bg-[#8b5cf6]/20 dark:hover:bg-[#8b5cf6]/30 transition-colors flex items-center gap-1"
            >
              <span v-text="tag"></span>
              <button
                @click.stop="removeCustomTag(tag)"
                class="w-4 h-4 rounded-full bg-[#8b5cf6] text-white text-xs hover:bg-[#7c3aed] transition-colors flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 交易記錄 -->
    <div class="rounded-2xl shadow-xl bg-white/80 dark:bg-[#23272f]/80 backdrop-blur p-8">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        交易記錄
      </h2>
      <div class="overflow-x-auto rounded-xl border border-gray-100 dark:border-[#6272a4] bg-white/70 dark:bg-[#23272f]/70">
        <table class="min-w-full text-sm text-left">
          <thead class="bg-gradient-to-r from-[#f3f4f6] to-[#e0e7ef] dark:from-[#23272f] dark:to-[#23272f]">
            <tr>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">日期</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">類型</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">數量</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">價格</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">手續費</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">總金額</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in stockTransactions" :key="transaction.id" class="hover:bg-[#f3f4f6] dark:hover:bg-[#282a36] transition">
              <td class="px-6 py-4 text-gray-900 dark:text-[#f8f8f2]">{{ formatDate(transaction.date) }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="transaction.type === 'buy' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'">
                  {{ transaction.type === 'buy' ? '買入' : '賣出' }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-900 dark:text-[#f8f8f2]">{{ transaction.quantity }}</td>
              <td class="px-6 py-4 text-gray-900 dark:text-[#f8f8f2]">{{ formatCurrency(transaction.price, transaction.assetType) }}</td>
              <td class="px-6 py-4 text-gray-900 dark:text-[#f8f8f2]">{{ formatCurrency(transaction.fee, transaction.assetType) }}</td>
              <td class="px-6 py-4 text-gray-900 dark:text-[#f8f8f2]">{{ formatCurrency(transaction.total, transaction.assetType) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTransactions } from '~/composables/useTransactions'
import { useStockPrice } from '~/composables/useStockPrice'

const route = useRoute()
const { transactions, portfolio } = useTransactions()
const { getStockPrice } = useStockPrice()

// 股票代碼
const symbol = computed(() => route.params.symbol as string)

// 股票基本資料
const stockInfo = ref({
  symbol: '',
  name: '',
  price: 0,
  changePercent: 0,
  assetType: 'tw_stock' as string
})

// 持股資訊
const stockPortfolio = computed(() => {
  return portfolio.value.find(stock => stock.symbol === symbol.value)
})

// 該股票的交易記錄
const stockTransactions = computed(() => {
  return transactions.value
    .filter(t => t.symbol === symbol.value)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// 快速備註相關
const quickNoteInput = ref('')

// 詳細備註相關
const detailedNote = ref('')
const lastUpdated = ref('')

// 自訂標籤相關
const newTagInput = ref('')
const customTags = ref<string[]>([])

// 格式化貨幣
const formatCurrency = (amount: number, assetType: string) => {
  const currencies: Record<string, string> = {
    tw_stock: 'NT$',
    us_stock: 'USD',
    crypto: 'USD',
    bond: 'USD',
    financial_product: 'USD'
  }
  const currency = currencies[assetType] || 'NT$'
  return `${currency} ${amount.toLocaleString()}`
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 新增自訂標籤
const addCustomTag = () => {
  if (!newTagInput.value.trim()) return
  
  const tag = newTagInput.value.trim()
  if (!customTags.value.includes(tag)) {
    customTags.value.push(tag)
    saveCustomTags()
  }
  newTagInput.value = ''
}

// 移除自訂標籤
const removeCustomTag = (tag: string) => {
  customTags.value = customTags.value.filter(t => t !== tag)
  saveCustomTags()
}

// 儲存自訂標籤
const saveCustomTags = () => {
  try {
    localStorage.setItem(`custom_tags_${symbol.value}`, JSON.stringify(customTags.value))
  } catch (error) {
    console.error('儲存自訂標籤失敗:', error)
  }
}

// 載入自訂標籤
const loadCustomTags = () => {
  try {
    const stored = localStorage.getItem(`custom_tags_${symbol.value}`)
    if (stored) {
      customTags.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('載入自訂標籤失敗:', error)
    customTags.value = []
  }
}

// 載入股票資料
const loadStockData = async () => {
  try {
    const stockData = await getStockPrice(symbol.value)
    if (stockData) {
      stockInfo.value = {
        symbol: symbol.value,
        name: stockData.name || symbol.value,
        price: stockData.price || 0,
        changePercent: stockData.changePercent || 0,
        assetType: stockPortfolio.value?.assetType || 'tw_stock'
      }
    }
  } catch (error) {
    console.error('載入股票資料失敗:', error)
  }
}

onMounted(async () => {
  await loadStockData()
  loadCustomTags()
})
</script> 