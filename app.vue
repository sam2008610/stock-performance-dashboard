<template>
  <div class="min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors duration-200">
    <nav class="bg-white dark:bg-slate-800 shadow-lg transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-800 dark:text-slate-100">投資績效追蹤</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NuxtLink to="/" class="text-gray-900 dark:text-slate-100 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-blue-600 transition-colors duration-200">
                首頁
              </NuxtLink>
              <NuxtLink to="/portfolio" class="text-gray-900 dark:text-slate-100 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-blue-600 transition-colors duration-200">
                投資組合
              </NuxtLink>
              <NuxtLink to="/transactions" class="text-gray-900 dark:text-slate-100 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-blue-600 transition-colors duration-200">
                交易記錄
              </NuxtLink>
              <NuxtLink to="/analysis" class="text-gray-900 dark:text-slate-100 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-blue-600 transition-colors duration-200">
                行為分析
              </NuxtLink>
              <NuxtLink to="/add" class="text-gray-900 dark:text-slate-100 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-blue-600 transition-colors duration-200">
                新增交易
              </NuxtLink>
              <NuxtLink to="/settings" class="text-gray-900 dark:text-slate-100 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-blue-600 transition-colors duration-200">
                設定
              </NuxtLink>
            </div>
          </div>
          
          <!-- 主題切換按鈕 -->
          <div class="flex items-center">
            <button
              @click="toggleTheme"
              class="p-2 rounded-md text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200"
              :title="isDarkMode ? '切換到日間模式' : '切換到夜間模式'"
            >
              <!-- 太陽圖示 (日間模式) -->
              <svg v-if="isDarkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              
              <!-- 月亮圖示 (夜間模式) -->
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTheme } from '~/composables/useTheme'

const { isDarkMode, toggleTheme, loadTheme } = useTheme()

onMounted(() => {
  loadTheme()
})
</script>

<style>
body {
  font-family: 'Noto Sans TC', sans-serif;
}
</style>
