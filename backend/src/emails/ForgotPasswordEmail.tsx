import * as React from "react";

export const ForgotPasswordEmail = ({ otp }: { otp: number }) => (
  <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", backgroundColor: "#f4f4f5", padding: "40px 16px", margin: 0 }}>
    <div style={{ maxWidth: "560px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ backgroundColor: "#18181b", borderRadius: "10px 10px 0 0", padding: "28px 32px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, letterSpacing: "4px", textTransform: "uppercase", color: "#ffffff" }}>
          HoH
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#a1a1aa", letterSpacing: "1px" }}>
          House of Handloom
        </p>
      </div>

      {/* Body */}
      <div style={{ backgroundColor: "#ffffff", padding: "36px 32px 28px" }}>
        <p style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 700, color: "#18181b" }}>
          Reset your password
        </p>
        <p style={{ margin: "16px 0 0", fontSize: "15px", color: "#3f3f46", lineHeight: "1.6" }}>
          We received a request to reset your HoH account password. Use the code below to set a new password. It expires in <strong>10 minutes</strong>.
        </p>

        {/* OTP Block */}
        <div style={{ margin: "28px 0", padding: "24px 20px", borderRadius: "8px", border: "1px solid #e4e4e7", textAlign: "center" }}>
          <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#71717a" }}>
            Password Reset Code
          </p>
          <p style={{ margin: 0, fontSize: "34px", fontWeight: 800, letterSpacing: "12px", color: "#18181b", fontVariantNumeric: "tabular-nums" }}>
            {otp}
          </p>
        </div>

        <div style={{ borderLeft: "3px solid #fde68a", backgroundColor: "#fffbeb", borderRadius: "0 6px 6px 0", padding: "12px 16px" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#92400e", lineHeight: "1.5" }}>
            <strong>Never share this code.</strong> HoH will never ask for your reset code.
          </p>
        </div>

        <p style={{ margin: "20px 0 0", fontSize: "13px", color: "#a1a1aa", lineHeight: "1.5" }}>
          If you did not request a password reset, please ignore this email. Your password will not change.
        </p>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: "#f9fafb", borderTop: "1px solid #e4e4e7", borderRadius: "0 0 10px 10px", padding: "20px 32px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "12px", color: "#71717a" }}>HoH — House of Handloom</p>
        <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#a1a1aa" }}>
          This is an automated message — please do not reply to this email.
        </p>
      </div>

    </div>
  </div>
);
