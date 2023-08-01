import fs from "fs";
import nodemailer from "nodemailer";
import { emailConfig } from "../Config/emailConfig.js";

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(emailConfig);

// Converting Stream to Buffer
export const streamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    const buffers = [];
    stream.on("data", (data) => buffers.push(data));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(buffers)));
  });
};

// GetFile Content
export const getFileContent = async (filePath) => {
  const fileStream = fs.createReadStream(filePath);
  const buffer = await streamToBuffer(fileStream);
  return buffer.toString();
};

// send mail with defined transport object
export const sendEmails = (to, subject, content) => {
  try {
    
    const message = {
      from: emailConfig.auth.user,
      to: to,
      subject: subject,
      html: content
      
    };
    transporter.sendMail(message ,(err, info) => {
      if (err) {
          console.log('Error occurred. ' + err.message);
          
      }

      console.log('Message sent: ', info);
      
      
  })
  } catch (error) {
    console.error(error);
  }
};
