// backend/services/email.js

const EmailService = {
  // Welcome email (dummy)
  async welcome(user) {
    try {
      console.log("=================================");
      console.log("📧 WELCOME EMAIL");
      console.log(`To: ${user.email}`);
      console.log(`Hi ${user.name}, welcome to our platform! 🎉`);
      console.log("=================================");
    } catch (err) {
      console.error("Email error:", err);
    }
  },

  // Password reset OTP (dummy)
  async passwordReset(user, otp) {
    try {
      console.log("=================================");
      console.log("📧 PASSWORD RESET OTP");
      console.log(`To: ${user.email}`);
      console.log(`Hello ${user.name}, आपका OTP है: ${otp}`);
      console.log("=================================");
    } catch (err) {
      console.error("Email error:", err);
    }
  }
};

module.exports = EmailService;