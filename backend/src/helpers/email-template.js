/**
 * Unified email template for Kenya Drylands Investment Hub
 * All emails should use this wrapper for consistent branding.
 *
 * @param {object} options
 * @param {string} options.title - Email heading
 * @param {string} options.body - HTML content for the email body
 * @param {string} [options.footer] - Optional custom footer text
 * @returns {string} Full HTML email string
 */
function emailTemplate({ title, body, footer }) {
  const brandColor = '#B5654A';
  const footerText =
    footer ||
    'This is an automated message from the Kenya Drylands Investment Hub.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;color:#333333;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:30px 40px;text-align:center;background-color:${brandColor};">
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:bold;">${title}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background-color:#fafafa;text-align:center;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:13px;color:#999999;">${footerText}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Helper to render a label-value row
 */
function detailRow(label, value) {
  return `<tr>
    <td style="padding:8px 12px;font-size:14px;color:#999999;white-space:nowrap;vertical-align:top;">${label}</td>
    <td style="padding:8px 12px;font-size:14px;color:#333333;">${value || 'Not provided'}</td>
  </tr>`;
}

/**
 * Helper to render a details table
 */
function detailsTable(rows) {
  return `<table role="presentation" style="width:100%;border-collapse:collapse;background-color:#fafafa;border-radius:8px;margin:16px 0;">
    ${rows}
  </table>`;
}

module.exports = { emailTemplate, detailRow, detailsTable };
