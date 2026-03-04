import { useState, useEffect } from 'react';
import { View, Text, Input, Button, Swiper, SwiperItem, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useHotelStore } from '../../store/hotelContext';
import { aiSearch } from '../../services/hotelApi';
import Calendar from '../../components/Calendar';
import './index.scss';

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState('domestic');
  const [location, setLocation] = useState('南京');
  const [keyword, setKeyword] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [nights, setNights] = useState(1);
  const [selectedQuickTags, setSelectedQuickTags] = useState([]);
  const [selectedRecommendedTags, setSelectedRecommendedTags] = useState([]);
  const [aiQuery, setAiQuery] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const [cityDropdownVisible, setCityDropdownVisible] = useState(false);
  const [guestsDropdownVisible, setGuestsDropdownVisible] = useState(false);
  const [priceFilterVisible, setPriceFilterVisible] = useState(false);
  const [locationInfo, setLocationInfo] = useState('');
  const [isLocated, setIsLocated] = useState(false);
  
  const cities = [
    { id: 0, name: '不选择城市' },
    { id: 1, name: '北京' },
    { id: 2, name: '上海' },
    { id: 3, name: '广州' },
    { id: 4, name: '深圳' },
    { id: 5, name: '南京' },
    { id: 6, name: '杭州' },
    { id: 7, name: '成都' },
    { id: 8, name: '重庆' },
    { id: 9, name: '武汉' },
    { id: 10, name: '西安' }
  ];
  const { searchHotels, updateSearchParams } = useHotelStore();

  const tabs = [
    { key: 'domestic', label: '国内' },
    { key: 'international', label: '海外' },
    { key: 'homestay', label: '民宿' },
    { key: 'hourly', label: '钟点房' }
  ];

  const quickTags = [
    { id: '1', name: '夫子庙/秦淮河风光带' },
    { id: '2', name: '免费停车场' },
    { id: '3', name: '双床房' },
    { id: '4', name: '新街口' }
  ];

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date) => {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const weekDay = weekDays[date.getDay()];
      const isToday = date.toDateString() === today.toDateString();
      const isTomorrow = date.toDateString() === tomorrow.toDateString();
      const dayLabel = isToday ? '今天' : (isTomorrow ? '明天' : weekDay);
      return `${month}月${day}日 ${dayLabel}`;
    };

    setCheckInDate(formatDate(today));
    setCheckOutDate(formatDate(tomorrow));
    
    // Retrieve selected city from storage
    const selectedCity = Taro.getStorageSync('selectedCity');
    if (selectedCity) {
      setLocation(selectedCity);
    }
    
    // Retrieve selected guests from storage
    const selectedGuests = Taro.getStorageSync('selectedGuests');
    if (selectedGuests) {
      setRooms(selectedGuests.rooms);
      setAdults(selectedGuests.adults);
      setChildren(selectedGuests.children);
    }
    
    // Retrieve selected dates from storage
    const selectedDates = Taro.getStorageSync('selectedDates');
    if (selectedDates) {
      setCheckInDate(selectedDates.checkInDate);
      setCheckOutDate(selectedDates.checkOutDate);
      setNights(selectedDates.nights);
    }
  }, []);

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) {
      Taro.showToast({ title: '请输入搜索内容', icon: 'none' });
      return;
    }
    setAiSearching(true);
    try {
      const res = await aiSearch(aiQuery.trim());
      const hotels = res.data || res;
      Taro.setStorageSync('aiSearchResults', JSON.stringify(hotels));
      Taro.setStorageSync('aiSearchQuery', aiQuery.trim());
      Taro.navigateTo({ url: '/pages/list/index?ai=1' });
    } catch {
      Taro.showToast({ title: 'AI 搜索失败，请稍后重试', icon: 'none' });
    } finally {
      setAiSearching(false);
    }
  };

  const handleSearch = () => {
    if (!checkInDate || !checkOutDate) {
      Taro.showToast({
        title: '请选择日期',
        icon: 'none'
      });
      return;
    }
    
    // 处理不选择城市的情况
    const searchLocation = location === '不选择城市' ? '' : location;
    
    searchHotels({ 
      keyword, 
      checkInDate,
      checkOutDate,
      location: searchLocation,
      priceRange: selectedPriceRange,
      starRating: selectedStarRating,
      quickTags: selectedQuickTags,
      recommendedTags: selectedRecommendedTags
    });
    Taro.navigateTo({
      url: '/pages/list/index'
    });
  };

  const handleDateSelect = (startDate, endDate, nightCount) => {
    setCheckInDate(startDate);
    setCheckOutDate(endDate);
    setNights(nightCount);
  };

  const handleBannerClick = (hotelId) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${hotelId}`
    });
  };

  const bannerData = [
    {
      id: '1',
      image: 'https://picsum.photos/seed/banner1/1200/600',
      title: '上海外滩奢华体验',
      subtitle: '享受黄浦江美景',
      price: '¥1,299',
      tag: '限时优惠'
    },
    {
      id: '2',
      image: 'https://picsum.photos/seed/banner2/1200/600',
      title: '三亚海景度假酒店',
      subtitle: '阳光沙滩放松之旅',
      price: '¥999',
      tag: '热门推荐'
    },
    {
      id: '3',
      image: 'https://picsum.photos/seed/banner3/1200/600',
      title: '北京故宫周边酒店',
      subtitle: '感受历史文化底蕴',
      price: '¥899',
      tag: '文化之旅'
    }
  ];

  const recommendedTags = [
    { id: '1', name: '亲子酒店', icon: '👨‍👩‍👧‍👦' },
    { id: '2', name: '商务出行', icon: '💼' },
    { id: '3', name: '情侣度假', icon: '💕' },
    { id: '4', name: '网红打卡', icon: '📸' },
    { id: '5', name: ' spa 酒店', icon: '🧖' },
    { id: '6', name: '宠物友好', icon: '🐶' }
  ];

  const handleLocationClick = () => {
    // 实际功能：打开城市选择器
    setCityDropdownVisible(!cityDropdownVisible);
  };
  
  const handleCitySelect = (cityName) => {
    setLocation(cityName);
    setCityDropdownVisible(false);
    if (cityName === '不选择城市') {
      Taro.removeStorageSync('selectedCity');
      // 清除搜索参数中的location
      if (updateSearchParams) {
        updateSearchParams({ location: '' });
      }
    } else {
      Taro.setStorageSync('selectedCity', cityName);
      // 更新搜索参数中的location
      if (updateSearchParams) {
        updateSearchParams({ location: cityName });
      }
    }
  };
  
  const handleMyLocationClick = () => {
    // 实际功能：获取用户当前位置
    Taro.getLocation({
      type: 'wgs84',
      success: function (res) {
        const latitude = res.latitude;
        const longitude = res.longitude;
        // 这里可以调用逆地理编码API获取城市名称
        // 模拟获取到的位置信息
        const cityName = '合肥';
        const locationDetail = '创景花园附近';
        const fullLocationInfo = `${cityName}，${locationDetail}`;
        
        setLocation('我的位置');
        setLocationInfo(fullLocationInfo);
        setIsLocated(true);
        Taro.setStorageSync('selectedCity', '我的位置');
        
        // 显示定位成功的 toast 消息
        Taro.showToast({
          title: `已定位到 ${fullLocationInfo}`,
          icon: 'none',
          duration: 2000,
          image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231890ff"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
        });
      },
      fail: function (err) {
        Taro.showToast({
          title: '定位失败，请手动选择城市',
          icon: 'none',
          duration: 1000
        });
      }
    });
  };

  const handleGuestsClick = () => {
    // 实际功能：打开人数选择器
    setGuestsDropdownVisible(!guestsDropdownVisible);
  };
  
  const handleRoomChange = (change) => {
    const newRooms = Math.max(1, rooms + change);
    setRooms(newRooms);
  };
  
  const handleAdultChange = (change) => {
    const newAdults = Math.max(1, adults + change);
    setAdults(newAdults);
  };
  
  const handleChildChange = (change) => {
    const newChildren = Math.max(0, children + change);
    setChildren(newChildren);
  };
  
  const handleGuestsConfirm = () => {
    setGuestsDropdownVisible(false);
    const guestsData = { rooms, adults, children };
    Taro.setStorageSync('selectedGuests', guestsData);
  };

  const priceRanges = [
    { id: '1', label: '不限价格' },
    { id: '2', label: '¥0-300' },
    { id: '3', label: '¥301-500' },
    { id: '4', label: '¥501-800' },
    { id: '5', label: '¥801-1200' },
    { id: '6', label: '¥1201+' }
  ];

  const starRatings = [
    { id: '1', label: '不限星级' },
    { id: '2', label: '5星/豪华' },
    { id: '3', label: '4星/高档' },
    { id: '4', label: '3星/舒适' },
    { id: '5', label: '2星/经济' }
  ];

  const [selectedPriceRange, setSelectedPriceRange] = useState('1');
  const [selectedStarRating, setSelectedStarRating] = useState('1');

  const handlePriceFilterClick = () => {
    setPriceFilterVisible(!priceFilterVisible);
  };

  const handlePriceRangeSelect = (priceRangeId) => {
    setSelectedPriceRange(priceRangeId);
  };

  const handleStarRatingSelect = (starRatingId) => {
    setSelectedStarRating(starRatingId);
  };

  const handlePriceFilterConfirm = () => {
    setPriceFilterVisible(false);
    // 这里可以添加价格和星级筛选逻辑
    Taro.showToast({
      title: '筛选条件已应用',
      icon: 'success',
      duration: 1000
    });
  };

  const handleQuickTagClick = (tagName) => {
    // 实际功能：添加标签到搜索条件
    setSelectedQuickTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(tag => tag !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  };

  const handleRecommendedTagClick = (tagName) => {
    // 实际功能：添加标签到搜索条件
    setSelectedRecommendedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(tag => tag !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  };

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    // 实际功能：根据标签类型导航到不同页面或筛选结果
    // 暂时不跳转页面，只更新标签状态
    // if (tabKey === 'homestay') {
    //   Taro.navigateTo({
    //     url: '/pages/list/index?type=homestay'
    //   });
    // } else if (tabKey === 'hourly') {
    //   Taro.navigateTo({
    //     url: '/pages/list/index?type=hourly'
    //   });
    // }
  };

  return (
    <View className="search-page">
      <View className="banner-container">
        <Swiper className="banner-swiper" indicatorDots autoplay circular>
          {bannerData.map((banner, index) => (
            <SwiperItem key={index}>
              <View 
                className="banner-wrapper" 
                onClick={() => handleBannerClick(banner.id)}
                onTap={() => handleBannerClick(banner.id)}
              >
                <Image className="banner-image" src={banner.image} mode="aspectFill" />
                <View className="banner-overlay">
                  <View className="banner-content">
                    <View 
                      className="banner-tag" 
                      onClick={(e) => {
                        e.stopPropagation();
                        Taro.showToast({ title: banner.tag, icon: 'none' });
                      }}
                      onTap={(e) => {
                        e.stopPropagation();
                        Taro.showToast({ title: banner.tag, icon: 'none' });
                      }}
                    >
                      {banner.tag}
                    </View>
                    <Text 
                      className="banner-title" 
                      onClick={(e) => {
                        e.stopPropagation();
                        Taro.showToast({ title: banner.title, icon: 'none' });
                      }}
                      onTap={(e) => {
                        e.stopPropagation();
                        Taro.showToast({ title: banner.title, icon: 'none' });
                      }}
                    >
                      {banner.title}
                    </Text>
                    <Text 
                      className="banner-subtitle" 
                      onClick={(e) => {
                        e.stopPropagation();
                        Taro.showToast({ title: banner.subtitle, icon: 'none' });
                      }}
                      onTap={(e) => {
                        e.stopPropagation();
                        Taro.showToast({ title: banner.subtitle, icon: 'none' });
                      }}
                    >
                      {banner.subtitle}
                    </Text>
                    <Text 
                      className="banner-price" 
                      onClick={(e) => {
                        e.stopPropagation();
                        Taro.showToast({ title: banner.price, icon: 'none' });
                      }}
                      onTap={(e) => {
                        e.stopPropagation();
                        Taro.showToast({ title: banner.price, icon: 'none' });
                      }}
                    >
                      {banner.price}起/晚
                    </Text>
                  </View>
                </View>
              </View>
            </SwiperItem>
          ))}
        </Swiper>
      </View>

      <View className="tabs-container">
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? 'tab-active' : ''}`}
            onClick={() => handleTabClick(tab.key)}
            onTap={() => handleTabClick(tab.key)}
          >
            <Text className="tab-text">{tab.label}</Text>
            {activeTab === tab.key && <View className="tab-indicator" />}
          </View>
        ))}
      </View>

      <View className="ai-search-section">
        <View className="ai-search-header">
          <Text className="ai-search-icon">&#x2728;</Text>
          <Text className="ai-search-title">AI 智能搜索</Text>
        </View>
        <View className="ai-search-bar">
          <Input
            className="ai-search-input"
            placeholder="试试「南京有游泳池的五星酒店」"
            value={aiQuery}
            onInput={(e) => setAiQuery(e.detail.value)}
            onConfirm={handleAiSearch}
          />
          <View
            className={`ai-search-btn ${aiSearching ? 'ai-search-btn-loading' : ''}`}
            onClick={handleAiSearch}
            onTap={handleAiSearch}
          >
            <Text className="ai-search-btn-text">{aiSearching ? '搜索中...' : 'AI 搜索'}</Text>
          </View>
        </View>
      </View>

      <View className="search-form-container">
        {/* Location info display */}
        {isLocated && locationInfo && (
          <View className="location-info-bar">
            <View className="location-info-content">
              <Text className="location-info-icon">📍</Text>
              <Text className="location-info-text">已定位到 {locationInfo}</Text>
            </View>
          </View>
        )}
        
        <View className="location-search-row">
          <View className="location-selector-wrapper">
            <View 
              className="location-selector" 
              onClick={handleLocationClick}
              onTap={handleLocationClick}
            >
              <Text className="location-text">{location}</Text>
              <Text className={`location-arrow ${cityDropdownVisible ? 'arrow-up' : ''}`}>▼</Text>
            </View>
            
            {/* City dropdown */}
            {cityDropdownVisible && (
              <View className="city-dropdown">
                <ScrollView className="city-list" scrollY>
                  {cities.map(city => (
                    <View 
                      key={city.id} 
                      className={`city-item ${location === city.name ? 'city-item-selected' : ''}`}
                      onClick={() => handleCitySelect(city.name)}
                      onTap={() => handleCitySelect(city.name)}
                    >
                      <Text className="city-name">{city.name}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          <View className="location-divider" />
          <View className="search-input-wrapper">
            <Input
              className="search-input"
              placeholder="位置/品牌/酒店"
              value={keyword}
              onInput={(e) => setKeyword(e.detail.value)}
            />
            <View 
              className={`my-location-btn ${isLocated ? 'my-location-btn-located' : ''}`} 
              onClick={handleMyLocationClick}
              onTap={handleMyLocationClick}
            >
              <Text className="my-location-icon">📍</Text>
              <Text className="my-location-text">我的位置</Text>
              {isLocated && (
                <Text className="located-indicator">已定位</Text>
              )}
            </View>
          </View>
        </View>

        <View className="date-row" onClick={() => setCalendarVisible(true)} onTap={() => setCalendarVisible(true)}>
          <View className="date-item">
            <Text className="date-display">{checkInDate}</Text>
          </View>
          <Text className="date-separator">共{nights}晚</Text>
          <View className="date-item">
            <Text className="date-display">{checkOutDate}</Text>
          </View>
        </View>

        <View className="guests-row">
          <View className="guests-selector-wrapper">
            <View 
              className="guests-selector" 
              onClick={handleGuestsClick}
              onTap={handleGuestsClick}
            >
              <Text className="guests-text">{rooms}间房 {adults}成人 {children}儿童</Text>
              <Text className={`guests-arrow ${guestsDropdownVisible ? 'arrow-up' : ''}`}>▼</Text>
            </View>
            
            {/* Guests dropdown */}
            {guestsDropdownVisible && (
              <View className="guests-dropdown">
                <View className="guests-dropdown-content">
                  <View className="guests-section">
                    <Text className="guests-section-title">房间</Text>
                    <View className="guests-control">
                      <View 
                        className={`guests-btn ${rooms <= 1 ? 'guests-btn-disabled' : ''}`}
                        onClick={() => handleRoomChange(-1)}
                        onTap={() => handleRoomChange(-1)}
                      >
                        -
                      </View>
                      <Text className="guests-count">{rooms}</Text>
                      <View 
                        className="guests-btn"
                        onClick={() => handleRoomChange(1)}
                        onTap={() => handleRoomChange(1)}
                      >
                        +
                      </View>
                    </View>
                  </View>
                  
                  <View className="guests-section">
                    <Text className="guests-section-title">成人 18岁或以上</Text>
                    <View className="guests-control">
                      <View 
                        className={`guests-btn ${adults <= 1 ? 'guests-btn-disabled' : ''}`}
                        onClick={() => handleAdultChange(-1)}
                        onTap={() => handleAdultChange(-1)}
                      >
                        -
                      </View>
                      <Text className="guests-count">{adults}</Text>
                      <View 
                        className="guests-btn"
                        onClick={() => handleAdultChange(1)}
                        onTap={() => handleAdultChange(1)}
                      >
                        +
                      </View>
                    </View>
                  </View>
                  
                  <View className="guests-section">
                    <Text className="guests-section-title">儿童 0-17岁</Text>
                    <View className="guests-control">
                      <View 
                        className={`guests-btn ${children <= 0 ? 'guests-btn-disabled' : ''}`}
                        onClick={() => handleChildChange(-1)}
                        onTap={() => handleChildChange(-1)}
                      >
                        -
                      </View>
                      <Text className="guests-count">{children}</Text>
                      <View 
                        className="guests-btn"
                        onClick={() => handleChildChange(1)}
                        onTap={() => handleChildChange(1)}
                      >
                        +
                      </View>
                    </View>
                  </View>
                  
                  <View className="guests-confirm-btn-wrapper">
                    <Button 
                      className="guests-confirm-btn" 
                      onClick={handleGuestsConfirm}
                      onTap={handleGuestsConfirm}
                    >
                      确认
                    </Button>
                  </View>
                </View>
              </View>
            )}
          </View>
          <View className="guests-divider" />
          <View className="price-filter-wrapper">
            <View 
              className="price-filter" 
              onClick={handlePriceFilterClick}
              onTap={handlePriceFilterClick}
            >
              <Text className="price-filter-text">价格/星级</Text>
              <Text className={`price-filter-arrow ${priceFilterVisible ? 'arrow-up' : ''}`}>▼</Text>
            </View>
            
            {/* Price filter dropdown */}
            {priceFilterVisible && (
              <View className="price-filter-dropdown">
                <View className="price-filter-content">
                  <View className="filter-section">
                    <Text className="filter-section-title">价格范围</Text>
                    {priceRanges.map((range) => (
                      <View 
                        key={range.id} 
                        className={`filter-option ${selectedPriceRange === range.id ? 'filter-option-selected' : ''}`}
                        onClick={() => handlePriceRangeSelect(range.id)}
                        onTap={() => handlePriceRangeSelect(range.id)}
                      >
                        <Text className="filter-option-text">{range.label}</Text>
                        {selectedPriceRange === range.id && (
                          <Text className="filter-option-check">✓</Text>
                        )}
                      </View>
                    ))}
                  </View>
                  
                  <View className="filter-section">
                    <Text className="filter-section-title">酒店星级</Text>
                    {starRatings.map((rating) => (
                      <View 
                        key={rating.id} 
                        className={`filter-option ${selectedStarRating === rating.id ? 'filter-option-selected' : ''}`}
                        onClick={() => handleStarRatingSelect(rating.id)}
                        onTap={() => handleStarRatingSelect(rating.id)}
                      >
                        <Text className="filter-option-text">{rating.label}</Text>
                        {selectedStarRating === rating.id && (
                          <Text className="filter-option-check">✓</Text>
                        )}
                      </View>
                    ))}
                  </View>
                  
                  <View className="price-filter-confirm-btn-wrapper">
                    <Button 
                      className="price-filter-confirm-btn" 
                      onClick={handlePriceFilterConfirm}
                      onTap={handlePriceFilterConfirm}
                    >
                      确定
                    </Button>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        <View className="quick-tags">
          {quickTags.map((tag) => (
            <View 
              key={tag.id} 
              className={`quick-tag ${selectedQuickTags.includes(tag.name) ? 'quick-tag-selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleQuickTagClick(tag.name);
              }}
              onTap={(e) => {
                e.stopPropagation();
                handleQuickTagClick(tag.name);
              }}
            >
              <Text className="quick-tag-text">{tag.name}</Text>
            </View>
          ))}
        </View>

        <Button className="search-page-button" onClick={handleSearch} onTap={handleSearch}>
          查 询
        </Button>
      </View>

      <View className="recommended-tags">
        <Text 
          className="tags-title"
          onClick={() => Taro.showToast({ title: '推荐标签', icon: 'none' })}
          onTap={() => Taro.showToast({ title: '推荐标签', icon: 'none' })}
        >
          推荐标签
        </Text>
        <View className="tags-container">
          {recommendedTags.map((tag) => (
            <View 
              key={tag.id} 
              className={`tag-item ${selectedRecommendedTags.includes(tag.name) ? 'tag-item-selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleRecommendedTagClick(tag.name);
              }}
              onTap={(e) => {
                e.stopPropagation();
                handleRecommendedTagClick(tag.name);
              }}
            >
              <Text className="tag-icon">{tag.icon}</Text>
              <Text className="tag-name">{tag.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <Calendar
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        onDateSelect={handleDateSelect}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
      />
    </View>
  );
};

export default SearchPage;


