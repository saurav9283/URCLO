const moment = require('moment');

const extendAvailableTime = (availableTime, newAvailableTime) => {
    console.log('newAvailableTime: ', newAvailableTime);
    console.log('availableTime: ', availableTime);
    console.log('availableTime: type ', typeof(availableTime));

    try {
        // Check if availableTime is a string and parse it if necessary
        const available = typeof availableTime === 'string' ? JSON.parse(availableTime) : availableTime || [];
        console.log('available: ', available);

        // Check if newAvailableTime is a string and parse it if necessary
        const newAvailable = typeof newAvailableTime === 'string' ? JSON.parse(newAvailableTime) : newAvailableTime || [];
        console.log('newAvailable: ', newAvailable);

        const combinedTime = [...available, ...newAvailable];
        console.log('combinedTime: ', combinedTime);

        const combinedTimeJSON = JSON.stringify(combinedTime);
        console.log('combinedTimeJSON: ', combinedTimeJSON);

        return combinedTimeJSON;
    } catch (error) {
        console.error("Error merging available times:", error.message);
        return [];
    }
};

module.exports = extendAvailableTime;