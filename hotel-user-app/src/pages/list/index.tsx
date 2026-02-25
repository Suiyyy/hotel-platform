import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useHotelStore } from '../../store/hotelContext'
import type { IHotel } from '../../types/hotel'
import './index.scss'

type SortKey = 'price' | 'rating' | 'distance'

const PAGE_SIZE = 5

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'price', label: '价格' },
  { key: 'rating', label: '评分' },
  { key: 'distance', label: '距离' }
]

const sortHotels = (hotels: IHotel[], sortType: SortKey): IHotel[] => {
  const sorted = [...hotels]
  switch (sortType) {
    case 'price':
      return sorted.sort((a, b) => a.price - b.price)
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'distance':
      return sorted.sort((a, b) => a.distance - b.distance)
    default:
      return sorted
  }
}

const renderStars = (star: number) => {
  const stars = []
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Text key={i} className={`star ${i < star ? 'star-filled' : ''}`}>★</Text>
    )
  }
  return stars
}

const ListPage = () => {
  const [sortBy, setSortBy] = useState<SortKey>('price')
  const [displayedHotels, setDisplayedHotels] = useState<IHotel[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { getApprovedOnlineHotels, searchParams } = useHotelStore()

  const loadHotels = (isRefresh = false) => {
    const page = isRefresh ? 1 : currentPage
    let hotels = getApprovedOnlineHotels()

    if (searchParams.keyword) {
      const keyword = searchParams.keyword.toLowerCase()
      hotels = hotels.filter(h =>
        h.nameCn.toLowerCase().includes(keyword) ||
        h.address.toLowerCase().includes(keyword)
      )
    }

    hotels = sortHotels(hotels, sortBy)

    const endIndex = page * PAGE_SIZE
    const newDisplayedHotels = hotels.slice(0, endIndex)

    setDisplayedHotels(newDisplayedHotels)
    setCurrentPage(page)
    setHasMore(endIndex < hotels.length)
  }

  useEffect(() => {
    loadHotels(true)
  }, [sortBy, searchParams])

  const handleHotelClick = (hotelId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${hotelId}` })
  }

  const handleScrollToLower = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1)
    }
  }

  useEffect(() => {
    if (currentPage > 1) {
      loadHotels(false)
    }
  }, [currentPage])

  return (
    <View className='list-page'>
      <View className='sort-tabs'>
        {sortOptions.map((option) => (
          <View
            key={option.key}
            className={`sort-tab ${sortBy === option.key ? 'sort-tab-active' : ''}`}
            onClick={() => setSortBy(option.key)}
          >
            <Text>{option.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView
        className='hotel-list'
        scrollY={true}
        onScrollToLower={handleScrollToLower}
      >
        {displayedHotels.map(hotel => (
          <View
            key={hotel.id}
            className='hotel-card'
            onClick={() => handleHotelClick(hotel.id)}
          >
            <Image className='hotel-image' src={hotel.imageUrl} mode='aspectFill' />
            <View className='hotel-info'>
              <Text className='hotel-name'>{hotel.nameCn}</Text>
              <View className='hotel-stars'>{renderStars(hotel.star)}</View>
              <Text className='hotel-address'>{hotel.address}</Text>
              <View className='hotel-meta'>
                <Text className='hotel-rating'>评分 {hotel.rating}</Text>
                <Text className='hotel-distance'>距您 {hotel.distance}km</Text>
              </View>
              <View className='hotel-price'>
                <Text className='price-label'>¥</Text>
                <Text className='price-value'>{hotel.price}</Text>
                <Text className='price-unit'>起/晚</Text>
              </View>
            </View>
          </View>
        ))}

        {hasMore && (
          <View className='loading-more'><Text>加载更多...</Text></View>
        )}
        {!hasMore && displayedHotels.length > 0 && (
          <View className='no-more'><Text>没有更多了</Text></View>
        )}
        {displayedHotels.length === 0 && (
          <View className='empty-state'><Text>暂无符合条件的酒店</Text></View>
        )}
      </ScrollView>
    </View>
  )
}

export default ListPage
