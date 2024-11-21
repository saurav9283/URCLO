const { getProviderByEmail, getProviderByPhone, saveProvider, UpdateVerifyProvider, UpdateOTP, UpdateOTPBy_Number } = require("./providerAuth.service");
const bcrypt = require("bcrypt");
module.exports = {
    providerRegister: async (req, res) => {
        try {
            const { name, email, age, DOB, password, servicename, phone, address, availableTime, documentNumber, documentType } = req.body;
            if (!name || !age || !DOB || !password || !servicename || !address || !availableTime || !documentNumber || !documentType) {
                return res.status(400).json({ message: "All fields are required" });
            }
            // Check if email is already registered
            const emailExists = await new Promise((resolve, reject) => {
                getProviderByEmail(email, (err, result) => {
                    if (err) reject(err);
                    resolve(result && result.length > 0);
                });
            });
            if (emailExists) {
                return res.status(409).json({ message: "This Email already in use, try with other email!" });
            }

            const phoneExists = await new Promise((resolve, reject) => {
                getProviderByPhone(phone, (err, result) => {
                    if (err) reject(err);
                    resolve(result && result.length > 0);
                });
            });
            if (phoneExists) {
                return res.status(409).json({ message: "This Phone number already in use, try with other phone number!" });
            }

            let hashedPassword = await bcrypt.hash(password, 10);
            const otp = Math.floor(100000 + Math.random() * 900000);

            const newProvider = {
                name,
                age,
                DOB,
                servicename,
                phone,
                email ,
                address,
                availableTime,
                documentNumber,
                documentType,
                password: hashedPassword,
                otp,
            };
            console.log(newProvider, "newProvider");
            saveProvider(newProvider, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                return res.status(201).json({ msg: result });
            });

        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    providerEmailVerify: async (req, res) => {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const provider = await new Promise((resolve, reject) => {
            getProviderByEmail(email, (err, result) => {
                if (err) reject(err);
                resolve(result && result[0]);
            });
        });
        if (!provider) {
            return res.status(404).json({ message: "Email not registered" });
        }
        if (provider.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        provider.isVerified = 1;
        UpdateVerifyProvider(provider, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            return res.status(200).json({ message: "Email verified successfully" });
        });
    },
    providerPhoneVerify: async (req, res) => {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const provider = await new Promise((resolve, reject) => {
            getProviderByPhone(phone, (err, result) => {
                if (err) reject(err);
                resolve(result && result[0]);
            });
        });
        if (!provider) {
            return res.status(404).json({ message: "Phone number not registered" });
        }
        if (provider.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (provider.isVerified) {
            return res.status(400).json({ message: "Phone number is already verified" });
        }
        if (provider.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }
        provider.isVerified = 1;
        UpdateVerifyProvider(provider, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            return res.status(200).json({ message: "Phone number verified successfully" });
        });
    },
    providerOtpResend: async (req, res) => {
        const { email, phone } = req.body;
            
        if (email) {
            const provider = await new Promise((resolve, reject) => {
                getProviderByEmail(email, (err, result) => {
                    if (err) reject(err);
                    resolve(result && result[0]);
                });
            });
            if (!provider) {
                return res.status(404).json({ message: "Email not registered" });
            }
            if (provider.isVerified ==  0) {
                return res.status(400).json({ message: "verify email first" });
            }
            const otp = Math.floor(100000 + Math.random() * 900000);
            provider.otp = otp;
            UpdateOTP(provider, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                return res.status(200).json({ message: "OTP re-sent successfully" });
            });
        }
        if (phone) {
            const provider = await new Promise((resolve, reject) => {
                getProviderByPhone(phone, (err, result) => {
                    if (err) reject(err);
                    resolve(result && result[0]);
                });
            });
            if (!provider) {
                return res.status(404).json({ message: "Phone number not registered" });
            }
            if (provider.isVerified) {
                return res.status(400).json({ message: "Phone number is already verified" });
            }
            const otp = Math.floor(100000 + Math.random() * 900000);
            provider.otp = otp;
            UpdateOTPBy_Number(provider, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                return res.status(200).json({ message: "OTP re-sent successfully" });
            });
        }
    },
    providerLogin: async (req, res) => {
        const {phone, email,password} = req.body;
        if (!phone && !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const provider = await new Promise((resolve, reject) => {
            getProviderByEmail(email, (err, result) => {
                if (err) reject(err);
                resolve(result && result[0]);
            });
        });
    }
}