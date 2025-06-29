import { ref } from 'vue'
import { useSecureStorage } from '~/composables/useSecureStorage'

export interface StockPrice {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  market?: string // 'TWSE' for 上市, 'OTC' for 上櫃
  yahooSymbol?: string // Yahoo Finance 使用的代碼
}

const stockPrices = ref<Map<string, StockPrice>>(new Map())
const stockNames = ref<Map<string, string>>(new Map()) // Cache for stock names
const loading = ref<Map<string, boolean>>(new Map())

// 取得今天日期字串（yyyy-mm-dd）
function getTodayString() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// localStorage key 格式
function getPriceCacheKey(symbol: string) {
  return `stock_price_${symbol}`
}

// localStorage key for stock names
function getNameCacheKey(symbol: string) {
  return `stock_name_${symbol}`
}

export const useStockPrice = () => {
  const { getItem, setItem, removeItem } = useSecureStorage()

  // 重置所有快取
  const clearCache = async () => {
    console.log('正在清除股票快取...')
    
    try {
      // 呼叫伺服器端清除快取 API
      await fetch('/api/clear-cache')
    } catch (error) {
      console.log('呼叫伺服器端清除快取失敗:', error)
    }
    
    // 清除記憶體快取
    stockPrices.value.clear()
    stockNames.value.clear()
    loading.value.clear()
    
    // 清除 localStorage 中的股票相關快取
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('stock_price_') || key.startsWith('stock_name_'))) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => {
      removeItem(key)
    })
    
    console.log(`已清除 ${keysToRemove.length} 個快取項目`)
  }

  // 從後端 API 獲取股票價格
  const fetchStockPrice = async (symbol: string): Promise<StockPrice | null> => {
    try {
      console.log(`正在查詢股票: ${symbol}`)
      const response = await fetch(`/api/stock?symbol=${symbol}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`獲取股票 ${symbol} 價格失敗: HTTP ${response.status}`, errorText)
        return null
      }
      
      const data = await response.json()
      console.log(`股票 ${symbol} 查詢結果:`, data)
      
      if (data && data.symbol) {
        return data
      } else {
        console.error(`股票 ${symbol} 回傳資料格式錯誤:`, data)
        return null
      }
    } catch (error) {
      console.error(`獲取股票 ${symbol} 價格失敗:`, error)
      return null
    }
  }

  // 從 TWSE 獲取股票名稱
  const fetchStockName = async (symbol: string): Promise<string | null> => {
    try {
      // 使用 proxy API 來避免 CORS 問題
      const response = await fetch(`/api/stock?symbol=${symbol}`)
      if (!response.ok) {
        console.error(`獲取股票 ${symbol} 名稱失敗: HTTP ${response.status}`)
        return null
      }
      
      const data = await response.json()
      if (data && data.name) {
        return data.name
      }
      
      return null
    } catch (error) {
      console.error(`獲取股票 ${symbol} 名稱失敗:`, error)
      return null
    }
  }

  // 取得股票名稱（本地快取，每天只抓一次）
  const getStockName = async (symbol: string): Promise<string | null> => {
    const cacheKey = getNameCacheKey(symbol)
    const today = getTodayString()
    
    const cached = await getItem<{ name: string, date: string }>(cacheKey)

    if (cached && cached.date === today && cached.name) {
      stockNames.value.set(symbol, cached.name)
      return cached.name
    }

    // 沒有快取或不是今天的，重新抓
    const name = await fetchStockName(symbol)
    if (name) {
      stockNames.value.set(symbol, name)
      await setItem(cacheKey, { name, date: today })
      return name
    }
    return null
  }

  // 批量獲取多個股票名稱
  const getStockNames = async (symbols: string[]): Promise<Map<string, string>> => {
    await Promise.all(symbols.map(symbol => getStockName(symbol)))
    return stockNames.value
  }

  // 取得股票價格（本地快取，每天只抓一次）
  const getStockPrice = async (symbol: string): Promise<StockPrice | null> => {
    const cacheKey = getPriceCacheKey(symbol)
    const today = getTodayString()
    
    const cached = await getItem<{ price: StockPrice, date: string }>(cacheKey)

    if (cached && cached.date === today && cached.price) {
      stockPrices.value.set(symbol, cached.price)
      return cached.price
    }

    // 沒有快取或不是今天的，重新抓
    const price = await fetchStockPrice(symbol)
    if (price) {
      stockPrices.value.set(symbol, price)
      await setItem(cacheKey, { price, date: today })
      return price
    }
    return null
  }

  // 強制重新獲取股票價格（忽略快取）
  const forceRefreshStockPrice = async (symbol: string): Promise<StockPrice | null> => {
    console.log(`強制重新獲取股票 ${symbol} 的價格`)
    
    // 清除該股票的快取
    const priceCacheKey = getPriceCacheKey(symbol)
    const nameCacheKey = getNameCacheKey(symbol)
    removeItem(priceCacheKey)
    removeItem(nameCacheKey)
    stockPrices.value.delete(symbol)
    stockNames.value.delete(symbol)
    
    // 重新獲取
    return await getStockPrice(symbol)
  }

  // 批量獲取多個股票價格
  const getStockPrices = async (symbols: string[]): Promise<Map<string, StockPrice>> => {
    await Promise.all(symbols.map(symbol => getStockPrice(symbol)))
    return stockPrices.value
  }

  // 檢查股票代碼是否有效
  const isValidStock = async (symbol: string): Promise<boolean> => {
    const name = await fetchStockName(symbol)
    return name !== null
  }

  return {
    getStockPrice,
    getStockPrices,
    getStockName,
    getStockNames,
    isValidStock,
    fetchStockName,
    forceRefreshStockPrice,
    clearCache,
    stockNames,
    loading
  }
}

export default useStockPrice 