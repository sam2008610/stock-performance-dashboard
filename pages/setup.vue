<template>
  <div class="max-w-4xl mx-auto px-4 py-10">
    <div class="rounded-2xl shadow-xl bg-white/80 dark:bg-[#23272f]/80 backdrop-blur p-8">
      <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8 text-center">
        歡迎使用投資組合追蹤器
      </h1>
      
      <div class="max-w-2xl mx-auto space-y-6">
        <div>
          <label class="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            目前現金餘額
          </label>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
            請輸入您目前實際的現金餘額，系統將根據交易記錄反推歷史現金變化
          </p>
          <input
            v-model.number="initialCash"
            type="number"
            placeholder="請輸入您目前的現金餘額"
            class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-[#6272a4] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-lg focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
          >
        </div>
        
        <div>
          <label class="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            開始追蹤日期
          </label>
          <input
            v-model="startDate"
            type="date"
            class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-[#6272a4] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-lg focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
          >
        </div>
        
        <button
          @click="completeSetup"
          :disabled="!isValid"
          class="w-full px-6 py-4 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white font-semibold rounded-lg hover:from-[#7c3aed] hover:to-[#0ea5e9] transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          完成設定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAssetHistory } from '~/composables/useAssetHistory'

const router = useRouter()
const { completeInitialSetup } = useAssetHistory()

const initialCash = ref(0)
const startDate = ref(new Date().toISOString().split('T')[0])

const isValid = computed(() => {
  return initialCash.value > 0 && startDate.value
})

const completeSetup = () => {
  if (!isValid.value) return
  
  completeInitialSetup(initialCash.value, startDate.value)
  router.push('/')
}
</script> 