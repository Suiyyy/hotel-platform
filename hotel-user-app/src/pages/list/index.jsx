import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useHotelStore } from '../../store/hotelContext';
import './index.scss';

const ListPage = () => {
  const [sortBy, setSortBy] = useState('recommended');
  const [displayedHotels, setDisplayedHotels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { getApprovedOnlineHotels, searchParams } = useHotelStore();

  const PAGE_SIZE = 5;

  const sortOptions = [
    { key: 'recommended', label: '欢迎度排序' },
    { key: 'distance', label: '位置距离' },
    { key: 'price', label: '价格/星级' },
    { key: 'filter', label: '筛选' }
  ];

  const tagOptions = [
    { id: '1', label: '夫子庙景区/秦淮河风光带' },
    { id: '2', label: '5钻/星豪华' },
    { id: '3', label: '品牌' },
    { id: '4', label: '近地铁' }
  ];

  useEffect(() => {
    loadHotels(true);
  }, [sortBy, searchParams]);

  const loadHotels = (isRefresh = false) => {
    const page = isRefresh ? 1 : currentPage;
    let hotels = getApprovedOnlineHotels();

    if (searchParams.keyword) {
      const keyword = searchParams.keyword.toLowerCase();
      hotels = hotels.filter(h => 
        h.nameCn.toLowerCase().includes(keyword) || 
        h.address.toLowerCase().includes(keyword)
      );
    }

    hotels = sortHotels(hotels, sortBy);

    const startIndex = 0;
    const endIndex = page * PAGE_SIZE;
    const newDisplayedHotels = hotels.slice(startIndex, endIndex);

    setDisplayedHotels(newDisplayedHotels);
    setCurrentPage(page);
    setHasMore(endIndex < hotels.length);
  };

  const sortHotels = (hotels, sortType) => {
    const sorted = [...hotels];
    switch (sortType) {
      case 'price':
        return sorted.sort((a, b) => a.price - b.price);
      case 'rating':
      case 'recommended':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'distance':
        return sorted.sort((a, b) => a.distance - b.distance);
      default:
        return sorted;
    }
  };

  const handleHotelClick = (hotelId) => {
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

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleLocationClick = () => {
    // 实际功能：打开城市选择器
    Taro.navigateTo({
      url: '/pages/city-select/index'
    });
  };

  const handleDatesClick = () => {
    // 实际功能：打开日期选择器
    Taro.navigateTo({
      url: '/pages/date-select/index'
    });
  };

  const handleGuestsClick = () => {
    // 实际功能：打开人数选择器
    Taro.navigateTo({
      url: '/pages/guests-select/index'
    });
  };

  const handlePriceStarClick = () => {
    // 实际功能：打开价格和星级筛选器
    Taro.navigateTo({
      url: '/pages/price-filter/index'
    });
  };

  const handleSearchClick = () => {
    // 实际功能：导航到搜索页面
    Taro.navigateTo({
      url: '/pages/search/index'
    });
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
    // 实际功能：应用标签筛选
    Taro.showToast({
      title: `已选择: ${tagName}`,
      icon: 'success',
      duration: 1000
    });
    // 这里可以添加筛选逻辑
  };

  const handlePointsToggle = () => {
    // 实际功能：切换积分抵扣
    Taro.showToast({
      title: '积分抵扣已' + (Math.random() > 0.5 ? '开启' : '关闭'),
      icon: 'success',
      duration: 1000
    });
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
        <View 
          className="header-location"
          onClick={handleLocationClick}
          onTap={handleLocationClick}
        >
          <Text className="header-location-text">南京</Text>
        </View>
        <View 
          className="header-dates"
          onClick={handleDatesClick}
          onTap={handleDatesClick}
        >
          <Text className="header-dates-text">02-25</Text>
          <Text className="header-dates-separator">-</Text>
          <Text className="header-dates-text">02-26</Text>
        </View>
        <View 
          className="header-guests"
          onClick={handleGuestsClick}
          onTap={handleGuestsClick}
        >
          <Text className="header-guests-text">1间</Text>
        </View>
        <View 
          className="header-search"
          onClick={handleSearchClick}
          onTap={handleSearchClick}
        >
          <Text className="header-search-text">位置/品牌/酒店</Text>
        </View>
        <View 
          className="header-map"
          onClick={handleMapClick}
          onTap={handleMapClick}
        >
          <Text className="header-map-text">地图</Text>
        </View>
        <View 
          className="header-more"
          onClick={handleMoreClick}
          onTap={handleMoreClick}
        >
          <Text className="header-more-icon">•••</Text>
        </View>
      </View>

      <View className="sort-tabs">
        {sortOptions.map((option) => (
          <View
            key={option.key}
            className={`sort-tab ${sortBy === option.key ? 'sort-tab-active' : ''}`}
            onClick={() => {
              if (option.key === 'price') {
                handlePriceStarClick();
              } else {
                setSortBy(option.key);
              }
            }}
            onTap={() => {
              if (option.key === 'price') {
                handlePriceStarClick();
              } else {
                setSortBy(option.key);
              }
            }}
          >
            <Text className="sort-tab-text">{option.label}</Text>
          </View>
        ))}
      </View>

      <View className="filter-tags">
        {tagOptions.map((tag) => (
          <View 
            key={tag.id} 
            className="filter-tag"
            onClick={() => handleFilterTagClick(tag.label)}
            onTap={() => handleFilterTagClick(tag.label)}
          >
            <Text className="filter-tag-text">{tag.label}</Text>
          </View>
        ))}
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
          <View className="toggle-switch" />
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
                高楼全景落地窗，俯瞰璀璨南京
              </Text>
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
                  ¥{hotel.price + 200}
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
