// Server API endpoint to fetch complete Taiwan stock list from FinMind
let stockListCache: any[] = []
let cacheTimestamp = 0
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export default defineEventHandler(async (event) => {
  try {
    const now = Date.now()
    
    // Check if cache is still valid
    if (stockListCache.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('返回快取的股票清單，共', stockListCache.length, '筆資料')
      return {
        success: true,
        data: stockListCache,
        source: 'cache',
        count: stockListCache.length
      }
    }

    console.log('開始獲取完整台股清單...')
    
    let allStocks: any[] = []
    
    // 1. 獲取上市股票清單
    try {
      console.log('獲取上市股票清單...')
      const tseResponse = await fetch(
        'https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockInfo',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        }
      )
      
      if (tseResponse.ok) {
        const tseData = await tseResponse.json()
        if (tseData?.data && Array.isArray(tseData.data)) {
          const tseStocks = tseData.data.map((stock: any) => ({
            symbol: stock.stock_id,
            name: stock.stock_name,
            market: 'TWSE',
            industry: stock.industry_category || '其他',
            type: stock.type || 'stock'
          }))
          allStocks.push(...tseStocks)
          console.log(`獲取到 ${tseStocks.length} 支上市股票`)
        }
      }
    } catch (error) {
      console.error('獲取上市股票清單失敗:', error)
    }
    
    // 2. 獲取上櫃股票清單
    try {
      console.log('獲取上櫃股票清單...')
      const otcResponse = await fetch(
        'https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockInfoOTC',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        }
      )
      
      if (otcResponse.ok) {
        const otcData = await otcResponse.json()
        if (otcData?.data && Array.isArray(otcData.data)) {
          const otcStocks = otcData.data.map((stock: any) => ({
            symbol: stock.stock_id,
            name: stock.stock_name,
            market: 'OTC',
            industry: stock.industry_category || '其他',
            type: stock.type || 'stock'
          }))
          allStocks.push(...otcStocks)
          console.log(`獲取到 ${otcStocks.length} 支上櫃股票`)
        }
      }
    } catch (error) {
      console.error('獲取上櫃股票清單失敗:', error)
    }
    
    // 3. 去除重複和無效的股票
    const validStocks = allStocks.filter(stock => 
      stock.symbol && 
      stock.name && 
      /^\d+/.test(stock.symbol) // 確保股票代碼以數字開頭
    )
    
    // 按股票代碼排序
    validStocks.sort((a, b) => a.symbol.localeCompare(b.symbol))
    
    // 更新快取
    stockListCache = validStocks
    cacheTimestamp = now
    
    console.log(`成功獲取完整台股清單，共 ${validStocks.length} 支股票`)
    
    return {
      success: true,
      data: validStocks,
      source: 'api',
      count: validStocks.length,
      lastUpdated: new Date().toISOString()
    }
    
  } catch (error: any) {
    console.error('獲取股票清單錯誤:', error)
    
    // 如果有快取資料，即使過期也返回
    if (stockListCache.length > 0) {
      console.log('API 失敗，返回過期的快取資料')
      return {
        success: true,
        data: stockListCache,
        source: 'cache_fallback',
        count: stockListCache.length,
        warning: '使用過期快取資料'
      }
    }
    
    throw createError({
      statusCode: 500,
      message: `獲取股票清單時發生錯誤: ${error?.message || '未知錯誤'}`
    })
  }
}) 