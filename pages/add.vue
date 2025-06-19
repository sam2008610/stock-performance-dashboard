<template>
  <div class="max-w-2xl mx-auto">
    <div class="shadow-xl rounded-2xl p-8 transition-all duration-500 backdrop-blur-sm" 
         :class="form.type === 'buy' ? 
           'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-900/20 dark:via-rose-900/20 dark:to-pink-900/20 border border-red-200/50 dark:border-red-700/50' : 
           'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-700/50'">
      
      <!-- 標題區域 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-all duration-300"
             :class="form.type === 'buy' ? 
               'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25' : 
               'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25'">
          <svg v-if="form.type === 'buy'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <svg v-else class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
          </svg>
        </div>
        <h2 class="text-3xl font-bold mb-2 transition-colors duration-300" 
            :class="form.type === 'buy' ? 
              'bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent' : 
              'bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent'">
          {{ form.type === 'buy' ? '資產買入' : '資產賣出' }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ form.type === 'buy' ? '建立您的投資部位' : '實現您的投資收益' }}
        </p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 交易類型選擇 -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            交易類型
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button type="button" 
                    @click="form.type = 'buy'; onTypeChange()"
                    class="relative px-4 py-3 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    :class="form.type === 'buy' ? 
                      'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 focus:ring-red-500 transform scale-105' : 
                      'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500'">
              <span class="flex items-center justify-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span>買入</span>
              </span>
            </button>
            <button type="button" 
                    @click="form.type = 'sell'; onTypeChange()"
                    class="relative px-4 py-3 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    :class="form.type === 'sell' ? 
                      'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 focus:ring-emerald-500 transform scale-105' : 
                      'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500'">
              <span class="flex items-center justify-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                </svg>
                <span>賣出</span>
              </span>
            </button>
          </div>
        </div>

        <!-- 資產類型選擇 -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            資產類型
          </label>
          <select 
            v-model="form.assetType"
            @change="onAssetTypeChange"
            class="block w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:ring-2 focus:ring-inset"
            :class="form.type === 'buy' ? 'focus:ring-red-500 dark:focus:ring-red-400' : 'focus:ring-emerald-500 dark:focus:ring-emerald-400'"
            required
          >
            <option value="tw_stock">台股</option>
            <option value="us_stock">美股</option>
            <option value="crypto">加密貨幣</option>
            <option value="bond">債券</option>
            <option value="financial_product">金融商品</option>
          </select>
        </div>

        <!-- 股票搜尋 -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            {{ getAssetLabel() }}搜尋
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input 
              type="text" 
              v-model="searchQuery"
              @input="onSearchInput"
              @focus="showSearchResults = true"
              @blur="handleSearchBlur"
              class="block w-full pl-12 pr-12 py-4 rounded-xl border-0 ring-1 ring-inset transition-all duration-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset"
              :class="[
                'bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100',
                form.type === 'buy' ? 
                  'ring-red-200 dark:ring-red-700 focus:ring-red-500 dark:focus:ring-red-400' : 
                  'ring-emerald-200 dark:ring-emerald-700 focus:ring-emerald-500 dark:focus:ring-emerald-400',
                {
                  'ring-red-300 dark:ring-red-600': symbolError,
                  'ring-green-300 dark:ring-green-600': symbolValid
                }
              ]"
              :placeholder="getAssetPlaceholder()"
              required
            >
            
            <!-- 狀態圖示 -->
            <div class="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div v-if="symbolChecking" class="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-red-600"></div>
              <div v-else-if="symbolValid" 
                   class="flex items-center justify-center w-6 h-6 rounded-full"
                   :class="form.type === 'buy' ? 'bg-red-100 dark:bg-red-900' : 'bg-emerald-100 dark:bg-emerald-900'">
                <svg class="w-4 h-4" :class="form.type === 'buy' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div v-else-if="symbolError" 
                   class="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900">
                <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
            
            <!-- 搜尋結果下拉選單 -->
            <div v-if="showSearchResults && searchResults.length > 0" 
                 class="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              <div v-for="(result, index) in searchResults" 
                   :key="`${result.symbol}-${index}`"
                   @click="selectStock(result)"
                   class="px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                       :class="form.type === 'buy' ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400'">
                    {{ result.symbol.slice(0, 2) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ result.symbol }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ result.name }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 狀態訊息 -->
          <div class="min-h-[1.5rem]">
            <p v-if="symbolError" class="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <span>找不到此{{ getAssetLabel() }}</span>
            </p>
            <p v-else-if="symbolValid" class="text-sm flex items-center space-x-1"
               :class="form.type === 'buy' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>{{ form.symbol }} - {{ stockName }}</span>
            </p>
            <p v-if="balanceError" class="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <span>{{ balanceErrorMessage }}</span>
            </p>
          </div>
        </div>

        <!-- 表單欄位網格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 交易日期 -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              交易日期
            </label>
            <input 
              type="date" 
              v-model="form.date"
              class="block w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:ring-2 focus:ring-inset"
              :class="form.type === 'buy' ? 'focus:ring-red-500 dark:focus:ring-red-400' : 'focus:ring-emerald-500 dark:focus:ring-emerald-400'"
              required
            >
          </div>

          <!-- 數量 -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              數量
              <span v-if="form.type === 'sell' && availableShares > 0" class="text-xs font-normal text-gray-500 dark:text-gray-400">
                (可賣出: {{ availableShares }} 股)
              </span>
            </label>
            <input 
              type="number" 
              v-model="form.quantity"
              @input="validateQuantity"
              class="block w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:ring-2 focus:ring-inset"
              :class="form.type === 'buy' ? 'focus:ring-red-500 dark:focus:ring-red-400' : 'focus:ring-emerald-500 dark:focus:ring-emerald-400'"
              min="1"
              :max="form.type === 'sell' ? availableShares : undefined"
              required
            >
          </div>

          <!-- 價格 -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              價格 ({{ getPriceCurrency() }})
            </label>
            <input 
              type="number" 
              v-model="form.price"
              class="block w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:ring-2 focus:ring-inset"
              :class="form.type === 'buy' ? 'focus:ring-red-500 dark:focus:ring-red-400' : 'focus:ring-emerald-500 dark:focus:ring-emerald-400'"
              min="0"
              step="0.01"
              required
            >
          </div>

          <!-- 手續費 -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              手續費 ({{ getPriceCurrency() }})
            </label>
            <input 
              type="number" 
              v-model="form.fee"
              class="block w-full px-4 py-3 rounded-xl border-0 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:ring-2 focus:ring-inset"
              :class="form.type === 'buy' ? 'focus:ring-red-500 dark:focus:ring-red-400' : 'focus:ring-emerald-500 dark:focus:ring-emerald-400'"
              min="0"
              step="0.01"
              required
            >
          </div>
        </div>

        <!-- 提交按鈕 -->
        <div class="pt-6">
          <button 
            type="submit"
            class="w-full px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            :class="form.type === 'buy' ? 
              'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:ring-red-500 shadow-lg shadow-red-500/25' : 
              'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 focus:ring-emerald-500 shadow-lg shadow-emerald-500/25'"
            :disabled="!canSubmit"
          >
            <span class="flex items-center justify-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="form.type === 'buy'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
              </svg>
              <span>{{ form.type === 'buy' ? '確認買入' : '確認賣出' }}</span>
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactions } from '~/composables/useTransactions'
import { useStockPrice } from '~/composables/useStockPrice'

