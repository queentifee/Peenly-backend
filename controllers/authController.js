const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Guardian = require ('../models/Guardian');
const sendOTP = require ('../src/sendOtp')

//Register guardian with phone number

exports.registerGuardian = async (req,res) => {
    const { phoneNumber, password } = req.body;

    try {
        //check if phone number already exists
        const existingGuardian = await Guardian.findOne ({ phoneNumber });
        if(existingGuardian) {
                  return res.status(400).json({ message: 'Phone number already in use' });
        }

        //Hash password

        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);    
        }

        //Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 mins
        //Create new user
        const newGuardian = new Guardian({
            phoneNumber,
            password: hashedPassword,
            otp,
            otpExpiresAt,
            isVerified: false, 

        })

        await newGuardian.save();
        await sendOTP(phoneNumber, otp);

        return res.status(201).json({
            message: 'OTP sent to phone. Please verify to complete registration.',
            guardian: {
                id: newGuardian._id,
                phoneNumber: newGuardian.phoneNumber
            }
        })

    } catch (err) {
    console.error("Regsitration error:", err)
    res.status(500).json ({ message: 'Server error'});
    }
};

exports.verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    const guardian = await Guardian.findOne({ phoneNumber });

    if (!guardian) return res.status(400).json({ message: 'User not found' });
    if (guardian.isVerified) return res.status(400).json({ message: 'User already verified' });
    if (guardian.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (guardian.otpExpiresAt < new Date()) return res.status(400).json({ message: 'OTP expired' });

    guardian.isVerified = true;
    guardian.otp = null;
    guardian.otpExpiresAt = null;
    await guardian.save();

    res.status(200).json({ message: 'Phone number verified successfully!' });

  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.login = async (req, res) => {
    const { phoneNumber, password }  = req.body;

    try {

        const guardian = await Guardian.findOne ({phoneNumber});
        if (!guardian) {
            return res.status(400).json ({ message: "Invalid credentials" })
        }
       

    const isMatch = await bcrypt.compare(password, guardian.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
            console.log("Password match:", isMatch);
      const token = jwt.sign({ id: guardian._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.json({ message: "Login successful", token });
    } catch (error) {
                console.error("Login error:", error);

      res.status(500).json({ message: "Failed to login", error });
    }
  };