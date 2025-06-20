<template>
  <div class="max-w-4xl mx-auto px-4 py-10">
    <div class="rounded-2xl shadow-xl bg-white/80 dark:bg-[#23272f]/80 backdrop-blur p-8">
      <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8 text-center">
        設定
      </h1>
      
      <div class="max-w-2xl mx-auto space-y-8">
        <!-- 現金餘額修正 -->
        <div class="rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 border border-green-200 dark:border-green-700">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
            現金餘額修正
          </h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                當前現金餘額
              </label>
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                NT$ {{ currentAssets?.cash?.toLocaleString() || '0' }}
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                修正後的現金餘額
              </label>
              <input
                v-model.number="correctedCash"
                type="number"
                placeholder="請輸入正確的現金餘額"
                class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-[#6272a4] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
            </div>
            
            <div v-if="cashDifference !== 0" class="p-3 rounded-lg" :class="cashDifference > 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'">
              <div class="text-sm font-medium" :class="cashDifference > 0 ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'">
                差異: {{ cashDifference > 0 ? '+' : '' }}NT$ {{ cashDifference.toLocaleString() }}
              </div>
            </div>
            
            <button
              @click="updateCashBalance"
              :disabled="!canUpdateCash"
              class="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              更新現金餘額
            </button>
          </div>
        </div>

        <!-- 資產歷史重建 -->
        <div class="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 border border-blue-200 dark:border-blue-700">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582M20 20v-5h-.581M5 9A7 7 0 0112 5a7 7 0 017 7v3m-7 7a7 7 0 01-7-7v-3m7 7a7 7 0 007-7"/>
            </svg>
            資產歷史重建
          </h2>
          
          <div class="space-y-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              根據交易記錄和目前現金餘額，反推計算歷史資產變化。這將使用最新的現金餘額往回推算每次交易前的現金狀況。
            </p>
            
            <button
              @click="rebuildAssetHistory"
              :disabled="isRebuilding"
              class="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isRebuilding ? '重建中...' : '重建資產歷史' }}
            </button>
          </div>
        </div>

        <!-- 初始設定 -->
        <div class="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 border border-purple-200 dark:border-purple-700">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            初始設定
          </h2>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  目前現金餘額
                </label>
                <div class="text-lg font-semibold text-gray-900 dark:text-white">
                  NT$ {{ initialSetup?.initialCash?.toLocaleString() || '0' }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  開始日期
                </label>
                <div class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ initialSetup?.startDate || '未設定' }}
                </div>
              </div>
            </div>
            
            <button
              @click="resetInitialSetup"
              class="w-full px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
            >
              重新設定初始值
            </button>
          </div>
        </div>

        <!-- 資產歷史統計 -->
        <div class="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 border border-orange-200 dark:border-orange-700">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            資產歷史統計
          </h2>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  歷史記錄數
                </label>
                <div class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ assetHistory.length }} 筆
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  追蹤天數
                </label>
                <div class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ trackingDays }} 天
                </div>
              </div>
            </div>
            
            <div v-if="assetHistory.length > 0" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">資產變化範圍</div>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500 dark:text-gray-400">最低:</span>
                  <span class="font-semibold text-gray-900 dark:text-white ml-1">
                    NT$ {{ minTotal.toLocaleString() }}
                  </span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">最高:</span>
                  <span class="font-semibold text-gray-900 dark:text-white ml-1">
                    NT$ {{ maxTotal.toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 返回按鈕 -->
        <div class="text-center">
          <NuxtLink 
            to="/"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            返回首頁
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAssetHistory } from '~/composables/useAssetHistory'
import { useTransactions } from '~/composables/useTransactions'

const router = useRouter()
const { 
  currentAssets, 
  initialSetup, 
  loadAssetHistory, 
  updateCashBalance: updateCash,
  rebuildAssetHistory: rebuildHistory,
  resetInitialSetup: resetSetup,
  assetHistory,
  trackingDays,
  minTotal,
  maxTotal
} = useAssetHistory()

const { transactions } = useTransactions()

const correctedCash = ref(0)
const isRebuilding = ref(false)

// 計算現金差異
const cashDifference = computed(() => {
  const current = currentAssets.value?.cash || 0
  return correctedCash.value - current
})

// 檢查是否可以更新現金
const canUpdateCash = computed(() => {
  return correctedCash.value > 0 && cashDifference.value !== 0
})

// 更新現金餘額
const updateCashBalance = () => {
  if (!canUpdateCash.value) return
  
  const difference = cashDifference.value
  const message = difference > 0 
    ? `確定要增加現金餘額 NT$ ${difference.toLocaleString()} 嗎？`
    : `確定要減少現金餘額 NT$ ${Math.abs(difference).toLocaleString()} 嗎？`
  
  if (confirm(message)) {
    updateCash(correctedCash.value)
    correctedCash.value = 0
    
    // 顯示成功訊息
    alert('現金餘額已更新！')
  }
}

// 重建資產歷史
const rebuildAssetHistory = async () => {
  if (isRebuilding.value) return
  
  if (!confirm('確定要重建資產歷史嗎？這將根據交易記錄重新計算所有歷史資產快照。')) {
    return
  }
  
  isRebuilding.value = true
  try {
    await rebuildHistory()
    alert('資產歷史重建完成！')
  } catch (error) {
    console.error('重建資產歷史失敗:', error)
    alert('重建失敗，請稍後再試')
  } finally {
    isRebuilding.value = false
  }
}

// 重新設定初始值
const resetInitialSetup = () => {
  if (confirm('確定要重新設定初始值嗎？這將清除所有資產歷史記錄。')) {
    resetSetup()
    router.push('/setup')
  }
}

onMounted(() => {
  loadAssetHistory()
  correctedCash.value = currentAssets.value?.cash || 0
})
</script> 