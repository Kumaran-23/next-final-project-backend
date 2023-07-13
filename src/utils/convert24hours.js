// export function convertTo24Hour(timeStr) {
//     const parts = timeStr.split(' ');
//     if (parts.length !== 2) {
//         throw new Error(`Invalid time format: ${timeStr}`);
//     }

//     const [time, modifier] = timeStr.split(' ');
//     let [hours, minutes] = time.split(':');
//     if (hours === '12') {
//         hours = '00';
//     }
//     if (modifier.toLowerCase() === 'pm') {
//         hours = parseInt(hours, 10) + 12;
//     }
//     return `${hours}:${minutes}:00`;
// }

// export function convertTo12Hour(timeString) {
//     const [hour, minute] = timeString.split(':').map(Number);
//     let period = 'AM';

//     if(hour > 12){
//         hour -= 12;
//         period = 'PM';
//     } else if(hour === 12){
//         period = 'PM';
//     } else if(hour === 0) { // midnight
//         hour = 12;
//     }

//     return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
// }

// export function convertTo24Hour(timeStr) {
//   let [time, modifier] = timeStr.split(' ');
//   time = time.replace(/:/g, '');

//   console.log(`${time}`);
//   console.log(`${modifier}`);

//   if (!modifier) {
//     throw new Error(`Invalid time format: ${timeStr}`);
//   }

//   if (modifier.toLowerCase() === 'pm') {
//     let hour = parseInt(time.slice(0, 2), 10);
//     if (hour < 12) {
//       hour += 12;
//     } else if (hour === 12) {
//       hour = 0;
//     }
//     time = hour.toString().padStart(2, '0') + time.slice(2);
//   } else if (modifier.toLowerCase() === 'am') {
//     if (time.startsWith('12')) {
//       time = '00' + time.slice(2);
//     }
//   } else {
//     throw new Error(`Invalid time format: ${timeStr}`);
//   }

//   return time.slice(0, 2) + ':' + time.slice(2, 4) + ':00Z';
// }

export function convertTo24Hour(timeStr) {
  const modifiedTimeStr = timeStr;
  const parts = modifiedTimeStr.split(' ');
  console.log(`${modifiedTimeStr}`);
  console.log(parts.length);


  if (parts.length !== 2) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  let [time, modifier] = parts;
  time = time.replace(/:/g, '');

  if (!modifier) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  if (modifier.toLowerCase() === 'pm') {
    let hour = parseInt(time.slice(0, 2), 10);
    if (hour < 12) {
      hour += 12;
    } else if (hour === 12) {
      hour = 0;
    }
    time = hour.toString().padStart(2, '0') + time.slice(2);
  } else if (modifier.toLowerCase() === 'am') {
    if (time.startsWith('12')) {
      time = '00' + time.slice(2);
    }
  } else {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  return time.slice(0, 2) + ':' + time.slice(2, 4) + ':00Z';
}







export function convertTo12Hour(timeString) {
    const [hour, minute] = timeString.split(':').map(Number);
    let period = 'AM';

    if(hour > 12){
        hour -= 12;
        period = 'PM';
    } else if(hour === 12){
        period = 'PM';
    } else if(hour === 0) { // midnight
        hour = 12;
    }

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}${period}`;
}







