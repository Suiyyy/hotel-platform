import { useState } from 'react'
import { View, Text, Input, Button, Swiper, SwiperItem, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useHotelStore } from '../../store/hotelContext'
import './index.scss'

const bannerImages = [
  'https://picsum.photos/seed/banner1/750/300',
  'https://picsum.photos/seed/banner2/750/300',
  'https://picsum.photos/seed/banner3/750/300'
]

const SearchPage = () => {
  const [keyword, setKeyword] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const { searchHotels } = useHotelStore()

  const handleSearch = () => {
    if (!checkInDate || !checkOutDate) {
      Taro.showToast({ title: '请选择日期', icon: 'none' })
      return
    }
    searchHotels({ keyword, checkInDate, checkOutDate })
    Taro.navigateTo({ url: '/pages/list/index' })
  }

  const handleDatePicker = (type: 'checkIn' | 'checkOut') => {
    try {
      const date = new Date()
      const formatDate = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

      if (type === 'checkIn') {
        setCheckInDate(formatDate(date))
        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)
        setCheckOutDate(formatDate(nextDay))
      } else {
        setCheckOutDate(formatDate(date))
      }
      Taro.showToast({ title: '已选择日期', icon: 'success' })
    } catch (error) {
      console.error('Date picker error:', error)
      Taro.showToast({ title: '选择日期失败', icon: 'none' })
    }
  }

  return (
    <View className='search-page'>
      <Swiper className='banner-swiper' indicatorDots autoplay circular>
        {bannerImages.map((img, index) => (
          <SwiperItem key={index}>
            <Image className='banner-image' src={img} mode='aspectFill' />
          </SwiperItem>
        ))}
      </Swiper>

      <View className='search-form'>
        <View className='form-item'>
          <Text className='form-label'>目的地</Text>
          <Input
            className='form-input'
            placeholder='请输入酒店名称或地址'
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='form-label'>入住日期</Text>
          <View className='date-selector' onClick={() => handleDatePicker('checkIn')}>
            <Text className={checkInDate ? 'date-text' : 'date-placeholder'}>
              {checkInDate || '选择入住日期'}
            </Text>
          </View>
        </View>

        <View className='form-item'>
          <Text className='form-label'>离店日期</Text>
          <View className='date-selector' onClick={() => handleDatePicker('checkOut')}>
            <Text className={checkOutDate ? 'date-text' : 'date-placeholder'}>
              {checkOutDate || '选择离店日期'}
            </Text>
          </View>
        </View>

        <Button className='search-btn' onClick={handleSearch}>
          搜索酒店
        </Button>
      </View>
    </View>
  )
}

export default SearchPage
