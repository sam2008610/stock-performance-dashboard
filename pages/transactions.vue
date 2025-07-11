<!-- Create a new transactions page with listing and deletion functionality -->
<template>
  <div class="max-w-7xl mx-auto px-4 py-10 grid gap-10">
    <div class="rounded-2xl shadow-xl bg-white/80 dark:bg-[#23272f]/80 backdrop-blur p-8 mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <span class="inline-block w-2 h-8 bg-gradient-to-b from-[#8b5cf6] to-[#06b6d4] rounded-full mr-2"></span>
          交易記錄
        </h1>
        <div class="flex gap-3">
          <label class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 dark:bg-emerald-700 text-white font-medium shadow-md hover:bg-emerald-700 dark:hover:bg-emerald-600 transition cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
            匯入 CSV
            <input 
              type="file" 
              accept=".csv" 
              @change="handleCSVImport" 
              class="hidden"
              ref="fileInput"
            />
          </label>
          <button
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-700 text-white font-medium shadow-md hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            @click="exportCSV"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            匯出 CSV
          </button>
        </div>
      </div>
      <div class="overflow-x-auto rounded-xl border border-gray-100 dark:border-[#6272a4] bg-white/70 dark:bg-[#23272f]/70">
        <table class="min-w-full text-sm text-left">
          <thead class="bg-gradient-to-r from-[#f3f4f6] to-[#e0e7ef] dark:from-[#23272f] dark:to-[#23272f]">
            <tr>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">日期</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">資產類型</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">代碼</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">名稱</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">類型</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">價格</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">數量</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">手續費</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider">總額</th>
              <th class="px-6 py-4 font-bold text-gray-500 dark:text-[#8be9fd] uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in sortedTransactions" :key="transaction.id" class="hover:bg-[#f3f4f6] dark:hover:bg-[#282a36] transition">
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]" v-text="formatDate(transaction.date)"></td>
              <td class="px-6 py-4">
                <span :class="['px-2 py-1 rounded-full text-xs font-semibold', getAssetTypeStyle(transaction.assetType)]" v-text="getAssetTypeLabel(transaction.assetType)">
                </span>
              </td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]" v-text="transaction.symbol"></td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]" v-text="transaction.stockName"></td>
              <td class="px-6 py-4">
                <span :class="['px-2 py-1 rounded-full text-xs font-semibold', transaction.type === 'buy' ? 'bg-green-100 dark:bg-[#50fa7b]/20 text-green-800 dark:text-[#50fa7b]' : 'bg-red-100 dark:bg-[#ff5555]/20 text-red-800 dark:text-[#ff5555]']" v-text="transaction.type === 'buy' ? '買入' : '賣出'">
                </span>
              </td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]" v-text="formatPrice(transaction.price, transaction.assetType)"></td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]" v-text="transaction.quantity"></td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]" v-text="formatPrice(transaction.fee, transaction.assetType)"></td>
              <td class="px-6 py-4 text-base text-gray-900 dark:text-[#f8f8f2]" v-text="formatPrice(transaction.total, transaction.assetType)"></td>
              <td class="px-6 py-4 text-right">
                <button
                  @click="deleteTransaction(transaction.id)"
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 dark:bg-red-700 text-white font-medium shadow-md hover:bg-red-700 dark:hover:bg-red-600 transition"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTransactions } from '~/composables/useTransactions'
import type { Transaction } from '~/composables/useTransactions'

// Get transactions from composable
const { transactions, deleteTransaction, addTransactions, initialize } = useTransactions()

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

// 匯出 CSV 功能
function exportCSV() {
  if (!sortedTransactions.value.length) {
    alert('沒有交易資料可匯出')
    return
  }
  const headers = Object.keys(sortedTransactions.value[0])
  const rows = sortedTransactions.value.map(tx =>
    headers.map(h => `"${(tx[h] ?? '').toString().replace(/"/g, '""')}` ).join(',')
  )
  const csvContent = [headers.join(','), ...rows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `transactions_${new Date().toISOString().slice(0,10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// CSV 驗證函數
function validateCSVData(data: any[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const requiredFields = ['type', 'symbol', 'stockName', 'date', 'quantity', 'price', 'fee', 'total']
  
  if (!Array.isArray(data) || data.length === 0) {
    errors.push('CSV 檔案為空或格式不正確')
    return { isValid: false, errors }
  }

  data.forEach((row, index) => {
    // 檢查必要欄位
    requiredFields.forEach(field => {
      if (!(field in row) || row[field] === undefined || row[field] === '') {
        errors.push(`第 ${index + 1} 行缺少必要欄位: ${field}`)
      }
    })

    // 檢查交易類型
    if (row.type && !['buy', 'sell'].includes(row.type)) {
      errors.push(`第 ${index + 1} 行的交易類型無效: ${row.type}`)
    }

    // 檢查資產類型
    if (row.assetType && !['tw_stock', 'us_stock', 'crypto', 'bond', 'financial_product'].includes(row.assetType)) {
      errors.push(`第 ${index + 1} 行的資產類型無效: ${row.assetType}`)
    }

    // 檢查數字欄位
    const numberFields = ['quantity', 'price', 'fee', 'total']
    numberFields.forEach(field => {
      if (row[field] && isNaN(Number(row[field]))) {
        errors.push(`第 ${index + 1} 行的 ${field} 不是有效數字: ${row[field]}`)
      }
    })

    // 檢查日期格式
    if (row.date && isNaN(Date.parse(row.date))) {
      errors.push(`第 ${index + 1} 行的日期格式無效: ${row.date}`)
    }
  })

  return { isValid: errors.length === 0, errors }
}

// 解析 CSV 檔案
function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
  const data: any[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim())
    if (values.length === headers.length) {
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      data.push(row)
    }
  }

  return data
}

// 匯入 CSV 功能
async function handleCSVImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  if (!file.name.toLowerCase().endsWith('.csv')) {
    alert('請選擇 CSV 檔案')
    return
  }

  try {
    const text = await file.text()
    const parsedData = parseCSV(text)
    
    if (parsedData.length === 0) {
      alert('CSV 檔案為空或格式不正確')
      return
    }

    // 驗證資料
    const { isValid, errors } = validateCSVData(parsedData)
    
    if (!isValid) {
      alert(`CSV 檔案有以下錯誤:\n${errors.join('\n')}`)
      return
    }

    // 轉換資料格式
    const transactions = parsedData.map(row => ({
      type: row.type as 'buy' | 'sell',
      assetType: row.assetType || 'tw_stock',
      symbol: row.symbol,
      stockName: row.stockName,
      date: row.date,
      quantity: Number(row.quantity),
      price: Number(row.price),
      fee: Number(row.fee),
      total: Number(row.total)
    }))

    // 確認匯入
    if (confirm(`確定要匯入 ${transactions.length} 筆交易記錄嗎？`)) {
      await addTransactions(transactions)
      alert(`成功匯入 ${transactions.length} 筆交易記錄`)
    }

  } catch (error) {
    console.error('匯入 CSV 失敗:', error)
    alert('匯入 CSV 檔案時發生錯誤，請檢查檔案格式')
  } finally {
    // 清除檔案選擇
    target.value = ''
  }
}
</script>