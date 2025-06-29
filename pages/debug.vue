<template>
  <div class="max-w-4xl mx-auto px-4 py-10">
    <div class="rounded-2xl shadow-xl bg-white/80 dark:bg-[#23272f]/80 backdrop-blur p-8">
      <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
        系統診斷工具
      </h1>
      
      <div class="space-y-6">
        <div class="flex space-x-4">
          <button
            @click="checkSetup"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            檢查設定
          </button>
          
          <button
            @click="resetSetup"
            class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            重置設定
          </button>
        </div>
        
        <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <pre class="text-sm whitespace-pre-wrap">{{ output }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAssetHistory } from '~/composables/useAssetHistory'
import { useSecureStorage } from '~/composables/useSecureStorage'
import { useCrypto } from '~/composables/useCrypto'

const output = ref('')
const { resetInitialSetup } = useAssetHistory()
const { getItem, hasItem } = useSecureStorage()
const { isCryptoSupported } = useCrypto()

function log(message) {
  output.value += message + '\n'
  console.log(message)
}

async function checkSetup() {
  output.value = ''
  
  try {
    log('=== 系統診斷 ===')
    log(`瀏覽器支援 Web Crypto API: ${isCryptoSupported()}`)
    
    // 檢查 localStorage 內容
    log('\n=== localStorage 內容 ===')
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      const value = localStorage.getItem(key)
      log(`${key}: ${value?.substring(0, 100)}${value?.length > 100 ? '...' : ''}`)
    }
    
    // 檢查是否存在相關 keys
    log('\n=== 檢查關鍵資料 ===')
    log(`initial_setup 存在: ${hasItem('initial_setup')}`)
    log(`asset_history 存在: ${hasItem('asset_history')}`)
    log(`transactions 存在: ${hasItem('transactions')}`)
    
    // 嘗試讀取 initial_setup
    log('\n=== 讀取 initial_setup ===')
    const setup = await getItem('initial_setup')
    log(`Initial setup 內容: ${JSON.stringify(setup, null, 2)}`)
    
    // 嘗試讀取 asset_history
    log('\n=== 讀取 asset_history ===')
    const history = await getItem('asset_history')
    log(`Asset history 長度: ${Array.isArray(history) ? history.length : 'null'}`)
    
  } catch (error) {
    log(`錯誤: ${error.message}`)
    log(`Stack: ${error.stack}`)
  }
}

async function resetSetup() {
  output.value = ''
  
  try {
    log('=== 重置系統設定 ===')
    
    // 使用 composable 的重置功能
    await resetInitialSetup()
    
    log('✅ 系統設定已重置')
    log('請返回首頁重新進行初始設定')
    
    // 延遲後自動導向首頁
    setTimeout(() => {
      window.location.href = '/'
    }, 2000)
    
  } catch (error) {
    log(`重置失敗: ${error.message}`)
  }
}
</script>