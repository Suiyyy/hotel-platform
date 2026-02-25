import { useState, useEffect, useMemo } from 'react'
import { View, Text, Image, ScrollView, Button, Swiper, SwiperItem } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useHotelStore } from '../../store/hotelContext'
import type { IHotel, IRoomType } from '../../types/hotel'
import './index.scss'

const renderStars = (star: number) => {
  const stars: JSX.Element[] = []
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Text key={i} className={`star ${i < star ? 'star-filled' : ''}`}>★</Text>
    )
  }
  return stars
}

/** 生成酒店图片列表（主图 + 额外占位图） */
const getHotelImages = (imageUrl: string, hotelId: string): string[] => {
  return [
    imageUrl,
    `https://picsum.photos/seed/${hotelId}-2/750/400`,
    `https://picsum.photos/seed/${hotelId}-3/750/400`,
    `https://picsum.photos/seed/${hotelId}-4/750/400`,
  ]
}

/** 按价格从低到高排序房型 */
const sortRoomsByPrice = (rooms: IRoomType[]): IRoomType[] =>
  [...rooms].sort((a, b) => a.price - b.price)

const DetailPage = () => {
  const [hotel, setHotel] = useState<IHotel | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = Taro.getCurrentInstance().router
  const { getHotelById } = useHotelStore()

  useEffect(() => {
    const hotelId = router?.params?.id
    if (hotelId) {
      const hotelData = getHotelById(hotelId)
      if (hotelData) setHotel(hotelData)
    }
  }, [router, getHotelById])

  const images = useMemo(
    () => hotel ? getHotelImages(hotel.imageUrl, hotel.id) : [],
    [hotel]
  )

  const sortedRooms = useMemo(
    () => hotel ? sortRoomsByPrice(hotel.roomTypes) : [],
    [hotel]
  )

  const lowestPrice = sortedRooms.length > 0 ? sortedRooms[0].price : hotel?.price

  if (!hotel) {
    return (
      <View className='detail-page loading'>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <View className='detail-page'>
      <ScrollView className='detail-scroll' scrollY>
        <View className='swiper-wrapper'>
          <Swiper
            className='hotel-swiper'
            indicatorDots={false}
            autoplay
            circular
            onChange={(e) => setCurrentSlide(e.detail.current)}
          >
            {images.map((img, index) => (
              <SwiperItem key={index}>
                <Image className='hotel-swiper-image' src={img} mode='aspectFill' />
              </SwiperItem>
            ))}
          </Swiper>
          <View className='swiper-indicator'>
            <Text className='swiper-indicator-text'>
              {currentSlide + 1}/{images.length}
            </Text>
          </View>
        </View>

        <View className='hotel-detail-info'>
          <Text className='hotel-detail-name'>{hotel.nameCn}</Text>
          {hotel.nameEn && (
            <Text className='hotel-detail-name-en'>{hotel.nameEn}</Text>
          )}

          <View className='hotel-detail-stars'>{renderStars(hotel.star)}</View>

          <View className='hotel-detail-meta'>
            <Text className='meta-item'>评分 {hotel.rating}</Text>
            <Text className='meta-item'>距您 {hotel.distance}km</Text>
          </View>

          <View className='hotel-detail-section'>
            <Text className='section-title'>地址</Text>
            <Text className='section-content'>{hotel.address}</Text>
          </View>

          <View className='hotel-detail-section'>
            <Text className='section-title'>联系方式</Text>
            <Text className='section-content'>{hotel.phone}</Text>
          </View>

          <View className='hotel-detail-section'>
            <Text className='section-title'>开业时间</Text>
            <Text className='section-content'>{hotel.openDate}</Text>
          </View>

          <View className='hotel-detail-section'>
            <Text className='section-title'>简介</Text>
            <Text className='section-content'>{hotel.description}</Text>
          </View>

          <View className='hotel-detail-section'>
            <Text className='section-title'>设施服务</Text>
            <View className='facilities-list'>
              {hotel.facilities.map((facility, index) => (
                <View key={index} className='facility-tag'>{facility}</View>
              ))}
            </View>
          </View>

          <View className='hotel-detail-section'>
            <Text className='section-title'>房型（按价格排序）</Text>
            {sortedRooms.map((room, index) => (
              <View key={room.id} className='room-item'>
                <View className='room-info'>
                  <Text className='room-name'>
                    {room.name}
                    {index === 0 && <Text className='lowest-price-tag'>最低价</Text>}
                  </Text>
                  <Text className='room-detail'>{room.area}㎡ · {room.bedType}</Text>
                </View>
                <View className='room-price'>
                  <Text className='price-label'>¥</Text>
                  <Text className='price-value'>{room.price}</Text>
                  <Text className='price-unit'>/晚</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className='detail-footer'>
        <View className='footer-price'>
          <Text className='footer-price-label'>¥</Text>
          <Text className='footer-price-value'>{lowestPrice}</Text>
          <Text className='footer-price-unit'>起/晚</Text>
        </View>
        <Button className='footer-btn'>预订</Button>
      </View>
    </View>
  )
}

export default DetailPage
