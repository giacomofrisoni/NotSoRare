// Import module for moments calculation
const moment = require('moment');

const MOMENT_UNITS = Object.freeze({
    YEARS: "years",
    MONTHS: "months",
    WEEKS: "weeks",
    DAYS: "days",
    HOURS: "hours",
    MINUTES: "minutes",
    SECONDS: "seconds"
});

function calculatePastTime(startDate, endDate) {
    const start_date = moment(startDate, 'YYYY-MM-DD HH:mm:ss');
    const end_date = moment(endDate, 'YYYY-MM-DD HH:mm:ss');
    const duration = moment.duration(end_date.diff(start_date));
    if (duration.asYears() >= 1) {
        return { duration: parseInt(duration.asYears(), 10), unit: MOMENT_UNITS.YEARS }
    } else if (duration.asMonths() >= 1) {
        return { duration: parseInt(duration.asMonths(), 10), unit: MOMENT_UNITS.MONTHS }
    } else if (duration.asWeeks() >= 1) {
        return { duration: parseInt(duration.asWeeks(), 10), unit: MOMENT_UNITS.WEEKS }
    } else if (duration.asDays() >= 1) {
        return { duration: parseInt(duration.asDays(), 10), unit: MOMENT_UNITS.DAYS }
    } else if (duration.asHours() >= 1) {
        return { duration: parseInt(duration.asHours(), 10), unit: MOMENT_UNITS.HOURS }
    } else if (duration.asMinutes() >= 1) {
        return { duration: parseInt(duration.asMinutes(), 10), unit: MOMENT_UNITS.MINUTES }
    } else {
        return { duration: parseInt(duration.asSeconds(), 10), unit: MOMENT_UNITS.SECONDS }
    }
}

module.exports = {
    MOMENT_UNITS,
    calculatePastTime
};