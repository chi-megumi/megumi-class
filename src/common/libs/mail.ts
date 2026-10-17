import nodemailer from 'nodemailer'

interface SendResetPasswordOtpParams {
  to: string
  otp: string
}

export async function sendResetPasswordOtpEmail({ to, otp }: SendResetPasswordOtpParams) {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || '"Megumi English" <noreply@megumi.edu.vn>'
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465

  // If SMTP is not fully configured, log OTP in console for development/testing
  if (!host || !user || !pass) {
    console.log('\n========================================================')
    console.log(`[Megumi English Auth] PASSWORD RESET OTP FOR: ${to}`)
    console.log(`🔑 OTP CODE: ${otp}`)
    console.log(`⏳ EXPIRES IN: 10 minutes`)
    console.log('========================================================\n')
    return { success: true, mocked: true }
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
  })

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

  await transporter.sendMail({
    from,
    to,
    subject: `[Megumi English] Mã xác thực đặt lại mật khẩu: ${otp}`,
    text: `Mã OTP đặt lại mật khẩu của bạn là: ${otp}. Mã có hiệu lực trong 10 phút.`,
    html: htmlContent,
  })

  return { success: true, mocked: false }
}
