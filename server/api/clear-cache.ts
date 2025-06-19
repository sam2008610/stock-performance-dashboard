// Server API endpoint to clear cache
export default defineEventHandler(async (event) => {
  try {
    console.log('正在清除伺服器端快取...')
    
    // 這裡可以清除任何伺服器端的快取
    // 目前主要是回傳成功訊息，讓前端清除 localStorage
    
    return {
      success: true,
      message: '快取清除成功',
      timestamp: new Date().toISOString()
    }
    
  } catch (error: any) {
    console.error('清除快取時發生錯誤:', error)
    throw createError({
      statusCode: 500,
      message: `清除快取時發生錯誤: ${error?.message || '未知錯誤'}`
    })
  }
}) 