const router = useRouter()
const { addTransaction, initialize, portfolio } = useTransactions()
const { getStockName } = useStockPrice()

// 表單資料
const form = ref({
  type: 'buy',
  assetType: 'tw_stock',
  symbol: '',
  date: new Date().toISOString().split('T')[0],
  quantity: 1,
  price: 0,
  fee: 0
})

// 搜尋相關狀態
const searchQuery = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)
const symbolChecking = ref(false)
const symbolValid = ref(false)
const symbolError = ref(false)
const stockName = ref('')

// 完整股票資料庫
const fullStockList = ref([])
const stockListLoaded = ref(false)

// 餘額檢查相關狀態
const balanceError = ref(false)
const balanceErrorMessage = ref('')
const availableShares = ref(0)

// 資產類型對應的搜尋清單
const assetSearchLists = {
  tw_stock: [
    { symbol: '2330', name: '台積電' },
    { symbol: '2454', name: '聯發科' },
    { symbol: '2317', name: '鴻海' },
    { symbol: '2412', name: '中華電' },
    { symbol: '2882', name: '國泰金' },
    { symbol: '2881', name: '富邦金' },
    { symbol: '2886', name: '兆豐金' },
    { symbol: '2891', name: '中信金' },
    { symbol: '2303', name: '聯電' },
    { symbol: '2002', name: '中鋼' },
    { symbol: '1301', name: '台塑' },
    { symbol: '1303', name: '南亞' },
    { symbol: '2207', name: '和泰車' },
    { symbol: '2408', name: '南亞科' },
    { symbol: '3008', name: '大立光' },
    { symbol: '8299', name: '群聯' },
    { symbol: '3293', name: '鈊象' },
    { symbol: '6488', name: '環球晶' },
    { symbol: '0050', name: '元大台灣50' },
    { symbol: '0056', name: '元大高股息' },
    { symbol: '00878', name: '國泰永續高股息' }
  ],
  us_stock: [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'NFLX', name: 'Netflix Inc.' }
  ],
  crypto: [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BNB', name: 'Binance Coin' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'DOT', name: 'Polkadot' }
  ],
  bond: [
    { symbol: 'TLT', name: '美國20年期公債ETF' },
    { symbol: 'IEF', name: '美國7-10年期公債ETF' },
    { symbol: 'SHY', name: '美國1-3年期公債ETF' }
  ],
  financial_product: [
    { symbol: 'VTI', name: 'Vanguard全股市ETF' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust' }
  ]
}

