const escapeHtml = (value: string): string => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

export const buildEmailHtml = (subject: string, message: string): string => {
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br>");
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeSubject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${safeSubject}
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f3f4f6;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 8px 28px rgba(17,24,39,0.08);">
            <tr>
              <td style="padding:24px 28px;border-bottom:1px solid #f1f5f9;">
                <p style="margin:0 0 10px 0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;color:#64748b;">
                  BetterAuth Server
                </p>
                <h1 style="margin:0;font-size:22px;line-height:1.3;font-weight:700;color:#0f172a;">${safeSubject}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;">
                <p style="margin:0 0 14px 0;font-size:14px;line-height:1.6;color:#334155;">Hello,</p>
                <div style="margin:0;padding:16px 18px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;font-size:14px;line-height:1.7;color:#1e293b;">
                  ${safeMessage}
                </div>
                <p style="margin:16px 0 0 0;font-size:13px;line-height:1.6;color:#64748b;">
                  If you did not request this email, you can safely ignore it.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;border-top:1px solid #f1f5f9;background:#fcfcfd;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">
                  This message was sent automatically by BetterAuth Server.
                </p>
                <p style="margin:4px 0 0 0;font-size:12px;line-height:1.6;color:#94a3b8;">
                  &copy; ${year} BetterAuth Server
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
