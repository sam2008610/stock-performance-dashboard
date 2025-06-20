<template>
  <div class="max-w-7xl mx-auto px-4 py-10 grid gap-10">
    <!-- 概覽卡片 -->
    <div class="rounded-2xl shadow-xl bg-white/80 dark:bg-[#23272f]/80 backdrop-blur p-8 mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <span class="inline-block w-2 h-8 bg-gradient-to-b from-[#8b5cf6] to-[#06b6d4] rounded-full mr-2"></span>
          投資概覽
        </h2>
        <button 
          @click="clearCacheAndRefresh"
          :disabled="isClearing"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white font-semibold shadow-lg hover:from-[#7c3aed] hover:to-[#0ea5e9] transition disabled:opacity-50"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5 9A7 7 0 0112 5a7 7 0 017 7v3m-7 7a7 7 0 01-7-7v-3m7 7a7 7 0 007-7"/></svg>
          {{ isClearing ? '清除中...' : '清除快取' }}
        </button>
        <NuxtLink 
          to="/settings"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-white font-semibold shadow-lg hover:from-[#059669] hover:to-[#0ea5e9] transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          設定
        </NuxtLink>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="rounded-xl bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10 p-6 flex flex-col items-start shadow">
          <h3 class="text-lg font-semibold text-[#8b5cf6] mb-2">總資產</h3>
          <p class="text-3xl font-extrabold text-gray-900 dark:text-[#8be9fd]">NT$ {{ (totalInvestment + (currentAssets?.cash || 0)).toLocaleString() }}</p>
        </div>
        <div class="rounded-xl bg-gradient-to-br from-[#50fa7b]/10 to-[#06b6d4]/10 p-6 flex flex-col items-start shadow">
          <h3 class="text-lg font-semibold text-[#10b981] mb-2">當前價值</h3>
          <p class="text-3xl font-extrabold text-gray-900 dark:text-[#50fa7b]">NT$ {{ currentValue.toLocaleString() }}</p>
        </div>
        <div class="rounded-xl bg-gradient-to-br from-[#bd93f9]/10 to-[#ff79c6]/10 p-6 flex flex-col items-start shadow">
          <h3 class="text-lg font-semibold text-[#bd93f9] mb-2">總報酬率</h3>
          <p class="text-3xl font-extrabold" :class="totalReturnRate >= 0 ? 'text-green-700 dark:text-[#50fa7b]' : 'text-red-700 dark:text-[#ff5555]'">
            {{ totalReturnRate.toFixed(2) }}%
          </p>
        </div>
      </div>
      
      <!-- 現金餘額卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div class="rounded-xl bg-gradient-to-br from-[#50fa7b]/10 to-[#ff79c6]/10 p-6 flex flex-col items-start shadow">
          <h3 class="text-lg font-semibold text-[#50fa7b] mb-2">現金餘額</h3>
          <p class="text-3xl font-extrabold text-gray-900 dark:text-[#50fa7b]">NT$ {{ currentAssets?.cash?.toLocaleString() || '0' }}</p>
        </div>
        <div class="rounded-xl bg-gradient-to-br from-[#ff79c6]/10 to-[#50fa7b]/10 p-6 flex flex-col items-start shadow">
          <h3 class="text-lg font-semibold text-[#ff79c6] mb-2">總資產</h3>
          <p class="text-3xl font-extrabold text-gray-900 dark:text-[#ff79c6]">NT$ {{ (currentAssets?.total || 0).toLocaleString() }}</p>
        </div>
      </div>
    </div>

    <!-- 最近交易卡片 -->
    <div class="rounded-2xl shadow-xl bg-white/80 dark:bg-[#23272f]/80 backdrop-blur p-8">
      <h2 class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <span class="inline-block w-2 h-8 bg-gradient-to-b from-[#06b6d4] to-[#8b5cf6] rounded-full mr-2"></span>
        最近交易
      </h2>
      <div class="overflow-x-auto rounded-xl border border-gray-100 dark:border-[#6272a4] bg-white/70 dark:bg-[#23272f]/70">
        <table class="min-w-full text-sm text-left">
          <thead class="bg-gradient-to-r from-[#f3f4f6] to-[#e0e7ef] dark:from-[#23272f] dark:to-[#23272f]">
            <tr>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">日期</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">股票代碼</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">公司名稱</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">類型</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">數量</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">價格</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">總額</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in recentTransactions" :key="transaction.id" class="hover:bg-[#f3f4f6] dark:hover:bg-[#282a36] transition">
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]">{{ transaction.date }}</td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]">{{ transaction.symbol }}</td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]">{{ transaction.stockName }}</td>
              <td class="px-6 py-4">
                <span :class="transaction.type === 'buy' ? 'text-green-600 dark:text-[#50fa7b]' : 'text-red-600 dark:text-[#ff5555]'">
                  {{ transaction.type === 'buy' ? '買入' : '賣出' }}
                </span>
              </td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]">{{ transaction.quantity }}</td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]">NT$ {{ transaction.price }}</td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]">NT$ {{ transaction.total.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactions } from '~/composables/useTransactions'
import { useStockPrice } from '~/composables/useStockPrice'
import { useAssetHistory } from '~/composables/useAssetHistory'

const router = useRouter()
const { 
  totalInvestment, 
  currentValue, 
  totalReturnRate, 
  recentTransactions, 
  initialize,
  updateStockPrices
} = useTransactions()

const { clearCache } = useStockPrice()
const { initialSetup, loadAssetHistory, currentAssets, addAssetSnapshot } = useAssetHistory()

const isClearing = ref(false)

// 檢查是否需要初始設定
onMounted(async () => {
  loadAssetHistory()
  
  // 如果還沒完成初始設定，導向設定頁面
  if (!initialSetup.value.isCompleted) {
    router.push('/setup')
    return
  }
  
  // 初始化交易資料
  await initialize()
  // 更新股價
  await updateStockPrices()
  
  // 更新資產快照
  updateAssetSnapshot()
})

// 更新資產快照
const updateAssetSnapshot = () => {
  if (currentAssets.value) {
    const currentCash = currentAssets.value.cash
    const currentInvestment = currentValue.value
    addAssetSnapshot(currentCash, currentInvestment, '自動更新')
  }
}

const clearCacheAndRefresh = async () => {
  isClearing.value = true
  try {
    // 清除快取
    await clearCache()
    
    // 重新初始化和更新股價
    await initialize()
    await updateStockPrices()
    
    // 更新資產快照
    updateAssetSnapshot()
    
    // 顯示成功訊息
    console.log('快取已清除並重新載入股價資料')
  } catch (error) {
    console.error('清除快取時發生錯誤:', error)
  } finally {
    isClearing.value = false
  }
}
</script>