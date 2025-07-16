import nodemailer from 'nodemailer';
import asyncHandler from 'express-async-handler';

const sendMail = asyncHandler(async ({ email, html, type }) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.GOOGLE_EMAIL_NAME,
            pass: process.env.GOOGLE_EMAIL_PASSWORD,
        },
    });

    let subject = '';
    let text = '';

    switch (type) {
        case 'verify_account':
            subject = "Account Verification";
            text = `Hello,\n\nPlease use the following code to verify your account:\n`;
            break;
        case 'forgot_password':
            subject = "Forgot Password";
            text = `Hello,\n\nPlease use the following code to reset your password:\n`;
            break;
        case 'interview_schedule':
            subject = "Interview Invitation";
            text = `Your application has been accepted! Please check the HTML version for interview details.`;
            break;
        // case 'accepted':
        //     subject = "Organizer Request Accepted";
        //     text = `Hello,\n\nYour request to become an organizer has been accepted. Congratulations\n`;
        //     break;
        // case 'rejected':
        //     subject = "Organizer Request Rejected";
        //     text = `Hello,\n\nYour request to become an organizer has been rejected.\n`;
        //     break;  
        default:
            throw new Error('Invalid email type');
    }

    try {
        const info = await transporter.sendMail({
            from: '"EasyJob" <no-reply@example.com>', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            text: text, // Plain text body
            html: html, // HTML body
        });

        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
});

export default sendMail;