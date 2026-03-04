import { useState, useEffect } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useHotelStore } from '../../store/hotelContext'
import { useHistory } from '../../store/historyContext'
import { resolveImageUrl } from '../../services/hotelApi'
import StarRating from '../../components/StarRating'
import './index.scss'

const HistoryPage = () => {
  const { getHotelById } = useHotelStore()
  const { history, clearHistory } = useHistory()
  const [historyHotels, setHistoryHotels] = useState([])

  useEffect(() => {
    const hotels = history
      .map(item => {
        const hotel = getHotelById(item.hotelId)
        return hotel ? { ...hotel, visitTime: item.visitTime } : null
      })
      .filter(Boolean)
    setHistoryHotels(hotels)
  }, [history, getHotelById])

  const handleHotelClick = (hotelId) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${hotelId}` })
  }

  const handleClear = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要清空浏览记录吗？',
      success: (res) => {
        if (res.confirm) {
          clearHistory()
          Taro.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  }

  const formatTime = (timeStr) => {
    const date = new Date(timeStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = String(date.getHours()).padStart(2, '0')
    const mins = String(date.getMinutes()).padStart(2, '0')
    return `${month}月${day}日 ${hours}:${mins}`
  }

  if (historyHotels.length === 0) {
    return (
      <View className='history-page'>
        <View className='empty-state'>
          <Text className='empty-text'>暂无浏览记录</Text>
          <Text className='empty-hint'>去首页看看有什么好酒店吧</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='history-page'>
      <View className='history-header'>
        <Text className='history-count'>共 {historyHotels.length} 条记录</Text>
        <Button className='clear-btn' onClick={handleClear}>清空记录</Button>
      </View>
      {historyHotels.map((hotel, idx) => (
        <View
          key={`${hotel.id}-${idx}`}
          className='history-card'
          onClick={() => handleHotelClick(hotel.id)}
        >
          <Image className='history-image' src={resolveImageUrl(hotel.imageUrl)} mode='aspectFill' />
          <View className='history-info'>
            <Text className='history-name'>{hotel.nameCn}</Text>
            <View className='history-stars'><StarRating star={hotel.star} /></View>
            <Text className='history-address'>{hotel.address}</Text>
            <View className='history-bottom'>
              <View className='history-price'>
                <Text className='price-symbol'>¥</Text>
                <Text className='price-num'>{hotel.price}</Text>
                <Text className='price-unit'>起/晚</Text>
              </View>
              <Text className='history-time'>{formatTime(hotel.visitTime)}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}

export default HistoryPage
