export const getLevelColor = (level: number) => {
  if (level >= 1 && level <= 3) {
    return 'bg-green-100 text-green-800 border-green-200'; // 쉬움
  } else if (level >= 4 && level <= 7) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // 보통
  } else if (level >= 8 && level <= 10) {
    return 'bg-red-100 text-red-800 border-red-200'; // 어려움
  } else if (level >= 11 && level <= 15) {
    return 'bg-purple-100 text-purple-800 border-purple-200'; // 매우 어려움
  } else {
    return 'bg-gray-100 text-gray-800 border-gray-200'; // 예외
  }
};
