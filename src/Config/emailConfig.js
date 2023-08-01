import { config } from 'dotenv'
config()

export const emailConfig = {

  host: "mail.geekslogicity.com",
  port: 587,
  secure: false,
  auth: {
    user: "aurora@geekslogicity.com",
    pass: "Mniaj786!!??"
  },
  tls: {
    rejectUnauthorized: false, // Disable SSL/TLS verification
  },
}

// {
//     service: 'gmail',
//     auth: {
//       type: 'OAuth2',
//       user: process.env.MAIL_USERNAME,
//       pass: process.env.MAIL_PASSWORD,
//       clientId: process.env.OAUTH_CLIENTID,
//       clientSecret: process.env.OAUTH_CLIENT_SECRET,
//       refreshToken: process.env.OAUTH_REFRESH_TOKEN
//     }
// }
