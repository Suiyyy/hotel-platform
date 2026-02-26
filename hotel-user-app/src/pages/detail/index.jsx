import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Button, Swiper, SwiperItem } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useHotelStore } from '../../store/hotelContext';
import './index.scss';

const DetailPage = () => {
  const [hotel, setHotel] = useState(null);
  const [currentTab, setCurrentTab] = useState('today');
  const [isFavorite, setIsFavorite] = useState(false);
  const router = Taro.getCurrentInstance().router;
  const { getHotelById } = useHotelStore();

  useEffect(() => {
    const hotelId = router?.params?.id;
    if (hotelId) {
      const hotelData = getHotelById(hotelId);
      setHotel(hotelData);
    }
  }, [router, getHotelById]);

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
    setIsFavorite(!isFavorite);
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
    // 实际功能：选择日期
    Taro.navigateTo({
      url: '/pages/date-select/index'
    });
  };

  const handleGuestsSelector = () => {
    // 实际功能：选择人数
    Taro.navigateTo({
      url: '/pages/guests-select/index'
    });
  };

  const handleRoomTab = (tab) => {
    // 实际功能：切换房间标签
    Taro.showToast({
      title: `已选择${tab}`,
      icon: 'success',
      duration: 1000
    });
    // 这里可以添加房间筛选逻辑
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
    Taro.showToast({
      title: `已筛选${tag}房间`,
      icon: 'success',
      duration: 1000
    });
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
    Taro.showToast({
      title: benefit,
      icon: 'success',
      duration: 1500
    });
  };

  const handleRoomPrice = (roomId) => {
    // 实际功能：查看价格详情
    Taro.navigateTo({
      url: `/pages/price-detail/index?roomId=${roomId}&hotelId=${hotel.id}`
    });
  };

  const handleFooterBtn = () => {
    // 实际功能：预订房间
    Taro.navigateTo({
      url: `/pages/book/index?hotelId=${hotel.id}`
    });
  };

  if (!hotel) {
    return (
      <View className="detail-page loading">
        <Text>加载中...</Text>
      </View>
    );
  }

  const hotelImages = [
    hotel.imageUrl,
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
            <Text className="nav-action-icon">{isFavorite ? '❤️' : '🤍'}</Text>
            <Text className="nav-action-text">{isFavorite ? '已收藏' : '收藏'}</Text>
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
                <View key={index} className="facility-item" onClick={() => Taro.showToast({ title: facility.name, icon: 'none' })} onTap={() => Taro.showToast({ title: facility.name, icon: 'none' })}>
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
              <View className="rating-score-box" onClick={() => Taro.showToast({ title: '评分详情', icon: 'none' })} onTap={() => Taro.showToast({ title: '评分详情', icon: 'none' })}>
                <Text className="rating-score">{hotel.rating.toFixed(1)}</Text>
                <Text className="rating-label">超棒</Text>
              </View>
              <Text className="rating-reviews" onClick={() => Taro.showToast({ title: '查看全部评价', icon: 'none' })} onTap={() => Taro.showToast({ title: '查看全部评价', icon: 'none' })}>{Math.floor(hotel.rating * 10000)}条</Text>
              <Text className="rating-quote" onClick={() => Taro.showToast({ title: '查看全部评价', icon: 'none' })} onTap={() => Taro.showToast({ title: '查看全部评价', icon: 'none' })}>“超大椭圆形浴缸，景色相当不错”</Text>
            </View>
            <View className="rating-right">
              <View className="location-info">
                <Text className="location-text" onClick={() => Taro.showToast({ title: '地址详情', icon: 'none' })} onTap={() => Taro.showToast({ title: '地址详情', icon: 'none' })}>距上海路·省中医院地铁站步行200米｜秦淮区汉中路101号金鹰新街口店B座</Text>
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
            <View className="date-tabs">
              <View 
                className={`date-tab ${currentTab === 'today' ? 'date-tab-active' : ''}`}
                onClick={() => setCurrentTab('today')}
                onTap={() => setCurrentTab('today')}
              >
                <Text className="date-tab-text">今天</Text>
              </View>
              <View 
                className={`date-tab ${currentTab === 'tomorrow' ? 'date-tab-active' : ''}`}
                onClick={() => setCurrentTab('tomorrow')}
                onTap={() => setCurrentTab('tomorrow')}
              >
                <Text className="date-tab-text">明天</Text>
              </View>
              <View 
                className={`date-tab ${currentTab === 'lowprice' ? 'date-tab-active' : ''}`}
                onClick={() => setCurrentTab('lowprice')}
                onTap={() => setCurrentTab('lowprice')}
              >
                <Text className="date-tab-text">看低价</Text>
              </View>
            </View>
            <View className="date-display" onClick={handleDateDisplay} onTap={handleDateDisplay}>
              <Text className="date-text">2月25日 - 2月26日</Text>
              <Text className="nights-text">共1晚</Text>
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
              <View key={index} className={`room-tab ${index === 0 ? 'room-tab-active' : ''}`} onClick={() => handleRoomTab(tab)} onTap={() => handleRoomTab(tab)}>
                <Text className="room-tab-text">{tab}</Text>
              </View>
            ))}
            <View className="room-filter" onClick={handleRoomFilter} onTap={handleRoomFilter}>
              <Text className="room-filter-text">筛选</Text>
              <Text className="room-filter-arrow">▼</Text>
            </View>
          </View>

          {hotel.roomTypes.map((room) => (
            <View key={room.id} className="room-item">
              <View className="room-header">
                <Text className="room-name" onClick={() => Taro.showToast({ title: room.name, icon: 'none' })} onTap={() => Taro.showToast({ title: room.name, icon: 'none' })}>{room.name}-云端尽览金陵城</Text>
                <View className="room-expand" onClick={() => handleRoomExpand(room.id)} onTap={() => handleRoomExpand(room.id)}>
                  <Text className="room-expand-icon">ⓘ</Text>
                </View>
              </View>
              <View className="room-image-wrapper" onClick={() => Taro.showToast({ title: '查看房间图片', icon: 'none' })} onTap={() => Taro.showToast({ title: '查看房间图片', icon: 'none' })}>
                <Image className="room-image" src={hotel.imageUrl} mode="aspectFill" />
                <View className="room-badge" onClick={(e) => { e.stopPropagation(); Taro.showToast({ title: '仅剩5间', icon: 'none' }); }} onTap={(e) => { e.stopPropagation(); Taro.showToast({ title: '仅剩5间', icon: 'none' }); }}>
                  <Text className="room-badge-count">5</Text>
                </View>
              </View>
              <View className="room-tags">
                <View className="room-tag" onClick={() => handleRoomTag('城景')} onTap={() => handleRoomTag('城景')}>城景</View>
                <View className="room-tag" onClick={() => handleRoomTag('浴缸')} onTap={() => handleRoomTag('浴缸')}>浴缸</View>
                <View className="room-tag" onClick={() => handleRoomTag('部分禁烟')} onTap={() => handleRoomTag('部分禁烟')}>部分禁烟</View>
              </View>
              <View className="room-bestseller" onClick={() => Taro.showToast({ title: '热门套餐', icon: 'none' })} onTap={() => Taro.showToast({ title: '热门套餐', icon: 'none' })}>
                <Text className="room-bestseller-text">本店套餐销量No.1</Text>
              </View>
              <View className="room-policy" onClick={handleRoomPolicy} onTap={handleRoomPolicy}>
                <Text className="room-policy-text">无早餐</Text>
                <Text className="room-policy-divider">|</Text>
                <Text className="room-policy-text">入住当天18:00前可免费取消</Text>
              </View>
              <View className="room-benefits" onClick={() => handleRoomBenefit('迷你吧首轮畅饮 1份')} onTap={() => handleRoomBenefit('迷你吧首轮畅饮 1份')}>
                <Text className="room-benefit">迷你吧首轮畅饮 1份</Text>
              </View>
              <View className="room-benefits" onClick={() => handleRoomBenefit('满园春中餐厅9折优惠')} onTap={() => handleRoomBenefit('满园春中餐厅9折优惠')}>
                <Text className="room-benefit">满园春中餐厅9折优惠（不适用日期：2026.2.16-2026.2...</Text>
              </View>
              <View className="room-price-row" onClick={() => handleRoomPrice(room.id)} onTap={() => handleRoomPrice(room.id)}>
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
              <View className="room-extra" onClick={() => Taro.showToast({ title: '专享优惠', icon: 'none' })} onTap={() => Taro.showToast({ title: '专享优惠', icon: 'none' })}>
                <Text className="extra-text">一起订专享 | 积分已抵¥25</Text>
                <View className="extra-badge" onClick={(e) => { e.stopPropagation(); Taro.showToast({ title: '4项优惠', icon: 'none' }); }} onTap={(e) => { e.stopPropagation(); Taro.showToast({ title: '4项优惠', icon: 'none' }); }}>
                  <Text className="extra-badge-text">4项优</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="detail-footer">
        <View className="footer-left" onClick={() => Taro.showToast({ title: '价格详情', icon: 'none' })} onTap={() => Taro.showToast({ title: '价格详情', icon: 'none' })}>
          <Text className="footer-price-label">¥</Text>
          <Text className="footer-price-value">{hotel.price}</Text>
        </View>
        <Button className="footer-btn" onClick={handleFooterBtn} onTap={handleFooterBtn}>
          <Text className="footer-btn-text">1间 · 门店首单</Text>
          <Text className="footer-btn-text">优惠¥300</Text>
        </Button>
      </View>
    </View>
  );
};

export default DetailPage;
