import * as React from "react";

export const OtpEmail = ({ otp }: { otp: number }) => {
  const otpStr = otp.toString().padStart(4, "0");
  const digits = otpStr.split("");

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>One-Time Password Verification</title>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        <style
          dangerouslySetInnerHTML={{
            __html: `
              body,
              table,
              td,
              a {
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
              }

              table,
              td {
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
              }

              img {
                -ms-interpolation-mode: bicubic;
                border: 0;
                outline: none;
                text-decoration: none;
              }

              table {
                border-collapse: collapse !important;
              }

              body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                background-color: #FAFAFA;
                font-family: 'Inter', Arial, sans-serif;
              }

              .container {
                width: 600px;
                max-width: 600px;
              }

              .hero-content {
                padding: 270px 24px 0 24px !important;
              }

              .title {
                font-size: 24px !important;
              }

              .subtitle {
                font-size: 13px !important;
                margin-bottom: 30px !important;
              }

              .greeting-title {
                font-size: 15px !important;
              }

              .greeting-text,
              .expiry-text {
                font-size: 13px !important;
                line-height: 1.5 !important;
              }

              .otp-box {
                width: 56px !important;
                height: 64px !important;
                line-height: 64px !important;
                font-size: 24px !important;
                border-radius: 12px !important;
                margin: 0 4px !important;
              }

              .otp-wrapper {
                margin-bottom: 30px !important;
              }

              .expiry-wrapper {
                padding-bottom: 50px !important;
              }

              .footer-text {
                font-size: 12px !important;
                padding: 0 10px !important;
              }

              .copyright {
                font-size: 10px !important;
              }

              @media screen and (max-width: 600px) {
                .container {
                  width: 100% !important;
                  max-width: 100% !important;
                }

                .hero-content {
                  padding: 150px 18px 0 18px !important;
                  background-size: 100% auto !important;
                }

                .title {
                  font-size: 20px !important;
                  line-height: 1.3 !important;
                  margin-bottom: 8px !important;
                }

                .subtitle {
                  font-size: 12px !important;
                  line-height: 1.5 !important;
                  margin-bottom: 24px !important;
                }

                .greeting-title {
                  font-size: 14px !important;
                }

                .greeting-text,
                .expiry-text {
                  font-size: 12px !important;
                  line-height: 1.5 !important;
                }

                .otp-box {
                  width: 48px !important;
                  height: 56px !important;
                  line-height: 56px !important;
                  font-size: 21px !important;
                  border-radius: 10px !important;
                  margin: 0 2px !important;
                }

                .otp-wrapper {
                  margin-bottom: 26px !important;
                }

                .expiry-wrapper {
                  padding-bottom: 40px !important;
                }

                .footer-text {
                  font-size: 11px !important;
                  padding: 0 6px !important;
                }

                .copyright {
                  font-size: 9px !important;
                }
              }

              @media screen and (max-width: 380px) {
                .hero-content {
                  padding-left: 14px !important;
                  padding-right: 14px !important;
                }

                .title {
                  font-size: 18px !important;
                }

                .subtitle {
                  font-size: 11px !important;
                }

                .greeting-text,
                .expiry-text {
                  font-size: 11px !important;
                }

                .otp-box {
                  width: 42px !important;
                  height: 50px !important;
                  line-height: 50px !important;
                  font-size: 19px !important;
                  margin: 0 1px !important;
                }

                .footer-text {
                  font-size: 10px !important;
                }

                .copyright {
                  font-size: 8px !important;
                }
              }`,
          }}
        />
      </head>

      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#FAFAFA",
          fontFamily: "'Inter', Arial, sans-serif",
        }}
      >
        <table
          border={0}
          cellPadding={0}
          cellSpacing={0}
          width="100%"
          style={{ backgroundColor: "#FAFAFA" }}
        >
          <tbody>
            <tr>
              <td align="center" style={{ paddingBottom: "30px" }}>
                <table
                  border={0}
                  cellPadding={0}
                  cellSpacing={0}
                  width="600"
                  className="container"
                  style={{
                    backgroundColor: "#FAFAFA",
                    maxWidth: "600px",
                    width: "100%",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        align="center"
                        className="hero-content"
                        style={{
                          backgroundColor: "#FAFAFA",
                          backgroundImage:
                            "url('https://plain-apac-prod-public.komododecks.com/202607/20/Mb23Bl202pjQ8CbuKC90/image.png')",
                          backgroundPosition: "top center",
                          backgroundSize: "100% auto",
                          backgroundRepeat: "no-repeat",
                          padding: "270px 24px 0 24px",
                        }}
                      >
                        {/* Title */}
                        <h1
                          className="title"
                          style={{
                            fontSize: "24px",
                            fontWeight: 600,
                            color: "#1e1e1e",
                            margin: "0 0 8px 0",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          One-Time Password Verification
                        </h1>

                        {/* Subtitle */}
                        <p
                          className="subtitle"
                          style={{
                            color: "#1e1e1e",
                            fontSize: "13px",
                            fontWeight: 500,
                            margin: "0 0 30px 0",
                          }}
                        >
                          Use the OTP below to complete your registration
                          securely.
                        </p>

                        {/* Greeting */}
                        <table
                          border={0}
                          cellPadding={0}
                          cellSpacing={0}
                          width="100%"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="left"
                                style={{ paddingBottom: "20px" }}
                              >
                                <p
                                  className="greeting-title"
                                  style={{
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    color: "#1e1e1e",
                                    margin: "0 0 6px 0",
                                  }}
                                >
                                  Dear Customer,
                                </p>

                                <p
                                  className="greeting-text"
                                  style={{
                                    color: "#1e1e1e",
                                    fontSize: "13px",
                                    lineHeight: 1.5,
                                    margin: 0,
                                  }}
                                >
                                  Thank you for registering with us. Use the
                                  OTP below to verify your email address.
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* OTP Boxes */}
                        <div
                          className="otp-wrapper"
                          style={{
                            textAlign: "center",
                            marginBottom: "30px",
                            width: "100%",
                          }}
                        >
                          {digits.map((digit, index) => (
                            <span
                              key={index}
                              className="otp-box"
                              style={{
                                display: "inline-block",
                                width: "56px",
                                height: "64px",
                                backgroundColor: "#FAFAFA",
                                borderRadius: "12px",
                                boxShadow:
                                  "0 4px 16px rgba(0,0,0,0.03)",
                                lineHeight: "64px",
                                textAlign: "center",
                                fontSize: "24px",
                                fontWeight: 600,
                                color: "#111827",
                                margin: "0 4px",
                              }}
                            >
                              {digit}
                            </span>
                          ))}
                        </div>

                        {/* Expiry Notice */}
                        <table
                          border={0}
                          cellPadding={0}
                          cellSpacing={0}
                          width="100%"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="left"
                                className="expiry-wrapper"
                                style={{ paddingBottom: "50px" }}
                              >
                                <p
                                  className="expiry-text"
                                  style={{
                                    color: "#1f2937",
                                    fontSize: "13px",
                                    lineHeight: 1.5,
                                    margin: 0,
                                  }}
                                >
                                  This OTP is valid for{" "}
                                  <strong style={{ color: "#111827" }}>
                                    2 minutes
                                  </strong>
                                  . Please do not share it with anyone. If you
                                  didn't request this, you can safely ignore
                                  this email.
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Footer */}
                        <table
                          border={0}
                          cellPadding={0}
                          cellSpacing={0}
                          width="100%"
                          style={{
                            marginBottom: "18px",
                            opacity: 0.8,
                          }}
                        >
                          <tbody>
                            <tr>
                              <td
                                width="20%"
                                style={{
                                  borderTop: "1px solid #fed7aa",
                                }}
                              ></td>

                              <td
                                width="60%"
                                align="center"
                                className="footer-text"
                                style={{
                                  padding: "0 10px",
                                  color: "#1f2937",
                                  fontWeight: 500,
                                  fontSize: "12px",
                                }}
                              >
                                Welcome aboard - let's get you styled
                              </td>

                              <td
                                width="20%"
                                style={{
                                  borderTop: "1px solid #fed7aa",
                                }}
                              ></td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Copyright */}
                        <p
                          className="copyright"
                          style={{
                            color: "#6b7280",
                            fontSize: "10px",
                            margin: 0,
                          }}
                        >
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

