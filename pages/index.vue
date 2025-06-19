<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-[#44475a] shadow rounded-lg p-6 transition-colors duration-200">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-[#f8f8f2]">投資概覽</h2>
        <button 
          @click="clearCacheAndRefresh"
          :disabled="isClearing"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50"
        >
          {{ isClearing ? '清除中...' : '清除快取' }}
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 dark:bg-[#6272a4]/20 p-4 rounded-lg transition-colors duration-200">
          <h3 class="text-lg font-medium text-blue-900 dark:text-[#8be9fd]">總投資金額</h3>
          <p class="text-3xl font-bold text-blue-700 dark:text-[#8be9fd]">NT$ {{ totalInvestment.toLocaleString() }}</p>
        </div>
        <div class="bg-green-50 dark:bg-[#50fa7b]/20 p-4 rounded-lg transition-colors duration-200">
          <h3 class="text-lg font-medium text-green-900 dark:text-[#50fa7b]">當前價值</h3>
          <p class="text-3xl font-bold text-green-700 dark:text-[#50fa7b]">NT$ {{ currentValue.toLocaleString() }}</p>
        </div>
        <div class="bg-purple-50 dark:bg-[#bd93f9]/20 p-4 rounded-lg transition-colors duration-200">
          <h3 class="text-lg font-medium text-purple-900 dark:text-[#bd93f9]">總報酬率</h3>
          <p class="text-3xl font-bold" :class="totalReturnRate >= 0 ? 'text-green-700 dark:text-[#50fa7b]' : 'text-red-700 dark:text-[#ff5555]'">
            {{ totalReturnRate.toFixed(2) }}%
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-[#44475a] shadow rounded-lg p-6 transition-colors duration-200">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-[#f8f8f2] mb-4">最近交易</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-[#6272a4]">
          <thead class="bg-gray-50 dark:bg-[#6272a4]/30">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">日期</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">股票代碼</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">公司名稱</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">類型</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">數量</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">價格</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">總額</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-[#44475a] divide-y divide-gray-200 dark:divide-[#6272a4]">
            <tr v-for="transaction in recentTransactions" :key="transaction.id" class="hover:bg-gray-50 dark:hover:bg-[#6272a4]/20 transition-colors duration-200">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">{{ transaction.date }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">{{ transaction.symbol }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">{{ transaction.stockName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">
                <span :class="transaction.type === 'buy' ? 'text-green-600 dark:text-[#50fa7b]' : 'text-red-600 dark:text-[#ff5555]'">
                  {{ transaction.type === 'buy' ? '買入' : '賣出' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">{{ transaction.quantity }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">NT$ {{ transaction.price }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">NT$ {{ transaction.total.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTransactions } from '~/composables/useTransactions'
import { useStockPrice } from '~/composables/useStockPrice'

const { 
  totalInvestment, 
  currentValue, 
  totalReturnRate, 
  recentTransactions, 
  initialize,
  updateStockPrices
} = useTransactions()

const { clearCache } = useStockPrice()

const isClearing = ref(false)

const clearCacheAndRefresh = async () => {
  isClearing.value = true
  try {
    // 清除快取
    await clearCache()
    
    // 重新初始化和更新股價
    await initialize()
    await updateStockPrices()
    
    // 顯示成功訊息
    console.log('快取已清除並重新載入股價資料')
  } catch (error) {
    console.error('清除快取時發生錯誤:', error)
  } finally {
    isClearing.value = false
  }
}

onMounted(async () => {
  // 初始化交易資料
  await initialize()
  // 更新股價
  await updateStockPrices()
})
</script> 