// 根據資產類型獲取標籤
const getAssetLabel = () => {
  const labels = {
    tw_stock: '股票',
    us_stock: '股票',
    crypto: '加密貨幣',
    bond: '債券',
    financial_product: '金融商品'
  }
  return labels[form.value.assetType] || '商品'
}

// 根據資產類型獲取佔位符文字
const getAssetPlaceholder = () => {
  const placeholders = {
    tw_stock: '輸入股票代碼或公司名稱，例如：2330 或 台積電',
    us_stock: '輸入股票代碼或公司名稱，例如：AAPL 或 Apple',
    crypto: '輸入加密貨幣代碼，例如：BTC 或 Bitcoin',
    bond: '輸入債券代碼或名稱',
    financial_product: '輸入金融商品代碼或名稱'
  }
  return placeholders[form.value.assetType] || '輸入商品代碼或名稱'
}

// 根據資產類型獲取價格貨幣單位
const getPriceCurrency = () => {
  const currencies = {
    tw_stock: 'NT$',
    us_stock: 'USD',
    crypto: 'USD',
    bond: 'USD',
    financial_product: 'USD'
  }
  return currencies[form.value.assetType] || 'NT$'
}

// 檢查是否可以提交表單
const canSubmit = computed(() => {
  if (form.value.assetType === 'tw_stock') {
    return symbolValid.value && !balanceError.value
  } else {
    // 對於非台股，只要有輸入代碼就可以提交
    return form.value.symbol.trim() !== '' && !balanceError.value
  }
})

// 計算可用股數
const updateAvailableShares = () => {
  if (form.value.type === 'sell' && form.value.symbol) {
    const stock = portfolio.value.find(p => p.symbol === form.value.symbol)
    availableShares.value = stock ? stock.quantity : 0
  } else {
    availableShares.value = 0
  }
}

