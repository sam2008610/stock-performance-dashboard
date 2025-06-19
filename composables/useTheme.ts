import { ref, onMounted } from 'vue'

const isDarkMode = ref(false)

export const useTheme = () => {
  // 從 localStorage 載入主題設定
  const loadTheme = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved) {
        isDarkMode.value = saved === 'dark'
      } else {
        // 如果沒有儲存的設定，使用系統偏好
        isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      applyTheme()
    }
  }

  // 應用主題到 HTML 元素
  const applyTheme = () => {
    if (typeof window !== 'undefined') {
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  // 切換主題
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    applyTheme()
    
    // 儲存到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
    }
  }

  // 設定特定主題
  const setTheme = (theme: 'light' | 'dark') => {
    isDarkMode.value = theme === 'dark'
    applyTheme()
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme)
    }
  }

  return {
    isDarkMode,
    toggleTheme,
    setTheme,
    loadTheme
  }
} 