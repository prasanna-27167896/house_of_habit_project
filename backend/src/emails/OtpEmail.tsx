import * as React from "react";

export const OtpEmail = ({ otp }: { otp: number }) => {
  const otpStr = otp.toString().padStart(4, "0");
  const digits = otpStr.split("");

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>One-Time Password Verification</title>
        
        {/* Import Inter Font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        <style dangerouslySetInnerHTML={{ __html: `
          /* CSS Reset for Email Clients */
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
          table { border-collapse: collapse !important; }
          body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #FAFAFA; font-family: 'Inter', Arial, sans-serif; }
          
          /* Responsive Styles for Mobile */
          @media screen and (max-width: 600px) {
            .container {
              width: 100% !important;
            }
            .hero-content {
              padding-top: 55% !important;
              padding-left: 15px !important;
              padding-right: 15px !important;
            }
            .title {
              font-size: 22px !important;
            }
            .subtitle {
              font-size: 14px !important;
            }
            .otp-box {
              width: 44px !important;
              height: 54px !important;
              font-size: 22px !important;
              line-height: 54px !important;
              border-radius: 12px !important;
              margin: 0 4px !important;
            }
            .footer-text {
              font-size: 13px !important;
              padding: 0 10px !important;
            }
          }
        `}} />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#FAFAFA", fontFamily: "'Inter', Arial, sans-serif", WebkitFontSmoothing: "antialiased" }}>

        {/* Main Wrapper Table */}
        <table border={0} cellPadding={0} cellSpacing={0} width="100%" style={{ backgroundColor: "#FAFAFA" }}>
          <tbody>
            <tr>
              <td align="center" style={{ paddingBottom: "40px" }}>
                
                {/* Email Container */}
                <table border={0} cellPadding={0} cellSpacing={0} width="600" className="container" style={{ backgroundColor: "#FAFAFA", maxWidth: "600px" }}>
                  <tbody>
                    {/* Combined Hero and Content Section */}
                    <tr>
                      {/* IMPORTANT: Replace the url() with the absolute URL hosted on your server */}
                      <td align="center" className="hero-content" style={{ backgroundColor: "#FAFAFA", backgroundImage: "url('https://plain-apac-prod-public.komododecks.com/202607/20/Mb23Bl202pjQ8CbuKC90/image.png')", backgroundPosition: "top center", backgroundSize: "100% auto", backgroundRepeat: "no-repeat", padding: "270px 10px 0 10px" }}>
                        
                        <h1 className="title" style={{ fontSize: "32px", fontWeight: 600, color: "#111827", margin: "0 0 12px 0", letterSpacing: "-0.02em" }}>
                          One-Time Password Verification
                        </h1>
                        
                        <p className="subtitle" style={{ color: "#374151", fontSize: "15px", fontWeight: 500, margin: "0 0 40px 0" }}>
                          Use the OTP below to complete your registration securely.
                        </p>

                        {/* Greeting */}
                        <table border={0} cellPadding={0} cellSpacing={0} width="100%">
                          <tbody>
                            <tr>
                              <td align="left" style={{ paddingBottom: "24px" }}>
                                <p style={{ fontSize: "20px", fontWeight: 600, color: "#111827", margin: "0 0 8px 0" }}>Dear Customer,</p>
                                <p style={{ color: "#1f2937", fontSize: "16px", lineHeight: 1.6, margin: 0 }}>
                                  Thank you for registering with us. Use the OTP below to verify your email address
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* OTP Boxes */}
                        <div style={{ textAlign: "center", marginBottom: "40px", width: "100%" }}>
                          {digits.map((digit, index) => (
                            <span key={index} className="otp-box" style={{ display: "inline-block", width: "68px", height: "80px", backgroundColor: "#ffffff", borderRadius: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.03)", lineHeight: "80px", textAlign: "center", fontSize: "32px", fontWeight: 600, color: "#111827", margin: "0 6px" }}>
                              {digit}
                            </span>
                          ))}
                        </div>

                        {/* Expiry Notice */}
                        <table border={0} cellPadding={0} cellSpacing={0} width="100%">
                          <tbody>
                            <tr>
                              <td align="left" style={{ paddingBottom: "80px" }}>
                                <p style={{ color: "#1f2937", fontSize: "16px", lineHeight: 1.6, margin: 0 }}>
                                  This OTP is valid for <strong style={{ color: "#111827" }}>2 minutes</strong>. Please do not share it with anyone, If you didn't request this, you can safely ignore this email
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Footer */}
                        <table border={0} cellPadding={0} cellSpacing={0} width="100%" style={{ marginBottom: "24px", opacity: 0.8 }}>
                          <tbody>
                            <tr>
                              {/* Email safe divider lines using borders */}
                              <td width="20%" style={{ borderTop: "1px solid #fed7aa" }}></td>
                              <td width="60%" align="center" className="footer-text" style={{ padding: "0 20px", color: "#1f2937", fontWeight: 500, fontSize: "15px" }}>
                                Welcome aboard - let's get you styled
                              </td>
                              <td width="20%" style={{ borderTop: "1px solid #fed7aa" }}></td>
                            </tr>
                          </tbody>
                        </table>
                        
                        <p style={{ color: "#6b7280", fontSize: "12px", margin: 0 }}>
                          ©2026 All rights reserved House of Habit.in
                        </p>

                      </td>
                    </tr>
                  </tbody>
                </table>
                
              </td>
            </tr>
          </tbody>
        </table>

      </body>
    </html>
  );
};