// 搜尋股票
const onSearchInput = async () => {
  const query = searchQuery.value.trim()
  
  if (query.length < 1) {
    searchResults.value = []
    showSearchResults.value = false
    resetSymbolState()
    return
  }

  // 如果是台股，使用完整股票資料庫進行搜尋
  if (form.value.assetType === 'tw_stock') {
    console.log(`台股模式，輸入內容: "${query}"`)
    
    // 確保股票清單已載入
    await loadFullStockList()
    
    // 從完整股票資料庫中搜尋
    if (fullStockList.value.length > 0) {
      const results = fullStockList.value.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
        stock.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20) // 增加搜尋結果數量
      
      // 去除重複項目（以 symbol 為準）
      const uniqueResults = results.filter((stock, index, self) => 
        index === self.findIndex(s => s.symbol === stock.symbol)
      )
      
      searchResults.value = uniqueResults
      showSearchResults.value = uniqueResults.length > 0
      console.log(`從完整資料庫搜尋到 ${uniqueResults.length} 個結果`)
    } else {
      // 如果完整資料庫未載入，使用常用清單作為備用
      const searchList = assetSearchLists.tw_stock || []
      const results = searchList.filter(item => 
        item.symbol.toLowerCase().includes(query.toLowerCase()) || 
        item.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
      
      searchResults.value = results
      showSearchResults.value = results.length > 0
      console.log(`使用常用清單搜尋到 ${results.length} 個結果`)
    }
    
    // 檢查是否是純數字（股票代碼）
    if (/^\d+$/.test(query)) {
      console.log(`偵測到純數字股票代碼: ${query}`)
      await validateSymbol(query)
    } else {
      // 嘗試從輸入中提取數字（可能是 "2330 台積電" 這樣的格式）
      const extractedSymbol = query.match(/^\d+/)
      if (extractedSymbol) {
        console.log(`從輸入中提取股票代碼: ${extractedSymbol[0]}`)
        await validateSymbol(extractedSymbol[0])
      } else {
        // 如果不包含數字，重置狀態
        console.log(`輸入不包含數字，重置狀態`)
        resetSymbolState()
      }
    }
  } else {
    // 對於非台股，使用原有的搜尋邏輯
    const searchList = assetSearchLists[form.value.assetType] || []
    const results = searchList.filter(item => 
      item.symbol.toLowerCase().includes(query.toLowerCase()) || 
      item.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10)

    searchResults.value = results
    showSearchResults.value = results.length > 0

    // 對於非台股，直接設置為有效
    form.value.symbol = query.toUpperCase()
    stockName.value = query.toUpperCase()
    symbolValid.value = true
    symbolError.value = false
    updateAvailableShares()
  }
}

// 選擇股票
const selectStock = async (stock) => {
  form.value.symbol = stock.symbol
  searchQuery.value = `${stock.symbol} - ${stock.name}`
  showSearchResults.value = false
  
  if (form.value.assetType === 'tw_stock') {
    // 對於台股，使用 API 驗證以獲取最新資料
    await validateSymbol(stock.symbol)
  } else {
    // 對於非台股，直接使用提供的資料
    stockName.value = stock.name
    symbolValid.value = true
    symbolError.value = false
    form.value.symbol = stock.symbol
  }
  
  // 更新可用股數
  updateAvailableShares()
  
  // 驗證餘額
  validateQuantity()
}

// 載入完整股票清單
const loadFullStockList = async () => {
  if (stockListLoaded.value) return
  
  try {
    console.log('載入完整股票清單...')
    const response = await fetch('/api/stock-list')
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data) {
        fullStockList.value = data.data
        stockListLoaded.value = true
        console.log(`成功載入 ${data.count} 支股票清單`)
      }
    }
  } catch (error) {
    console.error('載入股票清單失敗:', error)
  }
}

// 重置符號狀態
const resetSymbolState = () => {
  symbolValid.value = false
  symbolError.value = false
  stockName.value = ''
  form.value.symbol = ''
}

