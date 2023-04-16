const weekDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function getFormattedDate(unixTime, timezone) {
  const date = new Date((unixTime + timezone) * 1000);
  const weekDay = weekDays[date.getUTCDay()];
  const month = months[date.getUTCMonth()];

  return `${weekDay} ${date.getUTCDate()}, ${month}`;
}

function getFormattedTime(unixTime, timezone) {
  const date = new Date((unixTime + timezone) * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';

  return `${hours % 12 || 12} ${period}`;
}

function mpsToKmh(mps) {
  return (mps * 3600) / 1000;
}

const airQualityText = {
  1: {
    level: 'Good',
    text: '',
  },
  2: {
    level: 'Fair',
    text: '',
  },
  3: {
    level: 'Moderate',
    text: '',
  },
  4: {
    level: 'Poor',
    text: '',
  },
  5: {
    level: 'Very Poor',
    text: '',
  },
};

export {
  weekDays,
  months,
  getFormattedDate,
  getFormattedTime,
  mpsToKmh,
  airQualityText,
};
