import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useHotelStore } from '../../store/hotelContext'
import { useFavorites } from '../../store/favoritesContext'
import { resolveImageUrl } from '../../services/hotelApi'
import StarRating from '../../components/StarRating'
import './index.scss'

const FavoritesPage = () => {
  const { getHotelById } = useHotelStore()
  const { favorites, toggleFavorite } = useFavorites()
  const [favHotels, setFavHotels] = useState([])

  useEffect(() => {
    const hotels = favorites
      .map(id => getHotelById(id))
      .filter(Boolean)
    setFavHotels(hotels)
  }, [favorites, getHotelById])

  const handleHotelClick = (hotelId) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${hotelId}` })
  }

  const handleRemove = (e, hotelId) => {
    e.stopPropagation()
    toggleFavorite(hotelId)
    Taro.showToast({ title: '已取消收藏', icon: 'none' })
  }

  if (favHotels.length === 0) {
    return (
      <View className='favorites-page'>
        <View className='empty-state'>
          <Text className='empty-icon'>♡</Text>
          <Text className='empty-text'>暂无收藏酒店</Text>
          <Text className='empty-hint'>浏览酒店详情时点击收藏按钮即可添加</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='favorites-page'>
      <View className='fav-count'>
        <Text>共 {favHotels.length} 家收藏</Text>
      </View>
      {favHotels.map(hotel => (
        <View
          key={hotel.id}
          className='fav-card'
          onClick={() => handleHotelClick(hotel.id)}
        >
          <Image className='fav-image' src={resolveImageUrl(hotel.imageUrl)} mode='aspectFill' />
          <View className='fav-info'>
            <Text className='fav-name'>{hotel.nameCn}</Text>
            <View className='fav-stars'><StarRating star={hotel.star} /></View>
            <Text className='fav-address'>{hotel.address}</Text>
            <View className='fav-bottom'>
              <View className='fav-price'>
                <Text className='price-symbol'>¥</Text>
                <Text className='price-num'>{hotel.price}</Text>
                <Text className='price-unit'>起/晚</Text>
              </View>
              <View className='fav-remove' onClick={(e) => handleRemove(e, hotel.id)}>
                <Text className='fav-remove-text'>取消收藏</Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}

export default FavoritesPage
