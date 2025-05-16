const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOTP = async (phoneNumber, otp) => {
  return await client.messages.create({
    body: `Your verification code is: ${otp}`,
    to: phoneNumber,
    from: process.env.TWILIO_PHONE_NUMBER
  });
};

module.exports = sendOTP;
