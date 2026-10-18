import nodemailer from 'nodemailer'

interface SendResetPasswordOtpParams {
  to: string
  otp: string
}

export interface SendConsultationEmailParams {
  fullName: string
  phone: string
  email?: string
  course: string
  learningGoal?: string
}

/**
 * Khởi tạo Gmail / SMTP Transporter
 */
const getMailTransporter = () => {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) return null

  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465
  const isSecure = process.env.SMTP_SECURE === 'false' ? false : true

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: {
        user,
        // Tự động bỏ dấu cách nếu người dùng copy mã App Password dạng "abcd efgh ijkl mnop"
        pass: pass.replace(/\s+/g, ''),
      },
    }),
    from: process.env.SMTP_FROM || `"Megumi English" <${user}>`,
  }
}

/**
 * Gửi email chứa mã OTP đặt lại mật khẩu
 */
export async function sendResetPasswordOtpEmail({ to, otp }: SendResetPasswordOtpParams) {
  const mailer = getMailTransporter()

  // Chế độ Dev/Fallback: Nếu chưa cấu hình mật khẩu SMTP, in mã OTP ra Terminal
  if (!mailer) {
    console.log('\n========================================================')
    console.log(`[Megumi English Auth] PASSWORD RESET OTP FOR: ${to}`)
    console.log(`🔑 OTP CODE: ${otp}`)
    console.log(`⏳ EXPIRES IN: 10 minutes`)
    console.log('💡 Lưu ý: Hãy cấu hình SMTP_USER và SMTP_PASS trong .env để gửi email thật.')
    console.log('========================================================\n')
    return { success: true, mocked: true }
  }

  const subject = `[Megumi English] Mã xác thực đặt lại mật khẩu: ${otp}`
  const text = `Mã OTP đặt lại mật khẩu của bạn là: ${otp}. Mã có hiệu lực trong 10 phút.`
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8">
      <title>Đặt lại mật khẩu - Megumi English</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #1f2937; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { text-align: center; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: 700; color: #4f46e5; }
        .title { font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #111827; }
        .otp-box { background: #f3f4f6; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4f46e5; }
        .notice { font-size: 14px; color: #6b7280; line-height: 1.5; margin-bottom: 16px; }
        .footer { border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #9ca3af; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Megumi English</div>
        </div>
        <div class="title">Yêu cầu đặt lại mật khẩu</div>
        <p class="notice">Xin chào,</p>
        <p class="notice">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${to}</strong>. Dưới đây là mã xác thực OTP của bạn:</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <p class="notice">Mã OTP này có hiệu lực trong vòng <strong>10 phút</strong>. Vì lý do bảo mật, tuyệt đối không chia sẻ mã này với bất kỳ ai.</p>
        <p class="notice">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ hỗ trợ.</p>
        <div class="footer">
          © ${new Date().getFullYear()} Megumi English. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `

  await mailer.transporter.sendMail({
    from: mailer.from,
    to,
    subject,
    text,
    html: htmlContent,
  })

  return { success: true, mocked: false }
}

/**
 * Gửi email thông báo khi có học viên đăng ký tư vấn 0đ từ Landing Page
 */
export async function sendConsultationNotificationEmail(params: SendConsultationEmailParams) {
  const { fullName, phone, email, course, learningGoal } = params
  const mailer = getMailTransporter()
  const receiverEmail = process.env.CONSULTATION_RECEIVER_EMAIL || 'chidoan995.work@gmail.com'

  const cleanedPhone = phone.replace(/\D/g, '')
  const zaloPhone = cleanedPhone.startsWith('84') ? '0' + cleanedPhone.slice(2) : cleanedPhone
  const submittedAt = new Date().toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
    dateStyle: 'full',
    timeStyle: 'medium',
  })

  if (!mailer) {
    console.log('\n========================================================')
    console.log(`[Megumi Class] NEW CONSULTATION REGISTRATION!`)
    console.log(`📨 Sent To: ${receiverEmail}`)
    console.log(`👤 Họ và tên: ${fullName}`)
    console.log(`📞 Số điện thoại (Zalo): ${phone}`)
    console.log(`✉️ Email: ${email || '(Không cung cấp)'}`)
    console.log(`📚 Khóa học quan tâm: ${course}`)
    console.log(`🎯 Mục tiêu / Thắc mắc: ${learningGoal || '(Không có)'}`)
    console.log(`⏰ Thời gian: ${submittedAt}`)
    console.log('========================================================\n')
    return { success: true, mocked: true }
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8">
      <title>Đăng ký tư vấn mới - Megumi Class</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #db2777 100%); color: #ffffff; padding: 32px 28px; text-align: center; }
        .header h1 { margin: 0 0 8px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
        .header p { margin: 0; font-size: 14px; opacity: 0.9; }
        .badge { display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-top: 10px; }
        .content { padding: 28px; }
        .field-group { margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; }
        .field-group:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .field-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 6px; }
        .field-value { font-size: 16px; font-weight: 600; color: #0f172a; line-height: 1.5; }
        .highlight-course { color: #4f46e5; font-size: 16px; font-weight: 700; background: #eef2ff; padding: 8px 12px; border-radius: 8px; display: inline-block; }
        .goal-box { background: #f8fafc; border-left: 4px solid #db2777; padding: 12px 16px; border-radius: 4px; font-size: 14px; color: #334155; line-height: 1.6; }
        .action-row { display: flex; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 2px dashed #e2e8f0; }
        .btn { display: inline-block; padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; text-align: center; }
        .btn-call { background: #10b981; color: #ffffff !important; }
        .btn-zalo { background: #0068ff; color: #ffffff !important; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; font-size: 12px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ĐĂNG KÝ HỌC THỬ 0Đ MỚI ✨</h1>
          <p>Có học viên vừa gửi thông tin đăng ký tư vấn từ Landing Page</p>
          <div class="badge">Phản hồi mục tiêu: trong vòng 15 phút</div>
        </div>

        <div class="content">
          <div class="field-group">
            <div class="field-label">Họ và tên học viên</div>
            <div class="field-value">${fullName}</div>
          </div>

          <div class="field-group">
            <div class="field-label">Số điện thoại (Zalo)</div>
            <div class="field-value">
              <a href="tel:${phone}" style="color: #0f172a; text-decoration: none; font-weight: 700;">${phone}</a>
            </div>
          </div>

          <div class="field-group">
            <div class="field-label">Email liên hệ</div>
            <div class="field-value">
              ${email ? `<a href="mailto:${email}" style="color: #4f46e5;">${email}</a>` : '<span style="color: #94a3b8; font-weight: 400;">(Chưa cung cấp)</span>'}
            </div>
          </div>

          <div class="field-group">
            <div class="field-label">Khóa học quan tâm</div>
            <div class="highlight-course">${course}</div>
          </div>

          <div class="field-group">
            <div class="field-label">Mục tiêu hoặc thắc mắc của học viên</div>
            <div class="goal-box">
              ${learningGoal ? learningGoal.replace(/\n/g, '<br/>') : '<em>(Không có ghi chú thêm)</em>'}
            </div>
          </div>

          <div class="field-group">
            <div class="field-label">Thời gian đăng ký</div>
            <div style="font-size: 13px; color: #64748b;">${submittedAt}</div>
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
            <tr>
              <td align="center" style="padding-right: 6px;">
                <a href="tel:${phone}" class="btn btn-call" style="display: block; width: 90%; background: #10b981; color: #ffffff; text-decoration: none; padding: 12px; border-radius: 8px; font-weight: 700;">📞 Gọi Điện Ngay</a>
              </td>
              <td align="center" style="padding-left: 6px;">
                <a href="https://zalo.me/${zaloPhone}" class="btn btn-zalo" style="display: block; width: 90%; background: #0068ff; color: #ffffff; text-decoration: none; padding: 12px; border-radius: 8px; font-weight: 700;">💬 Nhắn Tin Zalo</a>
              </td>
            </tr>
          </table>
        </div>

        <div class="footer">
          Hệ thống thông báo tự động Megumi Class • Email nhận: ${receiverEmail}
        </div>
      </div>
    </body>
    </html>
  `

  await mailer.transporter.sendMail({
    from: mailer.from,
    to: receiverEmail,
    replyTo: email || undefined,
    subject: `[Megumi Class] Đăng ký học thử 0đ mới: ${fullName} - ${phone}`,
    text: `Đăng ký học thử 0đ mới:\n- Họ tên: ${fullName}\n- SĐT: ${phone}\n- Email: ${email || 'N/A'}\n- Khóa học: ${course}\n- Mục tiêu: ${learningGoal || 'N/A'}\n- Thời gian: ${submittedAt}`,
    html: htmlContent,
  })

  return { success: true, mocked: false }
}
