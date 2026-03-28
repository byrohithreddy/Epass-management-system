import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_2ndwaxr';
const EMAILJS_TEMPLATE_ID = 'template_umv60te';
const EMAILJS_PUBLIC_KEY = 'SFiccr27BNUy-T3Ah';

export interface EmailNotificationData {
  student_id: string;
  section: string;
  department: string;
  leave_datetime: string;
  return_datetime?: string;
  description: string;
  submitted_at: string;
}

// Simple notification storage for local testing
let notificationHistory: Array<{
  id: string;
  timestamp: string;
  data: EmailNotificationData;
  status: 'sent' | 'failed';
}> = [];

export const sendLeaveRequestNotification = async (data: EmailNotificationData): Promise<boolean> => {
  try {
    console.log('🔧 Starting email notification process...');
    console.log('🔧 EmailJS Config:', {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID,
      publicKey: EMAILJS_PUBLIC_KEY
    });

    const templateParams = {
      to_email: 'mrcet9177@gmail.com',
      student_id: data.student_id,
      section: data.section,
      department: data.department,
      leave_datetime: new Date(data.leave_datetime).toLocaleString(),
      return_datetime: data.return_datetime ? new Date(data.return_datetime).toLocaleString() : 'Not specified',
      description: data.description,
      submitted_at: new Date(data.submitted_at).toLocaleString(),
      subject: `New Gatepass Request - ${data.student_id}`,
    };

    console.log('📧 Sending email notification with params:', templateParams);

    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Email notification sent successfully:', response);
    
    // Store successful notification
    notificationHistory.push({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      data,
      status: 'sent'
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error sending email notification:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Store failed notification
    notificationHistory.push({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      data,
      status: 'failed'
    });
    
    // Fallback to console notification if EmailJS fails
    console.log('📧 EMAIL NOTIFICATION FALLBACK - Would send to: mrcet9177@gmail.com');
    console.log('📧 Subject: New Gatepass Request -', data.student_id);
    console.log('📧 Content:', {
      student_id: data.student_id,
      section: data.section,
      department: data.department,
      leave_datetime: new Date(data.leave_datetime).toLocaleString(),
      return_datetime: data.return_datetime ? new Date(data.return_datetime).toLocaleString() : 'Not specified',
      description: data.description,
      submitted_at: new Date(data.submitted_at).toLocaleString(),
    });
    
    return false;
  }
};

// Alternative: Open default email client (completely free, no external services needed)
export const openEmailClient = (data: EmailNotificationData): boolean => {
  try {
    const subject = encodeURIComponent(`New Gatepass Request - ${data.student_id}`);
    const body = encodeURIComponent(`
New Gatepass Request Submitted

Student ID: ${data.student_id}
Section: ${data.section}
Department: ${data.department}
Leave Date & Time: ${new Date(data.leave_datetime).toLocaleString()}
Expected Return: ${data.return_datetime ? new Date(data.return_datetime).toLocaleString() : 'Not specified'}
Description: ${data.description}
Submitted: ${new Date(data.submitted_at).toLocaleString()}

This is an automated notification from the E-pass Management System.
    `);
    
    const mailtoLink = `mailto:mrcet9177@gmail.com?subject=${subject}&body=${body}`;
    
    // Open default email client
    window.open(mailtoLink, '_blank');
    
    // Store notification
    notificationHistory.push({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      data,
      status: 'sent'
    });
    
    return true;
  } catch (error) {
    console.error('Error opening email client:', error);
    return false;
  }
};

// Get notification history for debugging
export const getNotificationHistory = () => {
  return [...notificationHistory];
};

// Clear notification history
export const clearNotificationHistory = () => {
  notificationHistory = [];
};

// Simple console notification (for development/testing)
export const sendLeaveRequestNotificationConsole = async (data: EmailNotificationData): Promise<boolean> => {
  try {
    console.log('📧 EMAIL NOTIFICATION SENT TO: mrcet9177@gmail.com');
    console.log('📧 Subject: New Gatepass Request -', data.student_id);
    console.log('📧 Content:', {
      student_id: data.student_id,
      section: data.section,
      department: data.department,
      leave_datetime: new Date(data.leave_datetime).toLocaleString(),
      return_datetime: data.return_datetime ? new Date(data.return_datetime).toLocaleString() : 'Not specified',
      description: data.description,
      submitted_at: new Date(data.submitted_at).toLocaleString(),
    });
    
    // Store notification
    notificationHistory.push({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      data,
      status: 'sent'
    });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Error in console notification:', error);
    return false;
  }
}; 