import { ref, computed } from 'vue'

export interface AssetSnapshot {
  date: string
  cash: number
  investment: number
  total: number
  note?: string
}

export interface InitialSetup {
  initialCash: number
  startDate: string
  isCompleted: boolean
}

export const useAssetHistory = () => {
  const assetHistory = ref<AssetSnapshot[]>([])
  const initialSetup = ref<InitialSetup>({
    initialCash: 0,
    startDate: '',
    isCompleted: false
  })

  // 載入資料
  const loadAssetHistory = () => {
    try {
      const stored = localStorage.getItem('asset_history')
      if (stored) {
        assetHistory.value = JSON.parse(stored)
      }
      
      const setup = localStorage.getItem('initial_setup')
      if (setup) {
        initialSetup.value = JSON.parse(setup)
      }
    } catch (error) {
      console.error('載入資產歷史失敗:', error)
    }
  }

  // 儲存資料
  const saveAssetHistory = () => {
    try {
      localStorage.setItem('asset_history', JSON.stringify(assetHistory.value))
    } catch (error) {
      console.error('儲存資產歷史失敗:', error)
    }
  }

  // 完成初始設定
  const completeInitialSetup = (cash: number, startDate: string) => {
    initialSetup.value = {
      initialCash: cash,
      startDate,
      isCompleted: true
    }
    
    // 建立初始快照
    const initialSnapshot: AssetSnapshot = {
      date: startDate,
      cash,
      investment: 0,
      total: cash
    }
    
    assetHistory.value = [initialSnapshot]
    saveAssetHistory()
    localStorage.setItem('initial_setup', JSON.stringify(initialSetup.value))
  }

  // 新增資產快照
  const addAssetSnapshot = (cash: number, investment: number, note?: string) => {
    const snapshot: AssetSnapshot = {
      date: new Date().toISOString().split('T')[0],
      cash,
      investment,
      total: cash + investment,
      note
    }
    
    assetHistory.value.push(snapshot)
    saveAssetHistory()
  }

  // 更新現金餘額
  const updateCashBalance = (newCash: number) => {
    if (assetHistory.value.length === 0) return
    
    // 更新最新的資產快照
    const latestSnapshot = assetHistory.value[assetHistory.value.length - 1]
    latestSnapshot.cash = newCash
    latestSnapshot.total = newCash + latestSnapshot.investment
    
    saveAssetHistory()
  }

  // 重建資產歷史（根據交易記錄推算）
  const rebuildAssetHistory = async () => {
    if (!initialSetup.value.isCompleted) return
    
    // 直接使用 useTransactions
    const { useTransactions } = await import('~/composables/useTransactions')
    const { transactions, portfolio } = useTransactions()
    
    console.log('=== 重建資產歷史（反推模式）===')
    console.log('最新現金餘額:', initialSetup.value.initialCash)
    console.log('交易記錄數量:', transactions.value.length)
    
    // 按日期排序交易記錄（從新到舊）
    const sortedTransactions = transactions.value.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    console.log('排序後的交易記錄（從新到舊）:', sortedTransactions)
    
    // 從最新現金餘額開始反推
    let currentCash = initialSetup.value.initialCash
    const newHistory: AssetSnapshot[] = []
    
    // 建立股票持有量的時間線追蹤（從現在開始）
    const stockHoldings = new Map<string, { quantity: number, totalCost: number }>()
    
    // 初始化當前持有量（使用最新的投資組合）
    portfolio.value.forEach(stock => {
      stockHoldings.set(stock.symbol, {
        quantity: stock.quantity || 0,
        totalCost: stock.totalCost || 0
      })
    })
    
    // 計算當前投資價值
    let currentInvestment = 0
    for (const [symbol, holding] of stockHoldings.entries()) {
      if (holding.quantity > 0) {
        currentInvestment += holding.totalCost
      }
    }
    
    // 建立最新快照
    const latestDate = new Date().toISOString().split('T')[0]
    newHistory.push({
      date: latestDate,
      cash: currentCash,
      investment: currentInvestment,
      total: currentCash + currentInvestment,
      note: '最新狀態'
    })
    
    console.log(`最新狀態 - 現金: NT$${currentCash}, 投資: NT$${currentInvestment}`)
    
    // 反向處理每筆交易（從最新往回推）
    for (const transaction of sortedTransactions) {
      console.log(`反推交易: ${transaction.type} ${transaction.symbol} ${transaction.quantity}股 NT$${transaction.total}`)
      console.log(`反推前現金: NT$${currentCash}`)
      
      // 反向更新現金（買入變成加回現金，賣出變成減掉現金）
      if (transaction.type === 'buy') {
        currentCash += transaction.total // 反推：買入時要加回現金
      } else {
        currentCash -= transaction.total // 反推：賣出時要減掉現金
      }
      
      console.log(`反推後現金: NT$${currentCash}`)
      
      // 反向更新股票持有量
      const symbol = transaction.symbol
      if (!stockHoldings.has(symbol)) {
        stockHoldings.set(symbol, { quantity: 0, totalCost: 0 })
      }
      
      const holding = stockHoldings.get(symbol)!
      if (transaction.type === 'buy') {
        // 反推：買入變成減少持有量
        holding.quantity -= transaction.quantity
        holding.totalCost -= transaction.total
      } else {
        // 反推：賣出變成增加持有量
        holding.quantity += transaction.quantity
        holding.totalCost += transaction.total
      }
      
      // 確保持有量不為負數
      if (holding.quantity < 0) {
        console.warn(`警告: ${symbol} 反推後持有量變成負數，調整為0`)
        holding.quantity = 0
        holding.totalCost = 0
      }
      
      // 確保總成本不為負數
      if (holding.totalCost < 0) {
        console.warn(`警告: ${symbol} 反推後總成本變成負數，調整為0`)
        holding.totalCost = 0
      }
      
      // 計算當時的投資價值
      let pastInvestment = 0
      for (const [symbol, holding] of stockHoldings.entries()) {
        if (holding.quantity > 0) {
          pastInvestment += holding.totalCost
        }
      }
      
      console.log(`反推後投資價值: NT$${pastInvestment}`)
      console.log(`反推後總資產: NT$${currentCash + pastInvestment}`)
      
      newHistory.push({
        date: transaction.date,
        cash: currentCash,
        investment: pastInvestment,
        total: currentCash + pastInvestment,
        note: `反推: ${transaction.type === 'buy' ? '買入' : '賣出'} ${transaction.symbol}`
      })
    }
    
    // 建立起始點快照
    if (sortedTransactions.length > 0) {
      const startDate = initialSetup.value.startDate
      newHistory.push({
        date: startDate,
        cash: currentCash,
        investment: 0,
        total: currentCash,
        note: '起始點（反推得出）'
      })
    }
    
    // 按日期重新排序（從舊到新）
    newHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    console.log('反推完成，新的資產歷史:', newHistory)
    
    assetHistory.value = newHistory
    saveAssetHistory()
  }

  // 重置初始設定
  const resetInitialSetup = () => {
    initialSetup.value = {
      initialCash: 0,
      startDate: '',
      isCompleted: false
    }
    assetHistory.value = []
    
    localStorage.removeItem('initial_setup')
    localStorage.removeItem('asset_history')
  }

  // 計算資產變化趨勢
  const assetTrend = computed(() => {
    return assetHistory.value.map(snapshot => ({
      date: snapshot.date,
      cash: snapshot.cash,
      investment: snapshot.investment,
      total: snapshot.total,
      cashPercentage: snapshot.total > 0 ? (snapshot.cash / snapshot.total) * 100 : 0,
      investmentPercentage: snapshot.total > 0 ? (snapshot.investment / snapshot.total) * 100 : 0
    }))
  })

  // 取得最新資產狀況
  const currentAssets = computed(() => {
    if (assetHistory.value.length === 0) return null
    return assetHistory.value[assetHistory.value.length - 1]
  })

  // 計算追蹤天數
  const trackingDays = computed(() => {
    if (!initialSetup.value.isCompleted || assetHistory.value.length === 0) return 0
    
    const startDate = new Date(initialSetup.value.startDate)
    const endDate = new Date()
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  })

  // 計算最低總資產
  const minTotal = computed(() => {
    if (assetHistory.value.length === 0) return 0
    return Math.min(...assetHistory.value.map(snapshot => snapshot.total))
  })

  // 計算最高總資產
  const maxTotal = computed(() => {
    if (assetHistory.value.length === 0) return 0
    return Math.max(...assetHistory.value.map(snapshot => snapshot.total))
  })

  // 計算每支股票的歷史持有量
  const getStockHistory = (symbol: string) => {
    if (!initialSetup.value.isCompleted) return []
    
    const { transactions } = useTransactions()
    
    // 按日期排序交易記錄
    const sortedTransactions = transactions.value
      .filter(t => t.symbol === symbol)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    const stockHistory: Array<{ date: string; quantity: number; totalCost: number }> = []
    let currentQuantity = 0
    let currentTotalCost = 0
    
    // 為每個資產快照日期計算股票持有量
    assetHistory.value.forEach(snapshot => {
      const snapshotDate = new Date(snapshot.date)
      
      // 計算到該日期為止的所有交易
      const relevantTransactions = sortedTransactions.filter(t => 
        new Date(t.date) <= snapshotDate
      )
      
      // 重新計算持有量
      currentQuantity = 0
      currentTotalCost = 0
      
      relevantTransactions.forEach(transaction => {
        if (transaction.type === 'buy') {
          currentQuantity += transaction.quantity
          currentTotalCost += transaction.total
        } else {
          currentQuantity -= transaction.quantity
          currentTotalCost -= transaction.total
        }
      })
      
      // 確保持有量不為負數
      if (currentQuantity < 0) {
        currentQuantity = 0
        currentTotalCost = 0
      }
      
      stockHistory.push({
        date: snapshot.date,
        quantity: currentQuantity,
        totalCost: currentTotalCost
      })
    })
    
    return stockHistory
  }

  // 計算所有股票的歷史數據
  const getAllStocksHistory = () => {
    const { portfolio } = useTransactions()
    const stocksHistory: Record<string, Array<{ date: string; quantity: number; totalCost: number }>> = {}
    
    portfolio.value.forEach(stock => {
      stocksHistory[stock.symbol] = getStockHistory(stock.symbol)
    })
    
    return stocksHistory
  }

  return {
    assetHistory,
    initialSetup,
    assetTrend,
    currentAssets,
    trackingDays,
    minTotal,
    maxTotal,
    getStockHistory,
    getAllStocksHistory,
    loadAssetHistory,
    saveAssetHistory,
    completeInitialSetup,
    addAssetSnapshot,
    updateCashBalance,
    rebuildAssetHistory,
    resetInitialSetup
  }
} 