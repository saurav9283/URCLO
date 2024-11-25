module.exports = {
  signIn: {
    sms: `Welcome back, [User Name]! You have successfully logged in.`,
    code: 10,
    type: 'signIn'
  },
  serviceAvailability: {
    sms: `Service is not available in your area. Please check again later.`,
    code: 20,
    type: 'serviceAvailability'
  },
  appointmentSchedule: {
    schedule: `Appointment scheduled for [Date and Time].`,
    code: 30,
    type: 'appointmentSchedule'
  },
  appointmentReminder: {
    reminder: `Appointment reminder for [Date and Time].`,
    code: 40,
    type: 'appointmentReminder'
  },
  payment: {
    confirmation: `Payment of [Amount] has been received.`,
    code: 50,
    type: 'payment'
  },
};
