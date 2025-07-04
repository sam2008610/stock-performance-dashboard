import { ref, computed, onUnmounted } from 'vue'
import { useStockPrice } from '~/composables/useStockPrice'
import { useSecureStorage } from '~/composables/useSecureStorage'

export interface Transaction {
  id: string
  type: 'buy' | 'sell'
  assetType: 'tw_stock' | 'us_stock' | 'crypto' | 'bond' | 'financial_product'
  symbol: string
  stockName: string
  date: string
  quantity: number
  price: number
  fee: number
  total: number
}

// 全域狀態，確保所有頁面共享同一個資料狀態
const transactions = ref<Transaction[]>([])
let isLoaded = false
let priceUpdateInterval: NodeJS.Timeout | null = null

export const useTransactions = () => {
  const stockPriceComposable = useStockPrice()
  const realTimeStockPrices = ref<Map<string, number>>(new Map())
  const { getItem, setItem } = useSecureStorage()

  // 從 localStorage 載入資料
  const loadTransactions = async () => {
    if (isLoaded) return // 如果已經載入過，就不重複載入
    
    try {
      const stored = await getItem<Transaction[]>('transactions')
      if (stored && Array.isArray(stored)) {
        // 確保向後相容性：為舊資料添加 assetType
        transactions.value = stored.map((t: Partial<Transaction>) => ({
          id: t.id || '',
          type: t.type || 'buy',
          assetType: t.assetType || 'tw_stock',
          symbol: t.symbol || '',
          stockName: t.stockName || '',
          date: t.date || '',
          quantity: t.quantity || 0,
          price: t.price || 0,
          fee: t.fee || 0,
          total: t.total || 0
        }))
      } else {
        transactions.value = []
      }
      isLoaded = true
      console.log('交易資料已載入，筆數:', transactions.value.length)
    } catch (error) {
      console.error('載入交易資料失敗:', error)
      transactions.value = []
      isLoaded = true
    }
  }

  // 更新股票名稱
  const updateStockNames = async () => {
    const symbols = Array.from(new Set(transactions.value.map(t => t.symbol)))
    if (symbols.length === 0) return
    
    console.log('正在更新股票名稱:', symbols)
    
    const { getStockName } = stockPriceComposable
    let hasUpdates = false
    
    // 逐一取得每支股票的名稱
    for (const symbol of symbols) {
      try {
        const stockName = await getStockName(symbol)
        if (stockName) {
          // 更新所有相關交易的股票名稱
          transactions.value.forEach(transaction => {
            if (transaction.symbol === symbol && transaction.stockName !== stockName) {
              transaction.stockName = stockName
              hasUpdates = true
            }
          })
          console.log(`股票 ${symbol} 名稱已更新: ${stockName}`)
        }
      } catch (error) {
        console.error(`更新股票 ${symbol} 名稱失敗:`, error)
      }
    }
    
    // 如果有更新，儲存到 localStorage
    if (hasUpdates) {
      await saveTransactions()
      console.log('股票名稱更新完成並已儲存')
    }
  }

  // 更新即時股價
  const updateStockPrices = async () => {
    const symbols = Array.from(new Set(transactions.value.map(t => t.symbol)))
    if (symbols.length === 0) return
    
    console.log('正在更新股價:', symbols)
    
    // 逐一取得每支股票的價格
    for (const symbol of symbols) {
      try {
        const { getStockPrice } = stockPriceComposable
        const stockData = await getStockPrice(symbol)
        if (stockData && stockData.price > 0) {
          realTimeStockPrices.value.set(symbol, stockData.price)
          console.log(`股票 ${symbol} 價格已更新: ${stockData.price}`)
        } else {
          console.warn(`股票 ${symbol} 價格獲取失敗或為0`)
        }
      } catch (error) {
        console.error(`更新股票 ${symbol} 價格失敗:`, error)
      }
    }
    
    console.log('所有股價更新完成:', Object.fromEntries(realTimeStockPrices.value))
  }

  // 儲存資料到 localStorage
  const saveTransactions = async () => {
    try {
      const success = await setItem('transactions', transactions.value)
      if (success) {
        console.log('交易資料已加密儲存，筆數:', transactions.value.length)
      } else {
        console.error('儲存交易資料失敗')
      }
    } catch (error) {
      console.error('儲存交易資料失敗:', error)
    }
  }

  // 新增交易
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      // 確保向後相容性：如果沒有 assetType，預設為台股
      assetType: transaction.assetType || 'tw_stock'
    }
    transactions.value.push(newTransaction)
    await saveTransactions()
    
    // 只有台股才更新股價和股票名稱
    if (newTransaction.assetType === 'tw_stock') {
      updateStockPrices()
      updateStockNames()
    }
  }

  // 批量新增交易（用於CSV匯入）
  const addTransactions = async (newTransactions: Omit<Transaction, 'id'>[]) => {
    const transactionsWithId = newTransactions.map(transaction => ({
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      assetType: transaction.assetType || 'tw_stock'
    }))
    
    transactions.value.push(...transactionsWithId)
    await saveTransactions()
    
    // 更新股價和股票名稱
    updateStockPrices()
    updateStockNames()
  }

  // 刪除交易
  const deleteTransaction = async (id: string) => {
    const index = transactions.value.findIndex(t => t.id === id)
    if (index > -1) {
      transactions.value.splice(index, 1)
      await saveTransactions()
      updateStockPrices() // 更新股價
    }
  }

  // 計算投資組合
  const portfolio = computed(() => {
    const stockMap = new Map<string, PortfolioItem>()

    transactions.value.forEach(transaction => {
      const { symbol, type, quantity, price, fee, stockName, assetType } = transaction
      const total = quantity * price + fee

      if (!stockMap.has(symbol)) {
        stockMap.set(symbol, {
          symbol,
          stockName,
          assetType: assetType || 'tw_stock',
          quantity: 0,
          totalCost: 0,
          avgCost: 0,
          currentPrice: realTimeStockPrices.value.get(symbol) || 0,
          currentValue: 0,
          returnRate: 0
        })
      }

      const stock = stockMap.get(symbol)!
      if (type === 'buy') {
        stock.quantity += quantity
        stock.totalCost += total
      } else {
        stock.quantity -= quantity
        stock.totalCost -= total
      }

      // 計算平均成本
      stock.avgCost = stock.quantity > 0 ? stock.totalCost / stock.quantity : 0
      
      // 使用即時股價
      if (realTimeStockPrices.value.has(symbol)) {
        stock.currentPrice = realTimeStockPrices.value.get(symbol)!
      }
      
      // 計算當前價值
      stock.currentValue = stock.quantity * stock.currentPrice
      
      // 計算報酬率
      stock.returnRate = stock.totalCost > 0 
        ? ((stock.currentValue - stock.totalCost) / stock.totalCost) * 100 
        : 0
    })

    return Array.from(stockMap.values())
      .filter(stock => stock.quantity > 0)
      .sort((a, b) => b.currentValue - a.currentValue)
  })

  // 計算總投資金額
  const totalInvestment = computed(() => {
    return transactions.value.reduce((sum, t) => {
      return sum + (t.type === 'buy' ? t.total : -t.total)
    }, 0)
  })

  // 計算當前總價值
  const currentValue = computed(() => {
    return portfolio.value.reduce((sum, stock) => sum + stock.currentValue, 0)
  })

  // 計算總報酬率
  const totalReturnRate = computed(() => {
    if (totalInvestment.value === 0) return 0
    return ((currentValue.value - totalInvestment.value) / totalInvestment.value) * 100
  })

  // 獲取最近的交易
  const recentTransactions = computed(() => {
    return transactions.value.slice(-5).reverse()
  })

  // 初始化函數，確保資料已載入
  const initialize = async () => {
    if (!isLoaded) {
      await loadTransactions()
      await Promise.all([
        updateStockPrices(), // 載入資料後更新股價
        updateStockNames()   // 載入資料後更新股票名稱
      ])
    }
  }

  // 啟動定期更新股價和股票名稱
  const startPriceUpdates = () => {
    if (typeof window !== 'undefined' && !priceUpdateInterval) {
      priceUpdateInterval = setInterval(async () => {
        if (isLoaded && transactions.value.length > 0) {
          await Promise.all([
            updateStockPrices(),
            updateStockNames()
          ])
        }
      }, 5 * 60 * 1000) // 每5分鐘更新一次
    }
  }

  // 停止定期更新
  const stopPriceUpdates = () => {
    if (priceUpdateInterval) {
      clearInterval(priceUpdateInterval)
      priceUpdateInterval = null
    }
  }

  // 清理資源
  onUnmounted(() => {
    stopPriceUpdates()
  })

  // 更新投資組合
  const updatePortfolio = () => {
    console.log('投資組合已自動更新')
  }

  return {
    transactions,
    portfolio,
    totalInvestment,
    currentValue,
    totalReturnRate,
    recentTransactions,
    loadTransactions,
    saveTransactions,
    addTransaction,
    addTransactions,
    deleteTransaction,
    initialize,
    updateStockPrices,
    updateStockNames,
    updatePortfolio,
    startPriceUpdates,
    stopPriceUpdates
  }
}

export interface PortfolioItem {
  symbol: string
  stockName: string
  assetType: 'tw_stock' | 'us_stock' | 'crypto' | 'bond' | 'financial_product'
  quantity: number
  avgCost: number
  currentPrice: number
  totalCost: number
  currentValue: number
  returnRate: number
} 