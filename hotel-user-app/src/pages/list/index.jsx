import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useHotelStore } from '../../store/hotelContext';
import Calendar from '../../components/Calendar';
import './index.scss';

const ListPage = () => {
  const [sortBy, setSortBy] = useState('recommended');
  const [sortOrder, setSortOrder] = useState('desc');
  const [displayedHotels, setDisplayedHotels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [priceFilterVisible, setPriceFilterVisible] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState('1');
  const [selectedStarRating, setSelectedStarRating] = useState('1');
  const [cityDropdownVisible, setCityDropdownVisible] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [isLocated, setIsLocated] = useState(false);
  const [locationInfo, setLocationInfo] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [nights, setNights] = useState(1);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [pointsEnabled, setPointsEnabled] = useState(false);
  const [viewedHotels, setViewedHotels] = useState([]);
  const { getApprovedOnlineHotels, searchParams, updateSearchParams } = useHotelStore();

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

  const PAGE_SIZE = 10;

  const sortOptions = [
    { key: 'recommended', label: '欢迎度排序' },
    { key: 'distance', label: '位置距离' },
    { key: 'price', label: '价格/星级' },
    { key: 'filter', label: '筛选' }
  ];

  const filterOptions = [
    {
      category: '酒店类型',
      options: [
        { id: 'type-1', label: '经济型' },
        { id: 'type-2', label: '舒适型' },
        { id: 'type-3', label: '高档型' },
        { id: 'type-4', label: '豪华型' },
        { id: 'type-5', label: '民宿' },
        { id: 'type-6', label: '青旅' }
      ]
    },
    {
      category: '设施服务',
      options: [
        { id: 'facility-1', label: '免费WiFi' },
        { id: 'facility-2', label: '停车场' },
        { id: 'facility-3', label: '健身房' },
        { id: 'facility-4', label: '游泳池' },
        { id: 'facility-5', label: '早餐' },
        { id: 'facility-6', label: '会议室' },
        { id: 'facility-7', label: '自助洗衣' },
        { id: 'facility-8', label: '行李寄存' },
        { id: 'facility-9', label: '24小时前台' },
        { id: 'facility-10', label: '餐厅' }
      ]
    },
    {
      category: '特色',
      options: [
        { id: 'feature-1', label: '商务出行' },
        { id: 'feature-2', label: '地铁周边' },
        { id: 'feature-3', label: '步行可达' },
        { id: 'feature-4', label: '性价比' },
        { id: 'feature-5', label: '背包客' },
        { id: 'feature-6', label: '低预算' },
        { id: 'feature-7', label: '江景' },
        { id: 'feature-8', label: '地标景观' },
        { id: 'feature-9', label: '蜜月旅行' }
      ]
    },
    {
      category: '品牌',
      options: [
        { id: 'brand-1', label: '汉庭' },
        { id: 'brand-2', label: '如家' },
        { id: 'brand-3', label: '宜必思' },
        { id: 'brand-4', label: '全季' },
        { id: 'brand-5', label: '亚朵' },
        { id: 'brand-6', label: '希尔顿' },
        { id: 'brand-7', label: '洲际' },
        { id: 'brand-8', label: '万豪' },
        { id: 'brand-9', label: '凯悦' },
        { id: 'brand-10', label: '悦榕庄' }
      ]
    }
  ];

  // 从筛选选项中获取所有标签
  const tagOptions = [];
  const filterIdToLabel = {};
  filterOptions.forEach(category => {
    category.options.forEach(option => {
      tagOptions.push({ id: option.id, label: option.label });
      filterIdToLabel[option.id] = option.label;
    });
  });

  // 初始化数据
  useEffect(() => {
    // 从storage中获取日期
    const selectedDates = Taro.getStorageSync('selectedDates');
    if (selectedDates) {
      setCheckInDate(selectedDates.checkInDate);
      setCheckOutDate(selectedDates.checkOutDate);
      setNights(selectedDates.nights);
    } else {
      // 初始化日期
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

      // 如果没有存储的日期，使用默认日期
      setCheckInDate(formatDate(today));
      setCheckOutDate(formatDate(tomorrow));
      setNights(1);
    }
    
    // 从storage中获取城市
    const selectedCity = Taro.getStorageSync('selectedCity');
    if (selectedCity) {
      if (updateSearchParams) {
        updateSearchParams({ location: selectedCity });
      }
    } else {
      // 如果没有存储的城市，默认设置为"不选择城市"
      if (updateSearchParams) {
        updateSearchParams({ location: '不选择城市' });
      }
    }
  }, [updateSearchParams]);
  
  // 加载酒店数据
  useEffect(() => {
    // 从本地存储中加载筛选参数
    const savedSortBy = Taro.getStorageSync('sortBy');
    if (savedSortBy) {
      setSortBy(savedSortBy);
    }
    
    const savedPriceRange = Taro.getStorageSync('priceRange');
    if (savedPriceRange) {
      setSelectedPriceRange(savedPriceRange);
    }
    
    const savedStarRating = Taro.getStorageSync('starRating');
    if (savedStarRating) {
      setSelectedStarRating(savedStarRating);
    }
    
    const savedKeyword = Taro.getStorageSync('keyword');
    if (savedKeyword) {
      setKeyword(savedKeyword);
    }
    
    const savedQuickTags = Taro.getStorageSync('quickTags');
    if (savedQuickTags) {
      setSelectedTags(savedQuickTags);
    }
    
    // 从本地存储中加载浏览历史
    const savedViewedHotels = Taro.getStorageSync('viewedHotels');
    if (savedViewedHotels) {
      setViewedHotels(savedViewedHotels);
    }
    
    // 确保所有数据初始化后再加载酒店
    setTimeout(() => {
      loadHotels(true);
    }, 100);
  }, []); // 空依赖数组，只在组件首次加载时运行一次
  
  const handleDateSelect = (startDate, endDate, nightCount) => {
    // 转换日期格式为与初始化时一致的格式
    const formatDateForDisplay = (dateString) => {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const weekDay = weekDays[date.getDay()];
      const isToday = date.toDateString() === today.toDateString();
      const isTomorrow = date.toDateString() === tomorrow.toDateString();
      const dayLabel = isToday ? '今天' : (isTomorrow ? '明天' : weekDay);
      return `${month}月${day}日 ${dayLabel}`;
    };
    
    const formattedStartDate = formatDateForDisplay(startDate);
    const formattedEndDate = formatDateForDisplay(endDate);
    
    setCheckInDate(formattedStartDate);
    setCheckOutDate(formattedEndDate);
    setNights(nightCount);
    
    if (updateSearchParams) {
      updateSearchParams({ 
        checkInDate: startDate, 
        checkOutDate: endDate, 
        nights: nightCount 
      });
    }
    
    // 保存日期到本地存储
    Taro.setStorageSync('selectedDates', {
      checkInDate: startDate,
      checkOutDate: endDate,
      nights: nightCount
    });
    
    // 重新加载酒店列表
    loadHotels(true);
  };

  const loadHotels = (isRefresh = false, overridePointsEnabled = null, overrideFilters = null) => {
    const page = isRefresh ? 1 : currentPage + 1;
    let hotels = getApprovedOnlineHotels();

    // 从本地存储中获取筛选参数
    const savedKeyword = Taro.getStorageSync('keyword');
    const savedPriceRange = Taro.getStorageSync('priceRange');
    const savedStarRating = Taro.getStorageSync('starRating');
    const savedQuickTags = Taro.getStorageSync('quickTags') || [];

    // Apply filters
    const currentKeyword = searchParams.keyword || savedKeyword || '';
    if (currentKeyword) {
      const keyword = currentKeyword.toLowerCase();
      hotels = hotels.filter(h => 
        h.nameCn.toLowerCase().includes(keyword) || 
        h.address.toLowerCase().includes(keyword)
      );
    }

    if (searchParams.location && searchParams.location !== '我的位置' && searchParams.location !== '不选择城市') {
      hotels = hotels.filter(h => 
        h.address.includes(searchParams.location)
      );
    }

    if ((searchParams.priceRange && searchParams.priceRange !== '1') || savedPriceRange) {
      const priceRange = searchParams.priceRange || savedPriceRange;
      hotels = hotels.filter(h => {
        switch(priceRange) {
          case '2': return h.price <= 300;
          case '3': return h.price > 300 && h.price <= 500;
          case '4': return h.price > 500 && h.price <= 800;
          case '5': return h.price > 800 && h.price <= 1200;
          case '6': return h.price > 1200;
          default: return true;
        }
      });
    }

    if ((searchParams.starRating && searchParams.starRating !== '1') || savedStarRating) {
      const starRating = searchParams.starRating || savedStarRating;
      hotels = hotels.filter(h => {
        switch(starRating) {
          case '2': return h.star === 5;
          case '3': return h.star === 4;
          case '4': return h.star === 3;
          case '5': return h.star <= 2;
          default: return true;
        }
      });
    }

    if (searchParams.brand && searchParams.brand !== '') {
      hotels = hotels.filter(h => h.brand === searchParams.brand);
    }

    const currentQuickTags = searchParams.quickTags || savedQuickTags;
    if (currentQuickTags && currentQuickTags.length > 0) {
      hotels = hotels.filter(h => 
        currentQuickTags.some(tag => 
          h.tags.some(hotelTag => hotelTag.includes(tag)) ||
          h.address.includes(tag)
        )
      );
    }

    if (searchParams.recommendedTags && searchParams.recommendedTags.length > 0) {
      hotels = hotels.filter(h => 
        searchParams.recommendedTags.some(tag => 
          h.tags.some(hotelTag => hotelTag.includes(tag))
        )
      );
    }

    // 应用筛选器筛选
    const savedFilters = Taro.getStorageSync('selectedFilters') || [];
    const currentFilters = overrideFilters !== null ? overrideFilters : (searchParams.filters || savedFilters);
    if (currentFilters && currentFilters.length > 0) {
      hotels = hotels.filter(h => {
        return currentFilters.every(filterId => {
          const filterLabel = filterIdToLabel[filterId];
          if (!filterLabel) return true;
          
          // 检查标签中是否包含筛选内容
          if (h.tags && h.tags.some(tag => tag.includes(filterLabel))) {
            return true;
          }
          
          // 检查设施中是否包含筛选内容
          if (h.facilities && h.facilities.some(facility => facility.includes(filterLabel))) {
            return true;
          }
          
          // 检查品牌是否匹配
          if (h.brand && h.brand.includes(filterLabel)) {
            return true;
          }
          
          // 检查地址中是否包含筛选内容
          if (h.address && h.address.includes(filterLabel)) {
            return true;
          }
          
          // 检查描述中是否包含筛选内容
          if (h.description && h.description.includes(filterLabel)) {
            return true;
          }
          
          return false;
        });
      });
    }

    // 应用积分抵扣
    const isPointsEnabled = overridePointsEnabled !== null ? overridePointsEnabled : pointsEnabled;
    hotels = hotels.map(hotel => {
      // 保存原始价格
      const originalPrice = hotel.price;
      // 计算抵扣后的价格
      const discountedPrice = isPointsEnabled ? Math.max(0, originalPrice - 25) : originalPrice;
      return {
        ...hotel,
        price: discountedPrice,
        originalPrice: originalPrice
      };
    });

    hotels = sortHotels(hotels, sortBy);

    if (isRefresh) {
      // 刷新时，加载第一页数据
      const endIndex = page * PAGE_SIZE;
      const newDisplayedHotels = hotels.slice(0, endIndex);
      setDisplayedHotels(newDisplayedHotels);
      setCurrentPage(page);
      setHasMore(endIndex < hotels.length);
    } else {
      // 加载更多时，追加数据
      const startIndex = (page - 1) * PAGE_SIZE;
      const endIndex = page * PAGE_SIZE;
      const moreHotels = hotels.slice(startIndex, endIndex);
      setDisplayedHotels(prev => [...prev, ...moreHotels]);
      setCurrentPage(page);
      setHasMore(endIndex < hotels.length);
    }
  };

  const sortHotels = (hotels, sortType) => {
    const sorted = [...hotels];
    switch (sortType) {
      case 'price':
        return sorted.sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
      case 'rating':
      case 'recommended':
        return sorted.sort((a, b) => sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating);
      case 'distance':
        return sorted.sort((a, b) => sortOrder === 'asc' ? a.distance - b.distance : b.distance - a.distance);
      default:
        return sorted;
    }
  };

  const handleHotelClick = (hotelId) => {
    // 添加到浏览历史
    setViewedHotels(prev => {
      if (!prev.includes(hotelId)) {
        const updatedViewed = [...prev, hotelId];
        // 保存到本地存储
        Taro.setStorageSync('viewedHotels', updatedViewed);
        return updatedViewed;
      }
      return prev;
    });
    Taro.navigateTo({
      url: `/pages/detail/index?id=${hotelId}`
    });
  };

  const handleScrollToLower = () => {
    if (hasMore) {
      loadHotels(false);
    }
  };

  const renderStars = (star) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Text 
          key={i} 
          className={`star ${i < star ? 'star-filled' : ''}`}
        >
          ★
        </Text>
      );
    }
    return stars;
  };

  const renderAmenities = (amenities) => {
    if (!amenities || amenities.length === 0) return null;
    const displayAmenities = amenities.slice(0, 4);
    return (
      <View className="hotel-amenities">
        {displayAmenities.map((amenity, index) => (
          <View key={index} className="amenity-tag" onClick={() => handleAmenityClick(amenity)} onTap={() => handleAmenityClick(amenity)}>
            {amenity}
          </View>
        ))}
      </View>
    );
  };

  const renderTags = (tags) => {
    if (!tags || tags.length === 0) return null;
    const displayTags = tags.slice(0, 2); // 只显示前2个标签，简化显示
    return (
      <View className="hotel-tags">
        {displayTags.map((tag, index) => (
          <View key={index} className="hotel-tag" onClick={(e) => {
            e.stopPropagation();
            handleFilterTagClick(tag);
          }} onTap={(e) => {
            e.stopPropagation();
            handleFilterTagClick(tag);
          }}>
            {tag}
          </View>
        ))}
      </View>
    );
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleLocationClick = () => {
    setCityDropdownVisible(!cityDropdownVisible);
  };

  const handleCitySelect = (cityName) => {
    if (updateSearchParams) {
      updateSearchParams({ location: cityName });
    }
    
    // 保存城市选择到本地存储
    if (cityName === '不选择城市') {
      Taro.removeStorageSync('selectedCity');
    } else {
      Taro.setStorageSync('selectedCity', cityName);
    }
    
    setCityDropdownVisible(false);
    // 不再立即加载酒店列表，等待用户点击查询
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
        
        if (updateSearchParams) {
          updateSearchParams({ location: '我的位置' });
        }
        
        // 保存位置到本地存储
        Taro.setStorageSync('selectedCity', '我的位置');
        
        setLocationInfo(fullLocationInfo);
        setIsLocated(true);
        Taro.showToast({
          title: `已定位到 ${fullLocationInfo}`,
          icon: 'none',
          duration: 2000
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

  const handleDatesClick = () => {
    // 实际功能：打开日历组件
    setCalendarVisible(true);
  };

  const handleGuestsClick = () => {
    // 实际功能：打开人数选择器
    Taro.navigateTo({
      url: '/pages/guests-select/index'
    });
  };

  const handleSearchClick = () => {
    if (updateSearchParams) {
      updateSearchParams({ keyword, quickTags: selectedTags });
    }
    
    // 保存关键词到本地存储
    Taro.setStorageSync('keyword', keyword);
    
    loadHotels(true);
  };
  
  const handleKeywordChange = (e) => {
    const newKeyword = e.detail.value;
    setKeyword(newKeyword);
    // 当用户清除输入时，更新本地存储
    Taro.setStorageSync('keyword', newKeyword);
  };

  const handlePriceStarClick = () => {
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
    // 应用价格和星级筛选
    if (updateSearchParams) {
      updateSearchParams({
        priceRange: selectedPriceRange,
        starRating: selectedStarRating
      });
    }
    
    // 保存筛选参数到本地存储
    Taro.setStorageSync('priceRange', selectedPriceRange);
    Taro.setStorageSync('starRating', selectedStarRating);
    
    // 重新加载酒店列表
    loadHotels(true);
    
    Taro.showToast({
      title: '筛选条件已应用',
      icon: 'success',
      duration: 1000
    });
  };

  const handleFilterClick = () => {
    setFilterVisible(!filterVisible);
  };

  const handleFilterOptionSelect = (optionId) => {
    setSelectedFilters(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const handleFilterConfirm = () => {
    setFilterVisible(false);
    
    // 应用筛选
    if (updateSearchParams) {
      updateSearchParams({ filters: selectedFilters });
    }
    
    // 保存筛选参数到本地存储
    Taro.setStorageSync('selectedFilters', selectedFilters);
    
    // 重新加载酒店列表，直接传递最新的筛选值
    loadHotels(true, null, selectedFilters);
    
    Taro.showToast({
      title: '筛选条件已应用',
      icon: 'success',
      duration: 1000
    });
  };

  const handleFilterClear = () => {
    setSelectedFilters([]);
  };



  const handleMapClick = () => {
    // 实际功能：打开地图页面
    Taro.navigateTo({
      url: '/pages/map/index'
    });
  };

  const handleMoreClick = () => {
    // 实际功能：显示更多选项菜单
    Taro.showActionSheet({
      itemList: ['刷新', '分享', '举报', '反馈'],
      success: function (res) {
        switch(res.tapIndex) {
          case 0:
            loadHotels(true);
            break;
          case 1:
            Taro.showToast({ title: '分享功能开发中', icon: 'none' });
            break;
          case 2:
            Taro.showToast({ title: '举报功能开发中', icon: 'none' });
            break;
          case 3:
            Taro.showToast({ title: '反馈功能开发中', icon: 'none' });
            break;
        }
      }
    });
  };

  const handleFilterTagClick = (tagName) => {
    // 处理标签的选择和取消选择
    setSelectedTags(prev => {
      let updatedTags;
      if (prev.includes(tagName)) {
        // 取消选择
        updatedTags = prev.filter(tag => tag !== tagName);
      } else {
        // 选择标签
        updatedTags = [...prev, tagName];
      }
      
      // 更新搜索参数
      if (updateSearchParams) {
        updateSearchParams({ quickTags: updatedTags });
      }
      
      // 保存到本地存储
      Taro.setStorageSync('quickTags', updatedTags);
      
      return updatedTags;
    });
    
    // 重新加载酒店列表
    loadHotels(true);
  };

  const handlePointsToggle = () => {
    // 切换积分抵扣状态
    const newState = !pointsEnabled;
    setPointsEnabled(newState);
    Taro.showToast({
      title: '积分抵扣已' + (newState ? '开启' : '关闭'),
      icon: 'success',
      duration: 1000
    });
    // 重新加载酒店列表以显示积分抵扣后的价格，传递新的状态值
    loadHotels(true, newState);
  };

  const handleRatingClick = (hotel) => {
    // 实际功能：查看酒店点评
    Taro.navigateTo({
      url: `/pages/reviews/index?id=${hotel.id}&name=${encodeURIComponent(hotel.nameCn)}`
    });
  };

  const handleAmenityClick = (amenity) => {
    // 实际功能：应用设施筛选
    Taro.showToast({
      title: `已筛选: ${amenity}`,
      icon: 'success',
      duration: 1000
    });
    // 这里可以添加筛选逻辑
  };

  const handlePromoClick = () => {
    // 实际功能：查看优惠详情
    Taro.navigateTo({
      url: '/pages/promo-detail/index'
    });
  };

  return (
    <View className="list-page">
      <View className="top-header">
        <View className="back-button" onClick={handleBack} onTap={handleBack}>
          <Text className="back-icon">←</Text>
        </View>
        
        {/* Location info display */}
        {isLocated && locationInfo && (
          <View className="location-info-bar">
            <View className="location-info-content">
              <Text className="location-info-icon">📍</Text>
              <Text className="location-info-text">已定位到 {locationInfo}</Text>
            </View>
          </View>
        )}
        
        <View className="header-row">
          <View className="location-selector-wrapper">
            <View 
              className="location-selector" 
              onClick={handleLocationClick}
              onTap={handleLocationClick}
            >
              <Text className="location-text">{searchParams.location || '不选择城市'}</Text>
              <Text className={`location-arrow ${cityDropdownVisible ? 'arrow-up' : ''}`}>▼</Text>
            </View>
            
            {/* City dropdown */}
            {cityDropdownVisible && (
              <View className="city-dropdown">
                <ScrollView className="city-list" scrollY>
                  {cities.map(city => (
                    <View 
                      key={city.id} 
                      className={`city-item ${(searchParams.location || '不选择城市') === city.name ? 'city-item-selected' : ''}`}
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
          
          <View className="date-selector" onClick={handleDatesClick} onTap={handleDatesClick}>
            <View className="date-item">
              <Text className="date-display">{checkInDate || '2月26日 今天'}</Text>
            </View>
            <View className="date-separator">
              <Text className="nights-text">共{nights || 1}晚</Text>
            </View>
            <View className="date-item">
              <Text className="date-display">{checkOutDate || '2月27日 明天'}</Text>
            </View>
          </View>
          
          <View className="search-input-wrapper">
            <Input
              className="search-input"
              placeholder="位置/品牌/酒店"
              value={keyword}
              onInput={handleKeywordChange}
            />
          </View>
          
          <View 
            className="search-button"
            onClick={handleSearchClick}
            onTap={handleSearchClick}
          >
            <Text className="search-button-text">查询</Text>
          </View>
        </View>
      </View>

      <Calendar
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        onDateSelect={handleDateSelect}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
      />

      <View className="sort-tabs">
        {sortOptions.map((option) => (
          <View key={option.key}>
            {option.key === 'price' ? (
              <View className="price-filter-wrapper">
                <View
                  className={`sort-tab ${sortBy === option.key ? 'sort-tab-active' : ''}`}
                  onClick={() => {
                    handlePriceStarClick();
                  }}
                  onTap={() => {
                    handlePriceStarClick();
                  }}
                >
                  <Text className="sort-tab-text">{option.label}</Text>
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
            ) : option.key === 'filter' ? (
              <View className="filter-wrapper">
                <View
                  className={`sort-tab ${sortBy === option.key ? 'sort-tab-active' : ''}`}
                  onClick={handleFilterClick}
                  onTap={handleFilterClick}
                >
                  <Text className="sort-tab-text">{option.label}</Text>
                  <Text className={`price-filter-arrow ${filterVisible ? 'arrow-up' : ''}`}>▼</Text>
                </View>
                
                {/* Filter dropdown */}
                {filterVisible && (
                  <View className="price-filter-dropdown">
                    <View className="price-filter-content">
                      {filterOptions.map((category) => (
                        <View key={category.category} className="filter-section">
                          <Text className="filter-section-title">{category.category}</Text>
                          <View className="filter-options-grid">
                            {category.options.map((option) => (
                              <View 
                                key={option.id} 
                                className={`filter-option-tag ${selectedFilters.includes(option.id) ? 'filter-option-tag-selected' : ''}`}
                                onClick={() => handleFilterOptionSelect(option.id)}
                                onTap={() => handleFilterOptionSelect(option.id)}
                              >
                                <Text className="filter-option-tag-text">{option.label}</Text>
                                {selectedFilters.includes(option.id) && (
                                  <Text className="filter-option-tag-check">✓</Text>
                                )}
                              </View>
                            ))}
                          </View>
                        </View>
                      ))}
                      
                      <View className="filter-actions">
                        <Button 
                          className="filter-clear-btn" 
                          onClick={handleFilterClear}
                          onTap={handleFilterClear}
                        >
                          清空
                        </Button>
                        <Button 
                          className="filter-confirm-btn" 
                          onClick={handleFilterConfirm}
                          onTap={handleFilterConfirm}
                        >
                          完成
                        </Button>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View className="sort-tab-wrapper">
                <View
                  className={`sort-tab ${sortBy === option.key ? 'sort-tab-active' : ''}`}
                  onClick={() => {
                    setSortBy(option.key);
                    loadHotels(true);
                  }}
                  onTap={() => {
                    setSortBy(option.key);
                    loadHotels(true);
                  }}
                >
                  <Text className="sort-tab-text">{option.label}</Text>
                </View>
                {sortBy === option.key && (
                  <View
                    className="sort-order-toggle"
                    onClick={() => {
                      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                      loadHotels(true);
                    }}
                    onTap={() => {
                      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                      loadHotels(true);
                    }}
                  >
                    <Text className="sort-order-icon">{sortOrder === 'asc' ? '↑' : '↓'}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </View>

      <View className="filter-tags">
        <View className="filter-tags-container">
          {tagOptions.map((tag) => (
            <View 
              key={tag.id} 
              className={`filter-tag ${selectedTags.includes(tag.label) ? 'filter-tag-selected' : ''}`}
              onClick={() => handleFilterTagClick(tag.label)}
              onTap={() => handleFilterTagClick(tag.label)}
            >
              <Text className="filter-tag-text">{tag.label}</Text>
            </View>
          ))}
          <View className="filter-tag-spacer"></View>
        </View>
      </View>

      <View 
        className="points-promo"
        onClick={handlePointsToggle}
        onTap={handlePointsToggle}
      >
        <View className="points-icon">💰</View>
        <View className="points-content">
          <Text className="points-text">最高使用2516积分抵¥25</Text>
          <Text className="points-subtext">打开开关看积分抵后价</Text>
        </View>
        <View className="points-toggle">
          <View className={`toggle-switch ${pointsEnabled ? 'toggle-switch-active' : ''}`} />
        </View>
      </View>

      <ScrollView
        className="hotel-list"
        scrollY
        onScrollToLower={handleScrollToLower}
      >
        {displayedHotels.map(hotel => (
          <View 
            key={hotel.id} 
            className="hotel-card"
            onClick={() => handleHotelClick(hotel.id)}
            onTap={() => handleHotelClick(hotel.id)}
          >
            <View className="hotel-image-wrapper">
              <Image 
                className="hotel-image" 
                src={hotel.imageUrl} 
                mode="aspectFill" 
              />
              {viewedHotels.includes(hotel.id) && (
                <View 
                  className="hotel-badge"
                  onClick={(e) => {
                    e.stopPropagation();
                    Taro.showToast({ title: '浏览历史', icon: 'none' });
                  }}
                  onTap={(e) => {
                    e.stopPropagation();
                    Taro.showToast({ title: '浏览历史', icon: 'none' });
                  }}
                >
                  <Text className="hotel-badge-text">浏览过</Text>
                </View>
              )}
            </View>
            <View className="hotel-info">
              <View className="hotel-header">
                <Text className="hotel-name">{hotel.nameCn}</Text>
                <View className="hotel-stars">
                  {renderStars(hotel.star)}
                </View>
              </View>
              <View className="hotel-rating-row">
                <View 
                  className="rating-score"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRatingClick(hotel);
                  }}
                  onTap={(e) => {
                    e.stopPropagation();
                    handleRatingClick(hotel);
                  }}
                >
                  <Text className="rating-number">{hotel.rating.toFixed(1)}</Text>
                  <Text className="rating-label">超棒</Text>
                </View>
                <Text 
                  className="rating-reviews"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRatingClick(hotel);
                  }}
                  onTap={(e) => {
                    e.stopPropagation();
                    handleRatingClick(hotel);
                  }}
                >
                  {Math.floor(hotel.rating * 1000)}点评
                </Text>
                <Text 
                  className="rating-collection"
                  onClick={(e) => {
                    e.stopPropagation();
                    Taro.showToast({ title: '收藏列表', icon: 'none' });
                  }}
                  onTap={(e) => {
                    e.stopPropagation();
                    Taro.showToast({ title: '收藏列表', icon: 'none' });
                  }}
                >
                  {Math.floor(hotel.rating * 3000)}收藏
                </Text>
              </View>
              <Text 
                className="hotel-address"
                onClick={(e) => {
                  e.stopPropagation();
                  Taro.showToast({ title: '查看地图', icon: 'none' });
                }}
                onTap={(e) => {
                  e.stopPropagation();
                  Taro.showToast({ title: '查看地图', icon: 'none' });
                }}
              >
                {hotel.address}
              </Text>
              <Text 
                className="hotel-description"
                onClick={(e) => {
                  e.stopPropagation();
                  Taro.showToast({ title: '酒店详情', icon: 'none' });
                }}
                onTap={(e) => {
                  e.stopPropagation();
                  Taro.showToast({ title: '酒店详情', icon: 'none' });
                }}
              >
                {hotel.description}
              </Text>
              {renderTags(hotel.tags)}
              {renderAmenities(hotel.facilities)}
              <View 
                className="hotel-rank"
                onClick={(e) => {
                  e.stopPropagation();
                  Taro.showToast({ title: '酒店排行榜', icon: 'none' });
                }}
                onTap={(e) => {
                  e.stopPropagation();
                  Taro.showToast({ title: '酒店排行榜', icon: 'none' });
                }}
              >
                <Text className="rank-icon">🏨</Text>
                <Text className="rank-text">南京豪华酒店榜 No.14</Text>
              </View>
              <View 
                className="hotel-promo"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePromoClick();
                }}
                onTap={(e) => {
                  e.stopPropagation();
                  handlePromoClick();
                }}
              >
                <View className="promo-tag">一起订专享</View>
                <Text className="promo-text">酒店首单享直减优惠300</Text>
              </View>
              <View className="hotel-price-wrapper">
                <Text 
                  className="original-price"
                  onClick={(e) => {
                    e.stopPropagation();
                    Taro.showToast({ title: '原价', icon: 'none' });
                  }}
                  onTap={(e) => {
                    e.stopPropagation();
                    Taro.showToast({ title: '原价', icon: 'none' });
                  }}
                >
                  ¥{hotel.originalPrice || hotel.price}
                </Text>
                <Text 
                  className="discount-tag"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePromoClick();
                  }}
                  onTap={(e) => {
                    e.stopPropagation();
                    handlePromoClick();
                  }}
                >
                  2项优惠
                </Text>
              </View>
              <View 
                className="hotel-price"
                onClick={(e) => {
                  e.stopPropagation();
                  Taro.showToast({ title: '查看价格详情', icon: 'none' });
                }}
                onTap={(e) => {
                  e.stopPropagation();
                  Taro.showToast({ title: '查看价格详情', icon: 'none' });
                }}
              >
                <Text className="price-label">¥</Text>
                <Text className="price-value">{hotel.price}</Text>
                <Text className="price-unit">起</Text>
              </View>
            </View>
          </View>
        ))}

        <View 
          className="loading-more"
          onClick={() => loadHotels(false)}
          onTap={() => loadHotels(false)}
        >
          <Text>加载更多...</Text>
        </View>

        <View 
          className="no-more"
          onClick={() => Taro.showToast({ title: '没有更多酒店了', icon: 'none' })}
          onTap={() => Taro.showToast({ title: '没有更多酒店了', icon: 'none' })}
        >
          <Text>没有更多了</Text>
        </View>

        <View 
          className="empty-state"
          onClick={() => Taro.showToast({ title: '尝试调整搜索条件', icon: 'none' })}
          onTap={() => Taro.showToast({ title: '尝试调整搜索条件', icon: 'none' })}
        >
          <Text>暂无符合条件的酒店</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ListPage;
