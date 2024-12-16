const moment = require('moment');

const extendAvailableTime = (oldTimeSlot, newTimeSlots) => {
    console.log('newTimeSlots: ', newTimeSlots);
    console.log('oldTimeSlot: ', oldTimeSlot);
    const combined = [...oldTimeSlot, ...newTimeSlots];
    console.log('combined: ', combined); 
    const uniqueTimeSlots = Array.from(
        new Set(combined.map(slot => JSON.stringify(slot)))
    ).map(slot => JSON.parse(slot));
    return uniqueTimeSlots;
};

module.exports = extendAvailableTime;