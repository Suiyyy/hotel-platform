import { useState, useEffect } from 'react';
import { View, Text, Button, Picker } from '@tarojs/components';
import './index.scss';

const Calendar = ({ onDateSelect, checkInDate, checkOutDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);

  useEffect(() => {
    if (checkInDate) setSelectedStart(new Date(checkInDate));
    if (checkOutDate) setSelectedEnd(new Date(checkOutDate));
  }, [checkInDate, checkOutDate]);

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

  const isDateSelectable = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const handleDateClick = (date) => {
    if (!isDateSelectable(date)) return;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date);
      setSelectedEnd(null);
    } else {
      if (date < selectedStart) {
        setSelectedEnd(selectedStart);
        setSelectedStart(date);
      } else {
        setSelectedEnd(date);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedStart && selectedEnd) {
      onDateSelect(formatDate(selectedStart), formatDate(selectedEnd));
    } else if (selectedStart) {
      const nextDay = new Date(selectedStart);
      nextDay.setDate(nextDay.getDate() + 1);
      onDateSelect(formatDate(selectedStart), formatDate(nextDay));
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<View key={`empty-${i}`} className="calendar-day empty"></View>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSelectable = isDateSelectable(date);
      const isStart = isSameDay(date, selectedStart);
      const isEnd = isSameDay(date, selectedEnd);
      const isBetween = isBetweenDates(date, selectedStart, selectedEnd);

      let dayClass = 'calendar-day';
      if (!isSelectable) dayClass += ' disabled';
      if (isStart) dayClass += ' selected-start';
      if (isEnd) dayClass += ' selected-end';
      if (isBetween) dayClass += ' selected-between';

      calendarDays.push(
        <View 
          key={day} 
          className={dayClass}
          onClick={() => handleDateClick(date)}
          onTap={() => handleDateClick(date)}
        >
          {day}
        </View>
      );
    }

    return calendarDays;
  };

  return (
    <View className="calendar-container">
      <View className="calendar-header">
        <Button className="calendar-nav-btn" onClick={handlePrevMonth} onTap={handlePrevMonth}>
          &lt;
        </Button>
        <Text className="calendar-title">
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
        </Text>
        <Button className="calendar-nav-btn" onClick={handleNextMonth} onTap={handleNextMonth}>
          &gt;
        </Button>
      </View>

      <View className="calendar-weekdays">
        {['日', '一', '二', '三', '四', '五', '六'].map((weekday, i) => (
          <Text key={i} className="weekday">{weekday}</Text>
        ))}
      </View>

      <View className="calendar-grid">
        {renderCalendar()}
      </View>

      <View className="calendar-footer">
        <View className="selected-dates">
          <Text>入住：{selectedStart ? formatDate(selectedStart) : '请选择'}</Text>
          <Text>离店：{selectedEnd ? formatDate(selectedEnd) : '请选择'}</Text>
        </View>
        <Button className="confirm-btn" onClick={handleConfirm} onTap={handleConfirm}>
          确认
        </Button>
      </View>
    </View>
  );
};

export default Calendar;
