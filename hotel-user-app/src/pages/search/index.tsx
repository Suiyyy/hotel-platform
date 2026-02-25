import { useState } from 'react'
import { View, Text, Input, Button, Swiper, SwiperItem, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useHotelStore } from '../../store/hotelContext'
import { useTheme } from '../../store/themeContext'
import Calendar from '../../components/Calendar'
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
  const [showCalendar, setShowCalendar] = useState(false)
  const { searchHotels } = useHotelStore()
  const { isDark, toggleTheme } = useTheme()

  const handleSearch = () => {
    if (!checkInDate || !checkOutDate) {
      Taro.showToast({ title: '请选择日期', icon: 'none' })
      return
    }
    searchHotels({ keyword, checkInDate, checkOutDate })
    Taro.navigateTo({ url: '/pages/list/index' })
  }

  const handleDateSelect = (checkIn: string, checkOut: string) => {
    setCheckInDate(checkIn)
    setCheckOutDate(checkOut)
    setShowCalendar(false)
  }

  return (
    <View className='search-page'>
      <View className='theme-toggle'>
        <Text className='theme-toggle-btn' onClick={toggleTheme}>
          {isDark ? '切换日间' : '切换夜间'}
        </Text>
      </View>

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
          <View className='date-selector' onClick={() => setShowCalendar(true)}>
            <Text className={checkInDate ? 'date-text' : 'date-placeholder'}>
              {checkInDate || '选择入住日期'}
            </Text>
          </View>
        </View>

        <View className='form-item'>
          <Text className='form-label'>离店日期</Text>
          <View className='date-selector' onClick={() => setShowCalendar(true)}>
            <Text className={checkOutDate ? 'date-text' : 'date-placeholder'}>
              {checkOutDate || '选择离店日期'}
            </Text>
          </View>
        </View>

        <Button className='search-btn' onClick={handleSearch}>
          搜索酒店
        </Button>
      </View>

      {showCalendar && (
        <View className='calendar-overlay' onClick={() => setShowCalendar(false)}>
          <View className='calendar-popup' onClick={(e) => e.stopPropagation()}>
            <Calendar
              onDateSelect={handleDateSelect}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
            />
          </View>
        </View>
      )}
    </View>
  )
}

export default SearchPage
