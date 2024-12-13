const moment = require('moment');

const formatAvailableTime = (availableTime) => {
    console.log('Input availableTime:', availableTime);

    let parsedTime;

    // Handle string input (double-encoded JSON case)
    if (typeof availableTime === 'string') {
        try {
            // First decode the escaped JSON string
            const cleanedTime = JSON.parse(availableTime);
            console.log('Cleaned Time:', cleanedTime);

            // If cleanedTime is still a string, parse it further
            parsedTime = typeof cleanedTime === 'string' ? JSON.parse(cleanedTime) : cleanedTime;
        } catch (error) {
            console.error('Error parsing availableTime JSON:', error.message);
            throw new Error('Invalid JSON format for availableTime');
        }
    } else if (Array.isArray(availableTime)) {
        // If already an array, use it directly
        parsedTime = availableTime;
    } else {
        throw new Error('Invalid data type for availableTime. Expected an array or a JSON string.');
    }

    console.log('Parsed availableTime:', parsedTime);

    // Validate parsedTime format
    const isValid = parsedTime.every(
        (timeSlot) =>
            typeof timeSlot.time === 'string' &&
            timeSlot.time.includes(' - ') &&
            typeof timeSlot.state === 'number'
    );

    if (!isValid) {
        throw new Error('Invalid availableTime format. Each time slot must have "time" and "state".');
    }

    const formattedTimeSlots = [];

    parsedTime.forEach((timeSlot) => {
        const [startTime, endTime] = timeSlot.time.split(' - ');

        for (let i = 0; i < 7; i++) {
            const date = moment().add(i, 'days');

            const startDateTime = moment(`${date.format('YYYY-MM-DD')} ${startTime}`, 'YYYY-MM-DD hh:mma');
            const endDateTime = moment(`${date.format('YYYY-MM-DD')} ${endTime}`, 'YYYY-MM-DD hh:mma');

            formattedTimeSlots.push({
                date: date.format('YYYY-MM-DD'),
                startDateTime: startDateTime.format('YYYY-MM-DD HH:mm:ss'),
                endDateTime: endDateTime.format('YYYY-MM-DD HH:mm:ss'),
                state: timeSlot.state, // 0 for free, 1 for busy
            });
        }
    });

    return formattedTimeSlots;
};

module.exports = formatAvailableTime;
  