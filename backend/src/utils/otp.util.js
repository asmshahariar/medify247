// Simulate OTP generation and verification
// In production, integrate with SMS gateway

const otpStore = new Map();

export const generateOTP = (phone) => {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with expiration (5 minutes)
  otpStore.set(phone, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  });
  
  console.log(`OTP for ${phone}: ${otp}`); // Remove in production
  
  return otp;
};

export const verifyOTP = (phone, otp) => {
  const stored = otpStore.get(phone);
  
  if (!stored) {
    return { valid: false, message: 'OTP not found or expired' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, message: 'OTP expired' };
  }
  
  if (stored.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  otpStore.delete(phone);
  return { valid: true, message: 'OTP verified successfully' };
};

export const clearOTP = (phone) => {
  otpStore.delete(phone);
};

