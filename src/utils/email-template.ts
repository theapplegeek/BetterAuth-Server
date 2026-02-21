const escapeHtml = (value: string): string => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

type ActionLink = {
  actionLabel: string;
  messageText: string;
  url: string;
};

const extractActionLink = (message: string): ActionLink | null => {
  const actionRegex =
    /^(?<before>[\s\S]*?)\bclick the link to\s+(?<action>.+?)\s*:\s*(?<url>https?:\/\/\S+)\s*$/i;
  const actionMatch = message.match(actionRegex);

  if (actionMatch?.groups?.url) {
    const before = (actionMatch.groups.before ?? "").trim();
    const rawAction = (actionMatch.groups.action ?? "continue").trim().replace(/\.+$/, "");
    const actionLabel = rawAction.charAt(0).toUpperCase() + rawAction.slice(1);
    const messageText = before || `Please use the button below to ${rawAction}.`;

    return {
      actionLabel,
      messageText,
      url: actionMatch.groups.url,
    };
  }

  const genericUrlMatch = message.match(/https?:\/\/\S+/i);
  if (!genericUrlMatch) return null;

  const url = genericUrlMatch[0];
  const messageText = message
    .replace(url, "")
    .replace(/\s{2,}/g, " ")
    .replace(/[:\s]+$/, "")
    .trim();

  return {
    actionLabel: "Continue",
    messageText: messageText || "Please use the button below to continue.",
    url,
  };
};

export const buildEmailHtml = (subject: string, message: string): string => {
  const safeSubject = escapeHtml(subject);
  const actionLink = extractActionLink(message);
  const messageText = actionLink ? actionLink.messageText : message;
  const safeMessage = escapeHtml(messageText).replaceAll("\n", "<br>");
  const safeActionLabel = actionLink ? escapeHtml(actionLink.actionLabel) : "";
  const safeActionUrl = actionLink ? escapeHtml(actionLink.url) : "";
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
                  BetterAuth Demo
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
                ${actionLink ? `
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0 0 0;">
                  <tr>
                    <td align="center" bgcolor="#0f172a" style="border-radius:10px;">
                      <a href="${safeActionUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;">
                        ${safeActionLabel}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:12px 0 0 0;font-size:12px;line-height:1.6;color:#64748b;">
                  If the button does not work, copy and paste this link into your browser:
                </p>
                <p style="margin:6px 0 0 0;font-size:12px;line-height:1.6;word-break:break-all;">
                  <a href="${safeActionUrl}" target="_blank" rel="noopener noreferrer" style="color:#0f172a;text-decoration:underline;">
                    ${safeActionUrl}
                  </a>
                </p>
                ` : ""}
                <p style="margin:16px 0 0 0;font-size:13px;line-height:1.6;color:#64748b;">
                  If you did not request this email, you can safely ignore it.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;border-top:1px solid #f1f5f9;background:#fcfcfd;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">
                  This message was sent automatically by BetterAuth Demo.
                </p>
                <p style="margin:4px 0 0 0;font-size:12px;line-height:1.6;color:#94a3b8;">
                  &copy; ${year} BetterAuth Demo
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