// 驗證股票代碼（僅限台股）
const validateSymbol = async (symbol) => {
  if (!symbol || form.value.assetType !== 'tw_stock') {
    resetSymbolState()
    return
  }

  console.log(`開始驗證股票代碼: ${symbol}`)
  symbolChecking.value = true
  symbolValid.value = false
  symbolError.value = false
  stockName.value = ''

  try {
    // 確保股票清單已載入
    await loadFullStockList()
    
    // 首先檢查是否在完整股票資料庫中
    const foundStock = fullStockList.value.find(stock => stock.symbol === symbol)
    if (foundStock) {
      console.log(`從完整資料庫找到股票: ${symbol} - ${foundStock.name}`)
      stockName.value = foundStock.name
      symbolValid.value = true
      form.value.symbol = symbol
      updateAvailableShares()
      symbolChecking.value = false
      return
    }

    // 如果不在資料庫中，檢查是否在常用清單中（向後相容）
    const knownStock = assetSearchLists.tw_stock.find(stock => stock.symbol === symbol)
    if (knownStock) {
      console.log(`從常用清單找到股票: ${symbol} - ${knownStock.name}`)
      stockName.value = knownStock.name
      symbolValid.value = true
      form.value.symbol = symbol
      updateAvailableShares()
      symbolChecking.value = false
      return
    }

    // 最後嘗試調用 API 驗證（可能是新上市股票）
    console.log(`資料庫中找不到，調用 API 驗證股票: ${symbol}`)
    const response = await fetch(`/api/stock?symbol=${symbol}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`API 回應資料:`, data)
      
      // 檢查是否有有效的股票資料
      if (data && data.symbol) {
        stockName.value = data.name || `股票代碼 ${symbol}`
        symbolValid.value = true
        form.value.symbol = symbol
        updateAvailableShares()
        console.log(`股票 ${symbol} 驗證成功:`, data)
      } else {
        console.log(`股票 ${symbol} 驗證失敗: 無有效資料`)
        symbolError.value = true
      }
    } else {
      console.log(`API 請求失敗，狀態碼: ${response.status}`)
      // 如果 API 失敗，但輸入看起來像股票代碼，就允許通過
      if (/^\d{4}$/.test(symbol)) {
        console.log(`允許 4 位數股票代碼通過: ${symbol}`)
        stockName.value = `股票代碼 ${symbol}`
        symbolValid.value = true
        form.value.symbol = symbol
        updateAvailableShares()
      } else {
        symbolError.value = true
      }
    }
  } catch (error) {
    console.error('驗證股票代碼時發生錯誤:', error)
    // 如果網路錯誤，但輸入看起來像股票代碼，就允許通過
    if (/^\d{4}$/.test(symbol)) {
      console.log(`網路錯誤，但允許 4 位數股票代碼通過: ${symbol}`)
      stockName.value = `股票代碼 ${symbol}`
      symbolValid.value = true
      form.value.symbol = symbol
      updateAvailableShares()
    } else {
      symbolError.value = true
    }
  } finally {
    symbolChecking.value = false
  }
}

// 驗證數量
const validateQuantity = () => {
  if (form.value.type === 'sell' && form.value.symbol) {
    const quantity = parseInt(form.value.quantity) || 0
    
    if (quantity > availableShares.value) {
      balanceError.value = true
      balanceErrorMessage.value = `數量超過可賣出股數 (${availableShares.value} 股)`
    } else if (quantity <= 0) {
      balanceError.value = true
      balanceErrorMessage.value = '數量必須大於 0'
    } else {
      balanceError.value = false
      balanceErrorMessage.value = ''
    }
  } else {
    balanceError.value = false
    balanceErrorMessage.value = ''
  }
}

// 交易類型改變時的處理
const onTypeChange = () => {
  // 重置表單狀態
  balanceError.value = false
  balanceErrorMessage.value = ''
  
  // 更新可用股數
  updateAvailableShares()
  
  // 重新驗證數量
  if (form.value.type === 'sell') {
    validateQuantity()
  }
}

// 資產類型改變時的處理
const onAssetTypeChange = () => {
  // 重置搜尋相關狀態
  searchQuery.value = ''
  searchResults.value = []
  showSearchResults.value = false
  resetSymbolState()
  
  // 重置餘額檢查
  balanceError.value = false
  balanceErrorMessage.value = ''
  availableShares.value = 0
}

// 處理搜尋框失焦
const handleSearchBlur = () => {
  // 延遲關閉搜尋結果，讓點擊事件能正常觸發
  setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

// 處理表單提交
const handleSubmit = async () => {
  if (!canSubmit.value) return

  const total = form.value.quantity * form.value.price + form.value.fee
  await addTransaction({
    type: form.value.type,
    assetType: form.value.assetType,
    symbol: form.value.symbol.trim(),
    date: form.value.date,
    quantity: parseInt(form.value.quantity),
    price: parseFloat(form.value.price),
    fee: parseFloat(form.value.fee),
    total: total,
    stockName: stockName.value || form.value.symbol.trim()
  })

  // 重置表單
  form.value = {
    type: 'buy',
    assetType: 'tw_stock',
    symbol: '',
    date: new Date().toISOString().split('T')[0],
    quantity: 1,
    price: 0,
    fee: 0
  }
  searchQuery.value = ''
  resetSymbolState()
  balanceError.value = false
  balanceErrorMessage.value = ''
  availableShares.value = 0

  // 導航到交易記錄頁面
  router.push('/transactions')
}

onMounted(async () => {
  await initialize()
  // 預先載入股票清單
  loadFullStockList()
})
</script> 