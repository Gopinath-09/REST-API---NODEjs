const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
    //mailtrap
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    //gmail
    /* const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.APP_USER,
            pass: process.env.APP_PASS
        }
    }); */

    const emailOptions = {
        from: `REST-API support<support@restapi.com>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(emailOptions);
}

module.exports = sendEmail;