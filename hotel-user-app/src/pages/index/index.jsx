import { useState } from 'react';
import { View, Text, Image, Swiper, SwiperItem, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

export default function Index() {
  const [activeTab, setActiveTab] = useState('domestic');

  const tabs = [
    { key: 'domestic', label: '国内酒店' },
    { key: 'international', label: '国际酒店' },
    { key: 'homestay', label: '民宿' },
    { key: 'hourly', label: '钟点房' }
  ];

  const quickAccess = [
    { id: '1', icon: '🏨', label: '酒店', action: () => Taro.navigateTo({ url: '/pages/search/index' }) },
    { id: '2', icon: '✈️', label: '机票', action: () => Taro.navigateTo({ url: '/pages/flight/index' }) },
    { id: '3', icon: '🚄', label: '火车票', action: () => Taro.navigateTo({ url: '/pages/train/index' }) },
    { id: '4', icon: '🏖️', label: '度假', action: () => Taro.navigateTo({ url: '/pages/vacation/index' }) }
  ];

  const recommendedDestinations = [
    { id: '1', name: '上海', image: 'https://picsum.photos/seed/shanghai/300/200', price: '¥688起' },
    { id: '2', name: '北京', image: 'https://picsum.photos/seed/beijing/300/200', price: '¥599起' },
    { id: '3', name: '广州', image: 'https://picsum.photos/seed/guangzhou/300/200', price: '¥499起' },
    { id: '4', name: '深圳', image: 'https://picsum.photos/seed/shenzhen/300/200', price: '¥528起' }
  ];

  const hotDeals = [
    { id: '1', title: '上海外滩华尔道夫酒店', image: 'https://picsum.photos/seed/hotel1/300/200', originalPrice: '¥2288', price: '¥1288', discount: '5.6折' },
    { id: '2', title: '北京国贸大酒店', image: 'https://picsum.photos/seed/hotel2/300/200', originalPrice: '¥1988', price: '¥999', discount: '5.0折' },
    { id: '3', title: '广州四季酒店', image: 'https://picsum.photos/seed/hotel3/300/200', originalPrice: '¥1688', price: '¥888', discount: '5.2折' }
  ];

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    // 实际功能：切换标签并刷新内容
    Taro.showToast({
      title: `已切换到${tabs.find(t => t.key === tabKey).label}`,
      icon: 'success',
      duration: 1000
    });
  };

  const handleDestinationClick = (destination) => {
    // 实际功能：前往目的地搜索
    Taro.navigateTo({
      url: `/pages/search/index?destination=${encodeURIComponent(destination.name)}`
    });
  };

  const handleDealClick = (deal) => {
    // 实际功能：查看酒店详情
    Taro.navigateTo({
      url: `/pages/detail/index?id=${deal.id}&name=${encodeURIComponent(deal.title)}`
    });
  };

  const handleSearchClick = () => {
    Taro.navigateTo({ url: '/pages/search/index' });
  };

  return (
    <View className="home-page">
      {/* 顶部搜索栏 */}
      <View className="top-search" onClick={handleSearchClick} onTap={handleSearchClick}>
        <View className="search-box">
          <Text className="search-icon">🔍</Text>
          <Text className="search-text">搜索酒店、城市、景点</Text>
        </View>
      </View>

      {/* 快速访问 */}
      <View className="quick-access">
        {quickAccess.map((item) => (
          <View 
            key={item.id} 
            className="quick-item"
            onClick={item.action}
            onTap={item.action}
          >
            <View className="quick-icon">{item.icon}</View>
            <Text className="quick-label">{item.label}</Text>
          </View>
        ))}
      </View>

      {/* 推荐目的地 */}
      <View className="section">
        <View className="section-header">
          <Text className="section-title">热门目的地</Text>
          <Text 
            className="section-more"
            onClick={() => Taro.navigateTo({ url: '/pages/destinations/index' })}
            onTap={() => Taro.navigateTo({ url: '/pages/destinations/index' })}
          >
            更多
          </Text>
        </View>
        <ScrollView className="destination-scroll" scrollX>
          {recommendedDestinations.map((destination) => (
            <View 
              key={destination.id} 
              className="destination-item"
              onClick={() => handleDestinationClick(destination)}
              onTap={() => handleDestinationClick(destination)}
            >
              <Image className="destination-image" src={destination.image} mode="aspectFill" />
              <Text className="destination-name">{destination.name}</Text>
              <Text className="destination-price">{destination.price}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 热门 Deals */}
      <View className="section">
        <View className="section-header">
          <Text className="section-title">限时特惠</Text>
          <Text 
            className="section-more"
            onClick={() => Taro.navigateTo({ url: '/pages/deals/index' })}
            onTap={() => Taro.navigateTo({ url: '/pages/deals/index' })}
          >
            更多
          </Text>
        </View>
        <View className="deals-container">
          {hotDeals.map((deal) => (
            <View 
              key={deal.id} 
              className="deal-item"
              onClick={() => handleDealClick(deal)}
              onTap={() => handleDealClick(deal)}
            >
              <Image className="deal-image" src={deal.image} mode="aspectFill" />
              <View className="deal-info">
                <Text className="deal-title">{deal.title}</Text>
                <View className="deal-price-row">
                  <Text className="deal-price">{deal.price}</Text>
                  <Text className="deal-original-price">{deal.originalPrice}</Text>
                  <Text className="deal-discount">{deal.discount}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 底部导航 */}
      <View className="bottom-nav">
        <View 
          className="nav-item active"
          onClick={() => Taro.showToast({ title: '首页', icon: 'none' })}
          onTap={() => Taro.showToast({ title: '首页', icon: 'none' })}
        >
          <Text className="nav-icon">🏠</Text>
          <Text className="nav-text">首页</Text>
        </View>
        <View 
          className="nav-item"
          onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}
          onTap={() => Taro.navigateTo({ url: '/pages/search/index' })}
        >
          <Text className="nav-icon">🔍</Text>
          <Text className="nav-text">搜索</Text>
        </View>
        <View 
          className="nav-item"
          onClick={() => Taro.showToast({ title: '订单', icon: 'none' })}
          onTap={() => Taro.showToast({ title: '订单', icon: 'none' })}
        >
          <Text className="nav-icon">📋</Text>
          <Text className="nav-text">订单</Text>
        </View>
        <View 
          className="nav-item"
          onClick={() => Taro.showToast({ title: '我的', icon: 'none' })}
          onTap={() => Taro.showToast({ title: '我的', icon: 'none' })}
        >
          <Text className="nav-icon">👤</Text>
          <Text className="nav-text">我的</Text>
        </View>
      </View>
    </View>
  );
}