module.exports = {
  signIn: {
    sms: `Welcome back, [User Name]! You have successfully logged in.`,
    code: 10
  },
  serviceAvailability: {
    sms: `Service is not available in your area. Please check again later.`,
    code: 20
  },
  appointmentSchedule: {
    schedule: `Appointment scheduled for [Date and Time].`,
    code: 30
  },
  appointmentReminder: {
    reminder: `Appointment reminder for [Date and Time].`,
    code: 40
  },
  payment: {
    confirmation: `Payment of [Amount] has been received.`,
    code: 50
  },
};
