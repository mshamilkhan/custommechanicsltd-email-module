import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Route to handle form submissions
app.post("/api/book-now", async (req, res) => {
  try {
    const { name, contact, email, service, description, dateTime } = req.body;

    if (!name || !contact || !email || !service || !description || !dateTime) {
      return res.status(400).json({ success: false, error: "All fields including dateTime are required" });
    }

    // Prepare a readable date/time string (simple, robust)
    // datetime-local usually comes as "YYYY-MM-DDTHH:MM". We'll present it as "YYYY-MM-DD HH:MM"
    const formattedDateTime = String(dateTime).replace("T", " ");

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content (includes date/time)
    const mailOptions = {
      from: `"Custom Mechanics Form" <${process.env.EMAIL_USER}>`,
      to: process.env.TO_EMAIL,
      subject: `New Booking Request from ${name}`,
      html: `
        <h2>New Booking Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Contact:</strong> ${contact}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Preferred Date & Time:</strong> ${formattedDateTime}</p>
        <p><strong>Description:</strong></p>
        <p>${description}</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent, booking from ${name}, preferred at ${formattedDateTime}`);
    return res.status(200).json({ success: true, message: "Booking email sent successfully!" });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
