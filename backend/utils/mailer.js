import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let transporter;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  console.warn("⚠️ Nodemailer: EMAIL_USER and EMAIL_PASS environment variables are not set. Emails will be logged to console instead of sent.");
}

// Send standard email
export const sendEmail = async ({ to, subject, text, html }) => {
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"HospCare Notifications" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      });
      console.log(`✉️ Email successfully sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error.message);
      return false;
    }
  } else {
    console.log(`\n========================================================================\n✉️ [MOCK EMAIL] To: ${to}\nSubject: ${subject}\nBody:\n${text || html.replace(/<[^>]*>/g, '')}\n========================================================================\n`);
    return { mock: true, messageId: "mock-id-" + Date.now() };
  }
};

// Send Appointment Booking Confirmation
export const sendAppointmentConfirmationEmail = async ({ userEmail, doctorEmail, doctorOrganization, serviceType }) => {
  const subject = "Appointment Booked Successfully - HospCare";
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.05em;">HospCare</h1>
        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Your Health, Connected</p>
      </div>
      <div style="padding: 24px; background-color: #ffffff;">
        <h2 style="color: #1e293b; margin-top: 0; font-size: 20px; font-weight: 600;">Appointment Confirmed!</h2>
        <p style="color: #64748b; line-height: 1.6; font-size: 15px;">Hello,</p>
        <p style="color: #64748b; line-height: 1.6; font-size: 15px;">Your appointment has been successfully booked. Below are the details:</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #475569; width: 40%;">Doctor Email:</td>
              <td style="padding: 6px 0; color: #1e293b;">${doctorEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #475569;">Hospital/Clinic:</td>
              <td style="padding: 6px 0; color: #1e293b;">${doctorOrganization}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #475569;">Service Type:</td>
              <td style="padding: 6px 0; color: #1e293b;">${serviceType}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #64748b; line-height: 1.6; font-size: 15px;">Please arrive 10 minutes prior to your scheduled slot. If you need to modify or cancel, please check your HospCare dashboard.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">This is an automated message, please do not reply directly to this email.</p>
      </div>
    </div>
  `;
  const text = `Appointment Confirmed!\n\nYour appointment has been successfully booked.\nDoctor: ${doctorEmail}\nHospital: ${doctorOrganization}\nService Type: ${serviceType}\n\nThank you for choosing HospCare.`;

  return sendEmail({ to: userEmail, subject, text, html });
};

// Send Doctor notification of new booking
export const sendDoctorBookingNotificationEmail = async ({ userEmail, doctorEmail, userAge, userMobile, serviceType }) => {
  const subject = "New Appointment Booking Received - HospCare";
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.05em;">HospCare Provider Portal</h1>
        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Appointment Scheduling System</p>
      </div>
      <div style="padding: 24px; background-color: #ffffff;">
        <h2 style="color: #1e293b; margin-top: 0; font-size: 20px; font-weight: 600;">New Appointment Request</h2>
        <p style="color: #64748b; line-height: 1.6; font-size: 15px;">Hello Doctor,</p>
        <p style="color: #64748b; line-height: 1.6; font-size: 15px;">A new appointment has been scheduled with you. Below are the details:</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #0f172a; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #475569; width: 40%;">Patient Email:</td>
              <td style="padding: 6px 0; color: #1e293b;">${userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #475569;">Age:</td>
              <td style="padding: 6px 0; color: #1e293b;">${userAge}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #475569;">Mobile Number:</td>
              <td style="padding: 6px 0; color: #1e293b;">${userMobile}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #475569;">Requested Service:</td>
              <td style="padding: 6px 0; color: #1e293b;">${serviceType}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #64748b; line-height: 1.6; font-size: 15px;">Please log in to your provider dashboard to view details and manage this appointment.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">This is an automated message, please do not reply directly to this email.</p>
      </div>
    </div>
  `;
  const text = `New Appointment Scheduled\n\nPatient: ${userEmail}\nAge: ${userAge}\nMobile: ${userMobile}\nService: ${serviceType}\n\nPlease check your provider dashboard.`;

  return sendEmail({ to: doctorEmail, subject, text, html });
};

// Send Appointment Status Update Email
export const sendAppointmentStatusUpdateEmail = async ({ userEmail, doctorEmail, status }) => {
  let statusText = "Pending";
  let color = "#e2e8f0";
  let statusDescription = "Your appointment is currently in the queue.";

  if (status === 1) {
    statusText = "Batch Scheduled (Phase 1)";
    color = "#3b82f6";
    statusDescription = "Your appointment is scheduled and you are currently in Phase 1 queue.";
  } else if (status === 2) {
    statusText = "In Progress / Consultation (Phase 2)";
    color = "#f59e0b";
    statusDescription = "Your appointment has been activated. Please head to your consultation room or get ready for your turn.";
  } else if (status === 3) {
    statusText = "Completed (Phase 3)";
    color = "#10b981";
    statusDescription = "Your appointment is marked as completed. We hope you had a good experience.";
  }

  const subject = `Appointment Status Update: ${statusText} - HospCare`;
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.05em;">HospCare Update</h1>
        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Real-time Appointment Tracker</p>
      </div>
      <div style="padding: 24px; background-color: #ffffff;">
        <h2 style="color: #1e293b; margin-top: 0; font-size: 20px; font-weight: 600;">Status Updated</h2>
        <p style="color: #64748b; line-height: 1.6; font-size: 15px;">Hello,</p>
        <p style="color: #64748b; line-height: 1.6; font-size: 15px;">The status of your appointment with doctor <strong>${doctorEmail}</strong> has changed:</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid ${color}; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <div style="font-size: 16px; font-weight: 700; color: ${color}; margin-bottom: 6px;">
            ${statusText}
          </div>
          <div style="font-size: 14px; color: #475569;">
            ${statusDescription}
          </div>
        </div>
        
        <p style="color: #64748b; line-height: 1.6; font-size: 15px;">You can view the real-time queue status directly in your dashboard.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">This is an automated message, please do not reply directly to this email.</p>
      </div>
    </div>
  `;
  const text = `Appointment Status Update!\n\nYour appointment with ${doctorEmail} status has changed to: ${statusText}\n${statusDescription}\n\nThank you for choosing HospCare.`;

  return sendEmail({ to: userEmail, subject, text, html });
};
