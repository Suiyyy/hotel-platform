import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Button, Swiper, SwiperItem } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useHotelStore } from '../../store/hotelContext';
import { useFavorites } from '../../store/favoritesContext';
import { useHistory } from '../../store/historyContext';
import { onPriceUpdate } from '../../services/wsClient';
import { resolveImageUrl } from '../../services/hotelApi';
import Calendar from '../../components/Calendar';
import './index.scss';

const DetailPage = () => {
  const [hotel, setHotel] = useState(null);
  const [selectedRoomTab, setSelectedRoomTab] = useState(0);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [checkInDate, setCheckInDate] = useState('2026-02-25');
  const [checkOutDate, setCheckOutDate] = useState('2026-02-26');
  const [nights, setNights] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const router = Taro.getCurrentInstance().router;
  const { getHotelById } = useHotelStore();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addHistory } = useHistory();

  useEffect(() => {
    const hotelId = router?.params?.id;
    if (hotelId) {
      const hotelData = getHotelById(hotelId);
      if (hotelData) {
        setHotel(hotelData);
        addHistory(hotelId);
      }
    }
  }, [router, getHotelById, addHistory]);

  // WebSocket real-time price updates
  useEffect(() => {
    const unsubscribe = onPriceUpdate((hotelId, newPrice) => {
      setHotel(prev => prev && prev.id === hotelId ? { ...prev, price: newPrice } : prev);
    });
    return unsubscribe;
  }, []);

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

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleToggleFavorite = () => {
    if (hotel) {
      toggleFavorite(hotel.id);
    }
  };

  const handleShare = () => {
    // 实际功能：分享酒店信息
    Taro.shareAppMessage({
      title: hotel.nameCn,
      path: `/pages/detail/index?id=${hotel.id}`,
      imageUrl: hotel.imageUrl
    });
  };

  const handleShoppingCart = () => {
    // 实际功能：查看购物车
    Taro.navigateTo({
      url: '/pages/cart/index'
    });
  };

  const handleMore = () => {
    // 实际功能：显示更多选项菜单
    Taro.showActionSheet({
      itemList: ['收藏', '分享', '举报', '反馈'],
      success: function (res) {
        switch(res.tapIndex) {
          case 0:
            handleToggleFavorite();
            break;
          case 1:
            handleShare();
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

  const handleVipTag = () => {
    // 实际功能：查看会员权益
    Taro.navigateTo({
      url: '/pages/vip-benefits/index'
    });
  };

  const handleHotelRank = () => {
    // 实际功能：查看酒店排行榜
    Taro.navigateTo({
      url: '/pages/ranking/index'
    });
  };

  const handleFacilitiesMore = () => {
    // 实际功能：查看设施政策详情
    Taro.navigateTo({
      url: `/pages/facilities/index?id=${hotel.id}`
    });
  };

  const handleLocationMap = () => {
    // 实际功能：打开地图
    Taro.openLocation({
      latitude: 32.0603,
      longitude: 118.7969,
      name: hotel.nameCn,
      address: hotel.address
    });
  };

  const handlePromoSection = () => {
    // 实际功能：查看优惠活动详情
    Taro.navigateTo({
      url: '/pages/promo-detail/index'
    });
  };

  const handleDateDisplay = () => {
    // 实际功能：显示日历选择器
    setCalendarVisible(true);
  };

  const handleCalendarClose = () => {
    setCalendarVisible(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  const handleDateSelect = (checkIn, checkOut, nightCount) => {
    // 实际功能：处理日期选择
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
    setNights(nightCount);
    setCalendarVisible(false);
  };

  const handleGuestsSelector = () => {
    // 实际功能：选择人数
    Taro.navigateTo({
      url: '/pages/guests-select/index'
    });
  };

  const handleRoomTab = (index) => {
    setSelectedRoomTab(index);
  };

  const handleRoomFilter = () => {
    // 实际功能：筛选房间
    Taro.navigateTo({
      url: `/pages/room-filter/index?id=${hotel.id}`
    });
  };

  const handleRoomExpand = (roomId) => {
    // 实际功能：查看房间详情
    Taro.navigateTo({
      url: `/pages/room-detail/index?id=${roomId}&hotelId=${hotel.id}`
    });
  };

  const handleRoomTag = (tag) => {
    // 实际功能：筛选带特定标签的房间
    // 这里可以添加筛选逻辑
  };

  const handleRoomPolicy = () => {
    // 实际功能：查看入住政策详情
    Taro.navigateTo({
      url: `/pages/policy/index?id=${hotel.id}`
    });
  };

  const handleRoomBenefit = (benefit) => {
    // 实际功能：查看权益详情
  };

  const handleRoomPrice = (roomId) => {
    // 实际功能：查看价格详情
    Taro.navigateTo({
      url: `/pages/price-detail/index?roomId=${roomId}&hotelId=${hotel.id}`
    });
  };

  const handleRoomSelect = (room) => {
    // 实际功能：选择房型
    setSelectedRoom(room);
  };

  const handleFooterBtn = () => {
    // 实际功能：预订房间
    if (selectedRoom) {
      Taro.navigateTo({
        url: `/pages/book/index?hotelId=${hotel.id}&roomId=${selectedRoom.id}`
      });
    } else {
      Taro.showToast({ title: '请先选择房型', icon: 'none' });
    }
  };

  if (!hotel) {
    return (
      <View className="detail-page loading">
        <Text>加载中...</Text>
      </View>
    );
  }

  // Sort room types by price from lowest to highest
  const sortedRoomTypes = [...hotel.roomTypes].sort((a, b) => a.price - b.price);

  const hotelImages = [
    resolveImageUrl(hotel.imageUrl),
    'https://picsum.photos/seed/hotel1/800/600',
    'https://picsum.photos/seed/hotel2/800/600',
    'https://picsum.photos/seed/hotel3/800/600'
  ];

  const facilityIcons = [
    { icon: '🌡️', name: '高空美景' },
    { icon: '🅿️', name: '免费停车' },
    { icon: '🐻', name: '亲子主题房' },
    { icon: '🔌', name: '充电桩' },
    { icon: '🏛️', name: '设计师酒店' }
  ];

  const roomTabs = ['双床房', '双份早餐', '家庭房', '含早餐', '大床房'];

  return (
    <View className="detail-page">
      <View className="top-nav">
        <View className="nav-back" onClick={handleBack} onTap={handleBack}>
          <Text className="nav-back-icon">←</Text>
        </View>
        <View className="nav-actions">
          <View className="nav-action" onClick={handleToggleFavorite} onTap={handleToggleFavorite}>
            <Text className="nav-action-icon">{isFavorite(hotel.id) ? '❤️' : '🤍'}</Text>
            <Text className="nav-action-text">{isFavorite(hotel.id) ? '已收藏' : '收藏'}</Text>
          </View>
          <View className="nav-action" onClick={handleShare} onTap={handleShare}>
            <Text className="nav-action-icon">↗️</Text>
            <Text className="nav-action-text">分享</Text>
          </View>
          <View className="nav-action" onClick={handleShoppingCart} onTap={handleShoppingCart}>
            <Text className="nav-action-icon">🛒</Text>
            <Text className="nav-action-text">购物车</Text>
          </View>
          <View className="nav-action" onClick={handleMore} onTap={handleMore}>
            <Text className="nav-action-icon">•••</Text>
            <Text className="nav-action-text">更多</Text>
          </View>
        </View>
      </View>

      <ScrollView className="detail-scroll" scrollY>
        <View className="images-swiper">
          <Swiper className="detail-swiper" indicatorDots autoplay circular>
            {hotelImages.map((img, index) => (
              <SwiperItem key={index}>
                <Image className="detail-swiper-image" src={img} mode="aspectFill" />
              </SwiperItem>
            ))}
          </Swiper>
          <View className="highlight-tag">
            <Text className="highlight-tag-text">亮点</Text>
          </View>
        </View>

        <View className="hotel-detail-info">
          <View className="hotel-name-section">
            <Text className="hotel-detail-name">{hotel.nameCn}</Text>
            <View className="hotel-stars-badge">
              {renderStars(hotel.star)}
              <View className="vip-tag" onClick={handleVipTag} onTap={handleVipTag}>
                <Text className="vip-tag-text">优享会</Text>
              </View>
            </View>
            <View className="hotel-meta-row">
              <Text className="hotel-year">2016年开业</Text>
              <View className="hotel-rank" onClick={handleHotelRank} onTap={handleHotelRank}>
                <Text className="hotel-rank-text">南京豪华酒店榜 No.14</Text>
                <Text className="hotel-rank-arrow">&gt;</Text>
              </View>
            </View>
          </View>

          <View className="facilities-row">
            <View className="facilities-list">
              {facilityIcons.map((facility, index) => (
                <View key={index} className="facility-item">
                  <View className="facility-icon">{facility.icon}</View>
                  <Text className="facility-name">{facility.name}</Text>
                </View>
              ))}
            </View>
            <View className="facilities-more" onClick={handleFacilitiesMore} onTap={handleFacilitiesMore}>
              <Text className="facilities-more-text">设施政策</Text>
              <Text className="facilities-more-arrow">&gt;</Text>
            </View>
          </View>

          <View className="rating-section">
            <View className="rating-left">
              <View className="rating-score-box">
                <Text className="rating-score">{hotel.rating.toFixed(1)}</Text>
                <Text className="rating-label">超棒</Text>
              </View>
              <Text className="rating-reviews">{Math.floor(hotel.rating * 10000)}条</Text>
              <Text className="rating-quote">"超大椭圆形浴缸，景色相当不错"</Text>
            </View>
            <View className="rating-right">
              <View className="location-info">
                <Text className="location-text">距上海路·省中医院地铁站步行200米｜秦淮区汉中路101号金鹰新街口店B座</Text>
                <View className="location-map" onClick={handleLocationMap} onTap={handleLocationMap}>
                  <Text className="location-map-icon">📍</Text>
                  <Text className="location-map-text">地图</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="promo-section" onClick={handlePromoSection} onTap={handlePromoSection}>
            <View className="promo-item">
              <View className="promo-tag">一起订专享</View>
              <View className="promo-tag">6折起</View>
              <View className="promo-tag">连住礼遇</View>
              <Text className="promo-arrow">&gt;</Text>
            </View>
          </View>

          <View className="date-section">
            <View className="date-display" onClick={handleDateDisplay} onTap={handleDateDisplay}>
              <Text className="date-text">{formatDate(checkInDate)} - {formatDate(checkOutDate)}</Text>
              <Text className="nights-text">共{nights}晚</Text>
            </View>
            <View className="guests-selector" onClick={handleGuestsSelector} onTap={handleGuestsSelector}>
              <View className="guest-count">
                <Text className="guest-count-icon">🛏️</Text>
                <Text className="guest-count-text">1</Text>
              </View>
              <View className="guest-count">
                <Text className="guest-count-icon">👤</Text>
                <Text className="guest-count-text">1</Text>
              </View>
              <View className="guest-count">
                <Text className="guest-count-icon">👶</Text>
                <Text className="guest-count-text">0</Text>
              </View>
            </View>
          </View>

          <View className="room-tabs">
            {roomTabs.map((tab, index) => (
              <View 
                key={index} 
                className={`room-tab ${selectedRoomTab === index ? 'room-tab-active' : ''}`}
                onClick={() => handleRoomTab(index)}
                onTap={() => handleRoomTab(index)}
              >
                <Text className="room-tab-text">{tab}</Text>
              </View>
            ))}
            <View className="room-filter" onClick={handleRoomFilter} onTap={handleRoomFilter}>
              <Text className="room-filter-text">筛选</Text>
              <Text className="room-filter-arrow">▼</Text>
            </View>
          </View>

          {sortedRoomTypes.map((room) => (
            <View 
              key={room.id} 
              className={`room-item ${selectedRoom?.id === room.id ? 'room-item-selected' : ''}`}
              onClick={() => handleRoomSelect(room)}
              onTap={() => handleRoomSelect(room)}
            >
              <View className="room-left">
                <View className="room-image-wrapper">
                  <Image className="room-image" src={resolveImageUrl(hotel.imageUrl)} mode="aspectFill" />
                  <View className="room-badge">
                    <Text className="room-badge-count">5</Text>
                  </View>
                  {selectedRoom?.id === room.id && (
                    <View className="room-selected-badge">
                      <Text className="room-selected-text">✓</Text>
                    </View>
                  )}
                </View>
              </View>
              <View className="room-right">
                <View className="room-header">
                  <Text className="room-name">{room.name}-云端尽览金陵城</Text>
                  <View className="room-expand" onClick={(e) => {
                    e.stopPropagation();
                    handleRoomExpand(room.id);
                  }} onTap={(e) => {
                    e.stopPropagation();
                    handleRoomExpand(room.id);
                  }}>
                    <Text className="room-expand-icon">ⓘ</Text>
                  </View>
                </View>
                <View className="room-desc">
                  <Text className="room-desc-text">1张1.8米大床 48m² 2人入住 30-33,35-37层</Text>
                </View>
                <View className="room-tags">
                  <View className="room-tag">城景</View>
                  <View className="room-tag">浴缸</View>
                  <View className="room-tag">部分禁烟</View>
                </View>
                <View className="room-bestseller">
                  <Text className="room-bestseller-text">本店套餐销量No.1</Text>
                </View>
                <View className="room-description-box" onClick={(e) => {
                  e.stopPropagation();
                  // 可以添加点击查看详情的功能
                }} onTap={(e) => {
                  e.stopPropagation();
                  // 可以添加点击查看详情的功能
                }}>
                  <Text className="room-description-text">无早餐 | 入住当天18:00前可免费取消 | 迷你吧首轮畅饮 1份 | 满园春中餐厅9折优惠（不适用日期：2026.2.16-2026.2....</Text>
                </View>
                <View className="room-price-row" onClick={(e) => {
                  e.stopPropagation();
                  handleRoomPrice(room.id);
                }} onTap={(e) => {
                  e.stopPropagation();
                  handleRoomPrice(room.id);
                }}>
                  <View className="room-payment">
                    <View className="payment-tag">在线付</View>
                    <View className="payment-tag">立即确认</View>
                  </View>
                  <View className="room-price">
                    <View className="discount-info">
                      <Text className="original-price">¥999</Text>
                      <View className="discount-badge">
                        <Text className="discount-text">7.0折</Text>
                      </View>
                    </View>
                    <View className="price-display">
                      <Text className="price-label">¥</Text>
                      <Text className="price-value">{room.price}</Text>
                    </View>
                  </View>
                </View>
                <View className="room-extra">
                  <Text className="extra-text">一起订专享 | 门店首单 | 优惠300</Text>
                  <Text className="extra-arrow">&gt;</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="detail-footer">
        <View className="footer-left">
          <Text className="footer-price-label">¥</Text>
          <Text className="footer-price-value">{selectedRoom ? selectedRoom.price * nights : hotel?.price || 0}</Text>
        </View>
        <Button className="footer-btn" onClick={handleFooterBtn} onTap={handleFooterBtn}>
          <Text className="footer-btn-text">1间 · {nights}晚 · 门店首单</Text>
          <Text className="footer-btn-text">优惠¥300</Text>
        </Button>
      </View>

      <Calendar
        visible={calendarVisible}
        onClose={handleCalendarClose}
        onDateSelect={handleDateSelect}
      />
    </View>
  );
};

export default DetailPage;
