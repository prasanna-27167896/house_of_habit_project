import * as React from "react";

export const ReviewReplyEmail = ({
  userName,
  productTitle,
  replyText,
}: {
  userName: string;
  productTitle: string;
  replyText: string;
}) => (
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
          A reply to your review
        </p>
        <p style={{ margin: "16px 0 0", fontSize: "15px", color: "#3f3f46", lineHeight: "1.6" }}>
          Hi <strong>{userName}</strong>,
        </p>
        <p style={{ margin: "10px 0 0", fontSize: "15px", color: "#3f3f46", lineHeight: "1.6" }}>
          Thank you for your review on <strong>{productTitle}</strong>. We've posted a reply:
        </p>

        {/* Reply Block */}
        <div style={{ margin: "24px 0", padding: "20px 24px", backgroundColor: "#f9fafb", borderRadius: "8px", borderLeft: "3px solid #18181b" }}>
          <p style={{ margin: 0, fontSize: "15px", color: "#3f3f46", lineHeight: "1.7", fontStyle: "italic" }}>
            "{replyText}"
          </p>
          <p style={{ margin: "12px 0 0", fontSize: "13px", color: "#71717a", fontStyle: "normal" }}>
            — The HoH Team
          </p>
        </div>

        <p style={{ margin: "0", fontSize: "15px", color: "#3f3f46", lineHeight: "1.6" }}>
          We appreciate your feedback and are always happy to hear from you.
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
