import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useHotelStore } from '../../store/hotelContext'
import { fetchPublicHotelsPaged } from '../../services/hotelApi'
import { onPriceUpdate } from '../../services/wsClient'
import VirtualList from '../../components/VirtualList'
import StarRating from '../../components/StarRating'
import { SORT_OPTIONS } from '../../utils/constants'
import type { IHotel } from '../../types/hotel'
import './index.scss'

type SortKey = 'price' | 'rating' | 'distance'

const PAGE_SIZE = 10
const ITEM_HEIGHT = 140

const sortOrderMap: Record<SortKey, 'asc' | 'desc'> = {
  price: 'asc',
  rating: 'desc',
  distance: 'asc'
}

const ListPage = () => {
  const [sortBy, setSortBy] = useState<SortKey>('price')
  const [displayedHotels, setDisplayedHotels] = useState<IHotel[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const { searchParams } = useHotelStore()

  const loadHotels = useCallback(async (page: number, reset = false) => {
    if (loading) return
    setLoading(true)
    try {
      const result = await fetchPublicHotelsPaged({
        keyword: searchParams.keyword || undefined,
        sort: sortBy,
        order: sortOrderMap[sortBy],
        page,
        pageSize: PAGE_SIZE
      })
      const newList = reset ? result.data : [...displayedHotels, ...result.data]
      setDisplayedHotels(newList)
      setCurrentPage(page)
      setHasMore(newList.length < result.total)
    } catch {
      // 服务端不可用时保持当前数据
    } finally {
      setLoading(false)
    }
  }, [sortBy, searchParams, displayedHotels, loading])

  // 排序或搜索条件变化时重新加载
  useEffect(() => {
    loadHotels(1, true)
  }, [sortBy, searchParams])

  // WebSocket 实时价格更新
  useEffect(() => {
    const unsubscribe = onPriceUpdate((hotelId, newPrice) => {
      setDisplayedHotels(prev =>
        prev.map(h => h.id === hotelId ? { ...h, price: newPrice } : h)
      )
    })
    return unsubscribe
  }, [])

  const handleHotelClick = (hotelId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${hotelId}` })
  }

  const handleScrollToLower = () => {
    if (hasMore && !loading) {
      loadHotels(currentPage + 1, false)
    }
  }

  const renderHotelCard = useCallback((hotel: IHotel) => (
    <View
      className='hotel-card'
      onClick={() => handleHotelClick(hotel.id)}
    >
      <Image className='hotel-image' src={hotel.imageUrl} mode='aspectFill' />
      <View className='hotel-info'>
        <Text className='hotel-name'>{hotel.nameCn}</Text>
        <View className='hotel-stars'><StarRating star={hotel.star} /></View>
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
  ), [])

  const systemInfo = Taro.getSystemInfoSync()
  const containerHeight = systemInfo.windowHeight - 50

  return (
    <View className='list-page'>
      <View className='sort-tabs'>
        {SORT_OPTIONS.map((option) => (
          <View
            key={option.key}
            className={`sort-tab ${sortBy === option.key ? 'sort-tab-active' : ''}`}
            onClick={() => setSortBy(option.key)}
          >
            <Text>{option.label}</Text>
          </View>
        ))}
      </View>

      {displayedHotels.length > 0 ? (
        <VirtualList
          items={displayedHotels}
          itemHeight={ITEM_HEIGHT}
          containerHeight={containerHeight}
          renderItem={renderHotelCard}
          onScrollToLower={handleScrollToLower}
          overscan={3}
        />
      ) : (
        <View className='empty-state'>
          <Text>{loading ? '加载中...' : '暂无符合条件的酒店'}</Text>
        </View>
      )}

      {loading && displayedHotels.length > 0 && (
        <View className='loading-more'><Text>加载更多...</Text></View>
      )}
      {!hasMore && displayedHotels.length > 0 && (
        <View className='no-more'><Text>没有更多了</Text></View>
      )}
    </View>
  )
}

export default ListPage
