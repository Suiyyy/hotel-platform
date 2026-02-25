import { useState, useCallback, useMemo } from 'react'
import { View, ScrollView } from '@tarojs/components'
import './index.scss'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => JSX.Element
  onScrollToLower?: () => void
  overscan?: number
}

function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  onScrollToLower,
  overscan = 5
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = items.length * itemHeight

  const { startIndex, endIndex } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2)
    return { startIndex: start, endIndex: end }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, i) => ({
      item,
      index: startIndex + i
    }))
  }, [items, startIndex, endIndex])

  const handleScroll = useCallback((e: { detail: { scrollTop: number } }) => {
    setScrollTop(e.detail.scrollTop)
  }, [])

  return (
    <ScrollView
      className='virtual-list-scroll'
      scrollY
      style={{ height: `${containerHeight}px` }}
      onScroll={handleScroll}
      onScrollToLower={onScrollToLower}
      lowerThreshold={100}
    >
      <View className='virtual-list-phantom' style={{ height: `${totalHeight}px` }}>
        <View
          className='virtual-list-content'
          style={{ transform: `translateY(${startIndex * itemHeight}px)` }}
        >
          {visibleItems.map(({ item, index }) => (
            <View
              key={index}
              className='virtual-list-item'
              style={{ height: `${itemHeight}px` }}
            >
              {renderItem(item, index)}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default VirtualList
