import { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

const DateSelectPage = () => {
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [nights, setNights] = useState(0);
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    generateCalendarDays();
  }, []);

  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date,
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        dayOfWeek: date.getDay(),
        isToday: i === 0,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    
    setCalendarDays(days);
  };

  const handleDateSelect = (day) => {
    if (!checkInDate) {
      setCheckInDate(day);
      setCheckOutDate(null);
      setNights(0);
    } else if (!checkOutDate) {
      if (day.date > checkInDate.date) {
        setCheckOutDate(day);
        const diffTime = Math.abs(day.date - checkInDate.date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setNights(diffDays);
      } else {
        setCheckInDate(day);
        setCheckOutDate(null);
        setNights(0);
      }
    } else {
      setCheckInDate(day);
      setCheckOutDate(null);
      setNights(0);
    }
  };

  const handleConfirm = () => {
    if (checkInDate && checkOutDate) {
      const formatDate = (date) => {
        const month = date.month;
        const day = date.day;
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekDay = weekDays[date.dayOfWeek];
        const isToday = date.isToday;
        const dayLabel = isToday ? '今天' : weekDay;
        return `${month}月${day}日 ${dayLabel}`;
      };

      Taro.setStorageSync('selectedDates', {
        checkInDate: formatDate(checkInDate),
        checkOutDate: formatDate(checkOutDate),
        nights: nights
      });
      Taro.navigateBack();
    } else {
      Taro.showToast({
        title: '请选择入住和退房日期',
        icon: 'none'
      });
    }
  };

  const handleReset = () => {
    setCheckInDate(null);
    setCheckOutDate(null);
    setNights(0);
  };

  const isDateSelected = (day) => {
    if (checkInDate && checkInDate.date.toDateString() === day.date.toDateString()) {
      return 'check-in';
    }
    if (checkOutDate && checkOutDate.date.toDateString() === day.date.toDateString()) {
      return 'check-out';
    }
    if (checkInDate && checkOutDate) {
      if (day.date > checkInDate.date && day.date < checkOutDate.date) {
        return 'between';
      }
    }
    return '';
  };

  return (
    <View className="date-select-page">
      <View className="date-info">
        <Text className="info-text">
          {checkInDate ? `入住: ${checkInDate.month}月${checkInDate.day}日` : '请选择入住日期'}
        </Text>
        <Text className="info-text">
          {checkOutDate ? `退房: ${checkOutDate.month}月${checkOutDate.day}日` : '请选择退房日期'}
        </Text>
        {nights > 0 && (
          <Text className="nights-text">共{nights}晚</Text>
        )}
      </View>

      <ScrollView className="calendar-container">
        <View className="week-header">
          <Text className="week-day">日</Text>
          <Text className="week-day">一</Text>
          <Text className="week-day">二</Text>
          <Text className="week-day">三</Text>
          <Text className="week-day">四</Text>
          <Text className="week-day">五</Text>
          <Text className="week-day">六</Text>
        </View>

        <View className="calendar-grid">
          {calendarDays.map((day, index) => (
            <View 
              key={index} 
              className={`calendar-day ${isDateSelected(day)} ${day.isWeekend ? 'weekend' : ''} ${day.isToday ? 'today' : ''}`}
              onClick={() => handleDateSelect(day)}
              onTap={() => handleDateSelect(day)}
            >
              <Text className="day-number">{day.day}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="date-footer">
        <Button 
          className="reset-button" 
          onClick={handleReset}
          onTap={handleReset}
        >
          重置
        </Button>
        <Button 
          className="confirm-button" 
          onClick={handleConfirm}
          onTap={handleConfirm}
        >
          确认
        </Button>
      </View>
    </View>
  );
};

export default DateSelectPage;