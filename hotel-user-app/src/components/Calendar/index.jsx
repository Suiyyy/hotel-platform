import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

const Calendar = ({ visible, onClose, onDateSelect, checkInDate, checkOutDate }) => {
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (visible) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedStart(today);
      setSelectedEnd(tomorrow);
      
      // Scroll to today's date
      setTimeout(() => {
        scrollToDate(today);
      }, 100);
    }
  }, [visible]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const isBetweenDates = (date, start, end) => {
    if (!start || !end || !date) return false;
    return date > start && date < end;
  };

  const isToday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isSameDay(date, today);
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const scrollToDate = (date) => {
    if (scrollViewRef.current) {
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthElement = document.getElementById(`month-${year}-${month}`);
      if (monthElement) {
        const calendarContainer = scrollViewRef.current;
        const containerHeight = calendarContainer.clientHeight;
        const elementTop = monthElement.offsetTop;
        const elementHeight = monthElement.offsetHeight;
        const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
        calendarContainer.scrollTop = Math.max(0, scrollTop);
      }
    }
  };

  const getNights = () => {
    if (!selectedStart || !selectedEnd) return 0;
    const diffTime = Math.abs(selectedEnd - selectedStart);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDateClick = (date) => {
    if (isPastDate(date)) return;

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (isSameDay(selectedDate, selectedStart)) {
      setSelectedStart(null);
      setSelectedEnd(null);
      return;
    }

    if (isSameDay(selectedDate, selectedEnd)) {
      setSelectedEnd(null);
      return;
    }

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(selectedDate);
      setSelectedEnd(null);
    } else {
      if (selectedDate < selectedStart) {
        setSelectedEnd(selectedStart);
        setSelectedStart(selectedDate);
      } else {
        setSelectedEnd(selectedDate);
      }
    }

    // Scroll to the selected date
    scrollToDate(selectedDate);
  };

  const handleComplete = () => {
    if (selectedStart && selectedEnd) {
      onDateSelect(formatDate(selectedStart), formatDate(selectedEnd), getNights());
      onClose();
    }
  };

  const generateMonths = () => {
    const months = [];
    const today = new Date();
    const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
      months.push(monthDate);
    }
    
    return months;
  };

  const renderMonth = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = getDaysInMonth(monthDate);
    const firstDay = getFirstDayOfMonth(monthDate);
    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<View key={`empty-${i}`} className="calendar-day empty"></View>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelectStart = isSameDay(date, selectedStart);
      const isSelectEnd = isSameDay(date, selectedEnd);
      const isBetween = isBetweenDates(date, selectedStart, selectedEnd);
      const isTodayDate = isToday(date);
      const isWeekendDate = isWeekend(date);
      const isPast = isPastDate(date);

      let dayClass = 'calendar-day';
      if (isSelectStart) dayClass += ' selected-start';
      if (isSelectEnd) dayClass += ' selected-end';
      if (isBetween) dayClass += ' selected-between';
      if (isTodayDate) dayClass += ' today';
      if (isWeekendDate) dayClass += ' weekend';
      if (isPast) dayClass += ' disabled';

      calendarDays.push(
        <View 
          key={day} 
          className={dayClass}
          onClick={() => handleDateClick(date)}
          onTap={() => handleDateClick(date)}
        >
          <Text className="day-number">{day}</Text>
          {isTodayDate && <Text className="today-label">今天</Text>}
          {isSelectStart && <Text className="select-label">入住</Text>}
          {isSelectEnd && (
            <>
              <Text className="select-label">离店</Text>
              {selectedStart && selectedEnd && (
                <View className="nights-bubble">
                  <Text className="nights-bubble-text">共{getNights()}晚</Text>
                </View>
              )}
            </>
          )}
        </View>
      );
    }

    return (
      <View id={`month-${year}-${month}`} key={`${year}-${month}`} className="calendar-month">
        <Text className="month-title">{year}年{month + 1}月</Text>
        <View className="calendar-weekdays">
          {['日', '一', '二', '三', '四', '五', '六'].map((weekday, i) => (
            <Text key={i} className={`weekday ${i === 0 || i === 6 ? 'weekend' : ''}`}>{weekday}</Text>
          ))}
        </View>
        <View className="calendar-grid">
          {calendarDays}
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <View className="calendar-popup-container">
      <View className="calendar-mask" onClick={onClose} onTap={onClose}></View>
      <View className="calendar-popup">
        <View className="calendar-header">
          <View className="header-left">
            <Text className="header-title">选择日期</Text>
          </View>
          <View className="header-right">
            <Text className="close-btn" onClick={onClose} onTap={onClose}>×</Text>
          </View>
        </View>

        {!selectedEnd && (
          <View className="calendar-tip">
            <Text className="tip-text">请选择离店日期</Text>
          </View>
        )}

        <ScrollView 
          className="calendar-scroll"
          scrollY
          ref={scrollViewRef}
        >
          <View className="calendar-months">
            {generateMonths().map(month => renderMonth(month))}
          </View>
        </ScrollView>

        <View className="calendar-footer">
          <View className="selected-dates-info">
            <Text className="date-info">
              {selectedStart ? formatDate(selectedStart) : '请选择入住日期'} -
              {selectedEnd ? formatDate(selectedEnd) : '请选择离店日期'}
            </Text>
          </View>
          <View 
            className={`complete-btn ${selectedStart && selectedEnd ? 'enabled' : 'disabled'}`}
            onClick={handleComplete}
            onTap={handleComplete}
            style={{ opacity: selectedStart && selectedEnd ? 1 : 0.6 }}
          >
            完成{selectedStart && selectedEnd ? ` (${getNights()}晚)` : ''}
          </View>
        </View>
      </View>
    </View>
  );
};

export default Calendar;
