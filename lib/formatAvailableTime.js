const moment = require('moment');

const formatAvailableTime = (availableTime) => {
    const formattedAvailableTime = {};
    for (let i = 0; i < 7; i++) {
        const date = moment().add(i, 'days').format('YYYY-MM-DD');
        formattedAvailableTime[date] = availableTime.map(slot => ({
            time: slot.time,
            state: slot.state
        }));
    }
    return formattedAvailableTime;
};

module.exports = formatAvailableTime;
  