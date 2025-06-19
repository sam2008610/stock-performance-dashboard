<!-- Create a new transactions page with listing and deletion functionality -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-[#f8f8f2]">交易記錄</h1>
    
    <!-- Transaction Table -->
    <div class="overflow-x-auto bg-white dark:bg-[#44475a] rounded-lg shadow transition-colors duration-200">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-[#6272a4]">
        <thead class="bg-gray-50 dark:bg-[#6272a4]/30">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">日期</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">資產類型</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">代碼</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">名稱</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">類型</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">價格</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">數量</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">手續費</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">總額</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[#f8f8f2] uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-[#44475a] divide-y divide-gray-200 dark:divide-[#6272a4]">
          <tr v-for="transaction in sortedTransactions" :key="transaction.id" class="hover:bg-gray-50 dark:hover:bg-[#6272a4]/20 transition-colors duration-200">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">
              {{ formatDate(transaction.date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                getAssetTypeStyle(transaction.assetType)
              ]">
                {{ getAssetTypeLabel(transaction.assetType) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">
              {{ transaction.symbol }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">
              {{ transaction.stockName }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                transaction.type === 'buy' ? 'bg-green-100 dark:bg-[#50fa7b]/20 text-green-800 dark:text-[#50fa7b]' : 'bg-red-100 dark:bg-[#ff5555]/20 text-red-800 dark:text-[#ff5555]'
              ]">
                {{ transaction.type === 'buy' ? '買入' : '賣出' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">
              {{ formatPrice(transaction.price, transaction.assetType) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">
              {{ transaction.quantity }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">
              {{ formatPrice(transaction.fee, transaction.assetType) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[#f8f8f2]">
              {{ formatPrice(transaction.total, transaction.assetType) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="deleteTransaction(transaction.id)"
                class="text-red-600 dark:text-[#ff5555] hover:text-red-900 dark:hover:text-[#ff79c6] transition-colors duration-200"
              >
                刪除
              </button>
            </td>
          </tr>
          <tr v-if="sortedTransactions.length === 0">
            <td colspan="10" class="px-6 py-4 text-center text-gray-500 dark:text-[#6272a4]">
              尚無交易記錄
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTransactions } from '~/composables/useTransactions'
import type { Transaction } from '~/composables/useTransactions'

// Get transactions from composable
const { transactions, deleteTransaction, initialize } = useTransactions()

// Initialize data
onMounted(async () => {
  await initialize()
})

// Sort transactions by date (newest first)
const sortedTransactions = computed(() => {
  return [...transactions.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// Get asset type label
const getAssetTypeLabel = (assetType: string) => {
  const labels = {
    tw_stock: '台股',
    us_stock: '美股',
    crypto: '加密貨幣',
    bond: '債券',
    financial_product: '金融商品'
  }
  return labels[assetType as keyof typeof labels] || '未知'
}

// Get asset type style
const getAssetTypeStyle = (assetType: string) => {
  const styles = {
    tw_stock: 'bg-blue-100 dark:bg-[#8be9fd]/20 text-blue-800 dark:text-[#8be9fd]',
    us_stock: 'bg-purple-100 dark:bg-[#bd93f9]/20 text-purple-800 dark:text-[#bd93f9]',
    crypto: 'bg-orange-100 dark:bg-[#ffb86c]/20 text-orange-800 dark:text-[#ffb86c]',
    bond: 'bg-gray-100 dark:bg-[#6272a4]/20 text-gray-800 dark:text-[#6272a4]',
    financial_product: 'bg-green-100 dark:bg-[#50fa7b]/20 text-green-800 dark:text-[#50fa7b]'
  }
  return styles[assetType as keyof typeof styles] || 'bg-gray-100 dark:bg-[#6272a4]/20 text-gray-800 dark:text-[#6272a4]'
}

// Format price with currency based on asset type
const formatPrice = (price: number, assetType?: string) => {
  const currency = assetType === 'tw_stock' ? 'TWD' : 'USD'
  const locale = assetType === 'tw_stock' ? 'zh-TW' : 'en-US'
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(price)
}
</script> 