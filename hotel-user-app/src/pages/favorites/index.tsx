import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useHotelStore } from '../../store/hotelContext'
import { useFavorites } from '../../store/favoritesContext'
import type { IHotel } from '../../types/hotel'
import './index.scss'

const FavoritesPage = () => {
  const { favorites } = useFavorites()
  const { getHotelById } = useHotelStore()

  const favoriteHotels = favorites
    .map(id => getHotelById(id))
    .filter((h): h is IHotel => !!h)

  const handleHotelClick = (hotelId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${hotelId}` })
  }

  return (
    <View className='favorites-page'>
      {favoriteHotels.length > 0 ? (
        favoriteHotels.map(hotel => (
          <View key={hotel.id} className='fav-card' onClick={() => handleHotelClick(hotel.id)}>
            <Image className='fav-image' src={hotel.imageUrl} mode='aspectFill' />
            <View className='fav-info'>
              <Text className='fav-name'>{hotel.nameCn}</Text>
              <Text className='fav-address'>{hotel.address}</Text>
              <View className='fav-bottom'>
                <Text className='fav-rating'>评分 {hotel.rating}</Text>
                <View className='fav-price'>
                  <Text className='fav-price-symbol'>¥</Text>
                  <Text className='fav-price-value'>{hotel.price}</Text>
                  <Text className='fav-price-unit'>起/晚</Text>
                </View>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View className='empty-state'>
          <Text className='empty-text'>暂无收藏酒店</Text>
          <Text className='empty-hint'>浏览酒店详情时点击收藏按钮添加</Text>
        </View>
      )}
    </View>
  )
}

export default FavoritesPage
