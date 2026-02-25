import { useState } from 'react'
import { View, Text, Input, Button, Swiper, SwiperItem, Image, Textarea } from '@tarojs/components'
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
  const [showAiModal, setShowAiModal] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
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

  const handleAiSearch = () => {
    const query = aiQuery.trim()
    if (!query) {
      Taro.showToast({ title: '请描述您的需求', icon: 'none' })
      return
    }
    setShowAiModal(false)
    Taro.navigateTo({ url: `/pages/list/index?aiQuery=${encodeURIComponent(query)}` })
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

        <View className='search-btn-group'>
          <Button className='search-btn' onClick={handleSearch}>
            搜索酒店
          </Button>
          <View className='ai-search-btn' onClick={() => setShowAiModal(true)}>
            <Text className='ai-search-icon'>AI</Text>
          </View>
        </View>
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

      {showAiModal && (
        <View className='ai-modal-overlay' onClick={() => setShowAiModal(false)}>
          <View className='ai-modal' onClick={(e) => e.stopPropagation()}>
            <Text className='ai-modal-title'>AI 智能找房</Text>
            <Text className='ai-modal-hint'>
              用自然语言描述您的需求，AI 帮您精准匹配
            </Text>
            <Textarea
              className='ai-modal-input'
              placeholder='例如：帮我找武汉光谷附近，适合带父母住的安静且带双早的酒店'
              value={aiQuery}
              onInput={(e) => setAiQuery(e.detail.value)}
              maxlength={200}
              autoFocus
            />
            <Button className='ai-modal-btn' onClick={handleAiSearch}>
              开始智能搜索
            </Button>
          </View>
        </View>
      )}
    </View>
  )
}

export default SearchPage
