// Server API endpoint to fetch stock price from FinMind
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const symbol = query.symbol as string

  // Input validation for stock symbol
  if (!symbol) {
    throw createError({
      statusCode: 400,
      message: '請提供股票代碼'
    })
  }

  // Sanitize and validate stock symbol format
  const sanitizedSymbol = symbol.toString().trim()
  
  // Taiwan stock symbol validation: numbers only, 4-6 digits
  if (!/^[0-9]{4,6}$/.test(sanitizedSymbol)) {
    throw createError({
      statusCode: 400,
      message: '股票代碼格式錯誤，請輸入4-6位數字'
    })
  }

  // Length validation
  if (sanitizedSymbol.length > 6) {
    throw createError({
      statusCode: 400,
      message: '股票代碼長度不可超過6位數'
    })
  }

  try {
    console.log(`正在查詢股票: ${sanitizedSymbol}`)
    
    let stockName = null
    let stockPrice = null
    let priceChange = 0
    let priceChangePercent = 0
    let isOTC = false
    
    // 1. 嘗試從 FinMind 獲取股票價格資料（包含上市和上櫃）
    try {
      // 獲取最近的股票價格資料
      const today = new Date()
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const startDate = oneWeekAgo.toISOString().split('T')[0]
      const endDate = today.toISOString().split('T')[0]
      
      console.log(`查詢價格資料: ${sanitizedSymbol}, 日期範圍: ${startDate} 到 ${endDate}`)
      
      // 先嘗試上市股票
      let priceResponse = await fetch(
        `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=${sanitizedSymbol}&start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        }
      )
      
      let priceData = null
      if (priceResponse.ok) {
        priceData = await priceResponse.json()
        console.log('FinMind 上市股票價格回應:', JSON.stringify(priceData, null, 2))
      }
      
      // 如果上市沒有資料，嘗試上櫃股票
      if (!priceData?.data || priceData.data.length === 0) {
        console.log('上市股票無資料，嘗試查詢上櫃股票')
        priceResponse = await fetch(
          `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPriceOTC&data_id=${sanitizedSymbol}&start_date=${startDate}&end_date=${endDate}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }
        )
        
        if (priceResponse.ok) {
          priceData = await priceResponse.json()
          console.log('FinMind 上櫃股票價格回應:', JSON.stringify(priceData, null, 2))
          if (priceData?.data && priceData.data.length > 0) {
            isOTC = true
          }
        }
      }
      
      if (priceData?.data && priceData.data.length > 0) {
        // 取得最新的價格資料
        const latestPrice = priceData.data[priceData.data.length - 1]
        stockPrice = latestPrice.close
        
        // 計算漲跌
        if (priceData.data.length > 1) {
          const previousPrice = priceData.data[priceData.data.length - 2]
          priceChange = stockPrice - previousPrice.close
          priceChangePercent = (priceChange / previousPrice.close) * 100
        }
        
        console.log(`股票價格: ${stockPrice}, 漲跌: ${priceChange}, 漲跌幅: ${priceChangePercent.toFixed(2)}%`)
      }
    } catch (error) {
      console.log('FinMind 獲取股票價格失敗:', error)
    }
    
    // 2. 獲取股票名稱 - 先嘗試上市股票基本資料
    try {
      console.log('查詢上市股票基本資料')
      let stockInfoResponse = await fetch(
        `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockInfo&data_id=${sanitizedSymbol}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        }
      )
      
      if (stockInfoResponse.ok) {
        const stockInfoData = await stockInfoResponse.json()
        console.log('FinMind 上市股票資訊回應:', JSON.stringify(stockInfoData, null, 2))
        
        if (stockInfoData?.data && stockInfoData.data.length > 0) {
          const stockInfo = stockInfoData.data[0]
          stockName = stockInfo.stock_name
          console.log(`找到上市股票資訊: ${stockName}`)
        }
      }
      
      // 如果上市沒有資料，嘗試上櫃股票基本資料
      if (!stockName) {
        console.log('上市股票無基本資料，查詢上櫃股票基本資料')
        stockInfoResponse = await fetch(
          `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockInfoOTC&data_id=${sanitizedSymbol}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }
        )
        
        if (stockInfoResponse.ok) {
          const stockInfoData = await stockInfoResponse.json()
          console.log('FinMind 上櫃股票資訊回應:', JSON.stringify(stockInfoData, null, 2))
          
          if (stockInfoData?.data && stockInfoData.data.length > 0) {
            const stockInfo = stockInfoData.data[0]
            stockName = stockInfo.stock_name
            isOTC = true
            console.log(`找到上櫃股票資訊: ${stockName}`)
          }
        }
      }
    } catch (error) {
      console.log('FinMind 獲取股票基本資料失敗:', error)
    }
    
    // 3. 準備回傳資料
    // 只要有股票名稱或價格其中一個就認為是有效的股票
    if (!stockName && !stockPrice) {
      console.log(`股票 ${sanitizedSymbol} 查詢失敗: 無名稱也無價格資料`)
      throw createError({
        statusCode: 404,
        message: `找不到股票代碼 ${sanitizedSymbol} 的資料，請確認股票代碼是否正確`
      })
    }
    
    const result = {
      symbol: sanitizedSymbol,
      name: stockName || `股票代碼 ${sanitizedSymbol}`,
      price: stockPrice || 0,
      change: priceChange,
      changePercent: priceChangePercent,
      market: isOTC ? 'OTC' : 'TWSE',
      source: 'FinMind',
      timestamp: new Date().toISOString(),
      hasPrice: !!stockPrice,
      hasName: !!stockName
    }
    
    console.log('最終回傳結果:', result)
    return result
    
  } catch (error: any) {
    console.error('股票查詢錯誤:', error)
    throw createError({
      statusCode: 500,
      message: `查詢股票 ${sanitizedSymbol} 時發生錯誤`
    })
  }
}) 