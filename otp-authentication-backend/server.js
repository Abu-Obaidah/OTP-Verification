const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
async function connectToMongoDB() {
  mongoose.connect('mongodb://127.0.0.1:27017/otp_authentication', { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('Successfully connected to MongoDB Compass'))
    .catch(error => console.error('Error while connecting to MongoDB Compass:', error));
}

connectToMongoDB();

// Define OTP Schema
const otpSchema = new mongoose.Schema({
  email: String,
  otp: String
});
const OTP = mongoose.model('OTP', otpSchema);

// Send OTP
app.post('/sendOTP', (req, res) => {
  const email = req.body.email;

  // Generate random OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();


  // Save OTP to DB
  const newOTP = new OTP({ email, otp });
  newOTP.save()
    .then(() => {
      // Send OTP via email
      const transporter = nodemailer.createTransport({
        // Configure your email provider here (e.g., Gmail, SendGrid, etc.)
        service: 'gmail',
        auth: {
          user: 'abuobaidah00@gmail.com',
          pass: 'sriepuucwbcrusbb'
        }
      });

      const mailOptions = {
        from: 'abuobaidah00@gmail.com',
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP is: ${otp}`
      };

      transporter.sendMail(mailOptions)
        .then((info) => {
          console.log('OTP sent:', info.response);
          res.json({ success: true });
        })
        .catch((error) => {
          console.error('Error sending email:', error);
          res.json({ success: false });
        });
    })
    .catch((error) => {
      console.error('Error saving OTP:', error);
      res.json({ success: false });
    });

});

// Verify OTP
app.post('/verifyOTP', async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.otp;
    
    // Find OTP in DB
    const result = await OTP.findOne({ email, otp }).exec();

    if (result) {
      // OTP matched
      res.json({ success: true });
    } else {
      // OTP not found
      res.json({ success: false });
    }
  } catch (error) {
    console.error('Error finding OTP:', error);
    res.json({ success: false });
  }
});


// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
