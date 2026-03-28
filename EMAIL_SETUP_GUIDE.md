# Email Notification Setup Guide

✅ **EMAIL NOTIFICATIONS ARE NOW IMPLEMENTED WITH MULTIPLE FREE OPTIONS!**

Your E-pass management system now automatically sends email notifications to `mrcet9177@gmail.com` whenever a student submits a leave request.

## 🎯 **Multiple Free Email Options Available:**

### 1. **EmailJS (Recommended)**
- **Service ID**: `service_2ndwaxr`
- **Template ID**: `template_umv60te`
- **Public Key**: `SFiccr27BNUy-T3Ah`
- **Cost**: Free tier available
- **How it works**: Sends email directly through EmailJS service

### 2. **Default Email Client (Always Free)**
- **Cost**: Completely free, no external services needed
- **How it works**: Opens your default email app (Gmail, Outlook, etc.) with pre-filled content
- **Perfect for**: When EmailJS fails or you prefer manual control

### 3. **Console Logging (Free Testing)**
- **Cost**: Free
- **How it works**: Logs email content to browser console for testing
- **Perfect for**: Development and debugging

## 🚀 **How to Test**

1. **Start your development server**: `npm run dev`
2. **Go to Admin page** and use the "Email Notification Options" component
3. **Choose your preferred method** and test email sending
4. **Or go to Student page** and submit a real gatepass request
5. **Check your email** at `mrcet9177@gmail.com` or your default email client

## What's Included in the Email

- Student ID, Section, Department
- Leave date & time
- Expected return time
- Description/reason for leave
- Submission timestamp

## Option 1: EmailJS (Recommended for Production)

### Step 1: Sign up for EmailJS
1. Go to [EmailJS](https://www.emailjs.com/) and create a free account
2. Verify your email address

### Step 2: Create an Email Service
1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. Note down your **Service ID**

### Step 3: Create an Email Template
1. Go to "Email Templates"
2. Click "Create New Template"
3. Use this template:

**Subject:** New Gatepass Request - {{student_id}}

**HTML Content:**
```html
<h2>New Gatepass Request Submitted</h2>
<p><strong>Student ID:</strong> {{student_id}}</p>
<p><strong>Section:</strong> {{section}}</p>
<p><strong>Department:</strong> {{department}}</p>
<p><strong>Leave Date & Time:</strong> {{leave_datetime}}</p>
<p><strong>Expected Return:</strong> {{return_datetime}}</p>
<p><strong>Description:</strong> {{description}}</p>
<p><strong>Submitted:</strong> {{submitted_at}}</p>
<hr>
<p><em>This is an automated notification from the E-pass Management System.</em></p>
```

4. Note down your **Template ID**

### Step 4: Get Your Public Key
1. Go to "Account" → "API Keys"
2. Copy your **Public Key**

### Step 5: Update the Code
1. Open `src/lib/emailService.ts`
2. Replace the placeholder values:
   ```typescript
   const EMAILJS_SERVICE_ID = 'your_service_id_here';
   const EMAILJS_TEMPLATE_ID = 'your_template_id_here';
   const EMAILJS_PUBLIC_KEY = 'your_public_key_here';
   ```

### Step 6: Switch to EmailJS
1. In `src/pages/StudentPage.tsx`, change the import:
   ```typescript
   import { sendLeaveRequestNotification } from '../lib/emailService';
   ```
2. Update the function call:
   ```typescript
   const emailSent = await sendLeaveRequestNotification(emailData);
   ```

## Option 2: Webhook-based Solution

### Step 1: Set up a Webhook
1. Go to [webhook.site](https://webhook.site/)
2. Copy your unique webhook URL
3. You can also use services like:
   - Zapier
   - Integromat
   - Your own webhook endpoint

### Step 2: Configure the Webhook
1. Open `src/lib/emailService.ts`
2. Replace the webhook URL:
   ```typescript
   const webhookUrl = 'https://webhook.site/your_unique_id_here';
   ```

### Step 3: Set up Email Forwarding
1. Configure your webhook service to forward emails to `mrcet9177@gmail.com`
2. Set up email templates in your webhook service

## Option 3: Console Notification (Current Setup)

The system is currently configured to use console notifications for testing. You can see the email notifications in the browser's developer console (F12 → Console tab).

To switch to console notifications:
```typescript
import { sendLeaveRequestNotificationConsole } from '../lib/emailService';
```

## Testing the Email Notifications

1. Start your development server: `npm run dev`
2. Go to the Student page
3. Submit a gatepass request
4. Check the console for email notification logs
5. If using EmailJS or webhook, check your email inbox

## Troubleshooting

### EmailJS Issues
- Make sure your service is properly configured
- Check that your template variables match the code
- Verify your public key is correct
- Check the browser console for error messages

### Webhook Issues
- Verify your webhook URL is correct
- Check that your webhook service is active
- Test the webhook endpoint separately

### General Issues
- Check browser console for error messages
- Ensure all dependencies are installed: `npm install`
- Verify the email address is correct: `mrcet9177@gmail.com`

## Security Considerations

1. **EmailJS**: Public keys are safe to expose in client-side code
2. **Webhooks**: Use HTTPS URLs only
3. **Rate Limiting**: Consider implementing rate limiting for email notifications
4. **Error Handling**: The system gracefully handles email failures

## Production Deployment

For production deployment:
1. Use EmailJS with a paid plan for better reliability
2. Set up proper error monitoring
3. Consider using a backend service for more secure email handling
4. Implement email templates with your institution's branding

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all configuration values are correct
3. Test with the console notification first
4. Check EmailJS/webhook service status 