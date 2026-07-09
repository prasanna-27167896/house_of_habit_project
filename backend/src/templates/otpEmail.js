export const generateOtpEmail = (otp, userName = "there") => {
  // Ensure OTP is a string so we can split it into the individual boxes
  const otpString = String(otp);

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP Code</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #333333;">
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FAFAFA; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            
            <tr>
              <td align="center" style="padding: 30px 20px 20px 20px; background-image: url('cid:hoh-circles'); background-size: cover; background-position: center top; background-repeat: no-repeat;">
                
                <div style="text-align: right; width: 100%; margin-bottom: 20px;">
                  <img src="cid:hoh-logo" alt="House of Habit" height="30" style="display: inline-block;">
                </div>

                <img src="cid:hoh-envelope" alt="OTP Envelope" width="200" style="display: block; margin: 0 auto;">
                
              </td>
            </tr>

            <tr>
              <td align="center" style="padding: 0 30px 30px 30px;">
                <h1 style="margin: 0 0 10px 0; font-size: 24px; color: #111827; font-weight: 700;">One-Time Password Verification</h1>
                <p style="margin: 0; font-size: 14px; color: #4b5563;">Use the OTP below to complete your registration securely.</p>
              </td>
            </tr>

            <tr>
              <td style="padding: 0 40px 20px 40px;">
                <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #111827;">Dear ${userName},</p>
                <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.5;">
                  Thank you for registering with us. Use the OTP below to verify your email address
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding: 20px 40px;">
                <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                  <tr>
                    <td style="width: 45px; height: 55px; background-color: #ffffff; border: 1px solid #f3f4f6; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; color: #111827; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">${otpString[0] || ""}</td>
                    <td style="width: 10px;"></td>
                    <td style="width: 45px; height: 55px; background-color: #ffffff; border: 1px solid #f3f4f6; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; color: #111827; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">${otpString[1] || ""}</td>
                    <td style="width: 10px;"></td>
                    <td style="width: 45px; height: 55px; background-color: #ffffff; border: 1px solid #f3f4f6; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; color: #111827; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">${otpString[2] || ""}</td>
                    <td style="width: 10px;"></td>
                    <td style="width: 45px; height: 55px; background-color: #ffffff; border: 1px solid #f3f4f6; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; color: #111827; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">${otpString[3] || ""}</td>
                    <td style="width: 10px;"></td>
                    <td style="width: 45px; height: 55px; background-color: #ffffff; border: 1px solid #f3f4f6; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; color: #111827; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">${otpString[4] || ""}</td>
                    <td style="width: 10px;"></td>
                    <td style="width: 45px; height: 55px; background-color: #ffffff; border: 1px solid #f3f4f6; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; color: #111827; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">${otpString[5] || ""}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding: 0 40px 30px 40px;">
                <span style="color: #ff6b35; font-size: 14px; font-weight: bold;">
                  &#128203; Copy OTP
                </span>
              </td>
            </tr>

            <tr>
              <td style="padding: 0 40px 30px 40px;">
                <p style="font-size: 15px; color: #4b5563; line-height: 1.5; margin: 0;">
                  This OTP is valid for <strong>2 minutes</strong>. Please do not share it with anyone. If you didn't request this, you can safely ignore this email
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding: 0 40px 30px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="height: 1px; background-color: #fee2e2; width: 25%;"></td>
                    <td align="center" style="width: 50%; color: #374151; font-size: 14px; font-weight: 500;">Welcome aboard - let's get you styled</td>
                    <td style="height: 1px; background-color: #fee2e2; width: 25%;"></td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding: 0 40px 40px 40px;">
                <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                  &copy; ${new Date().getFullYear()} All rights reserved House of Habit.in
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};
