import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useHotelStore } from '../../store/hotelContext'
import { useHistory } from '../../store/historyContext'
import type { IHotel } from '../../types/hotel'
import './index.scss'

const formatTime = (iso: string): string => {
  const d = new Date(iso)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hour}:${min}`
}

const HistoryPage = () => {
  const { history, clearHistory } = useHistory()
  const { getHotelById } = useHotelStore()

  const handleHotelClick = (hotelId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${hotelId}` })
  }

  const handleClear = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要清空浏览历史吗？',
      success: (res) => {
        if (res.confirm) clearHistory()
      }
    })
  }

  return (
    <View className='history-page'>
      {history.length > 0 && (
        <View className='history-header'>
          <Text className='history-count'>共 {history.length} 条记录</Text>
          <Text className='history-clear' onClick={handleClear}>清空</Text>
        </View>
      )}

      {history.length > 0 ? (
        history.map(item => {
          const hotel = getHotelById(item.hotelId)
          if (!hotel) return null
          return (
            <View key={item.hotelId + item.visitTime} className='history-card' onClick={() => handleHotelClick(item.hotelId)}>
              <Image className='history-image' src={hotel.imageUrl} mode='aspectFill' />
              <View className='history-info'>
                <Text className='history-name'>{hotel.nameCn}</Text>
                <Text className='history-address'>{hotel.address}</Text>
                <View className='history-bottom'>
                  <Text className='history-time'>{formatTime(item.visitTime)}</Text>
                  <View className='history-price'>
                    <Text className='history-price-symbol'>¥</Text>
                    <Text className='history-price-value'>{hotel.price}</Text>
                    <Text className='history-price-unit'>起</Text>
                  </View>
                </View>
              </View>
            </View>
          )
        })
      ) : (
        <View className='empty-state'>
          <Text className='empty-text'>暂无浏览记录</Text>
        </View>
      )}
    </View>
  )
}

export default HistoryPage
