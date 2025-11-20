type BaseEmailContent = {
  subject: string;
  html: string;
  text: string;
};

type LayoutOptions = {
  headline: string;
  intro?: string;
  body: string;
  footerNote?: string;
  previewText?: string;
};

function renderLayout({ headline, intro, body, footerNote, previewText }: LayoutOptions) {
  const preview = previewText ? `<span style="display:none !important;">${previewText}</span>` : "";
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${headline}</title>
  </head>
  <body style="margin:0;padding:24px;background-color:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
    ${preview}
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;">
            <tr>
              <td>
                <p style="font-size:22px;font-weight:600;margin:0 0 16px;">${headline}</p>
                ${intro ? `<p style="font-size:16px;margin:0 0 20px;color:#475569;">${intro}</p>` : ""}
                ${body}
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;" />
                <p style="font-size:12px;color:#94a3b8;margin:0;">
                  ${
                    footerNote ||
                    "You received this email because you have a Textopsy account. If this was unexpected, please ignore it."
                  }
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText(lines: string[]) {
  return lines.filter(Boolean).join("\n\n");
}

export type VerificationEmailProps = {
  verificationUrl: string;
  email: string;
  expiresInHours: number;
};

export function getVerificationEmail({
  verificationUrl,
  email,
  expiresInHours,
}: VerificationEmailProps): BaseEmailContent {
  const subject = "Verify your Textopsy email";
  const body = `
    <p style="margin:0 0 12px;font-size:15px;color:#475569;">
      Please confirm that ${email} belongs to you. This link expires in ${expiresInHours} hour${
        expiresInHours === 1 ? "" : "s"
      }.
    </p>
    <p style="margin:0 0 16px;">
      <a href="${verificationUrl}" style="display:inline-block;padding:12px 24px;background-color:#4f46e5;color:#ffffff;border-radius:8px;font-weight:600;text-decoration:none;">
        Verify email
      </a>
    </p>
    <p style="margin:0;font-size:13px;color:#94a3b8;">Manual link: ${verificationUrl}</p>
  `;

  const html = renderLayout({
    headline: "Verify your email",
    intro: `Hi ${email}, thanks for creating a Textopsy account.`,
    body,
    previewText: "Confirm your email to activate your Textopsy account.",
  });

  const text = renderText([
    `Hi ${email}, thanks for creating a Textopsy account.`,
    `Please confirm that this email belongs to you. This link expires in ${expiresInHours} hour${
      expiresInHours === 1 ? "" : "s"
    }.`,
    `Verify: ${verificationUrl}`,
  ]);

  return { subject, html, text };
}

export type PlanActivatedEmailProps = {
  email: string;
  planName: string;
  amount?: string;
  reference?: string;
  expiresAt?: string | null;
  manageUrl?: string | null;
  isRenewal?: boolean;
};

export function getPlanActivatedEmail(props: PlanActivatedEmailProps): BaseEmailContent {
  const subject = props.isRenewal
    ? "Your plan renewed successfully"
    : `Welcome to ${props.planName}`;

  const details = [
    props.expiresAt ? `Your billing cycle now ends on ${props.expiresAt}.` : null,
    props.amount ? `Amount charged: ${props.amount}.` : null,
    props.reference ? `Reference: ${props.reference}.` : null,
  ]
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 8px;font-size:15px;color:#475569;">${line}</p>`)
    .join("");

  const body = `
    ${details || "<p style='margin:0 0 8px;font-size:15px;color:#475569;'>Your plan is active.</p>"}
    ${
      props.manageUrl
        ? `<p style="margin:12px 0 0;">
            <a href="${props.manageUrl}" style="display:inline-block;padding:12px 24px;background-color:#4f46e5;color:#ffffff;border-radius:8px;font-weight:600;text-decoration:none;">
              Manage billing
            </a>
          </p>`
        : ""
    }
  `;

  const intro = props.isRenewal
    ? `Hi ${props.email}, your ${props.planName} plan renewed successfully.`
    : `Hi ${props.email}, welcome to ${props.planName}.`;

  const html = renderLayout({
    headline: props.isRenewal ? "Plan renewed" : "Plan activated",
    intro,
    body,
    previewText: props.isRenewal
      ? `Your ${props.planName} plan renewed successfully`
      : `You're now on ${props.planName}`,
  });

  const textLines = [
    intro,
    props.expiresAt ? `Cycle ends on ${props.expiresAt}.` : null,
    props.amount ? `Amount charged: ${props.amount}.` : null,
    props.reference ? `Reference: ${props.reference}.` : null,
    props.manageUrl ? `Manage billing: ${props.manageUrl}` : null,
  ];

  return { subject, html, text: renderText(textLines) };
}

export type PlanRenewalReminderEmailProps = {
  email: string;
  planName: string;
  expiresAt: string;
  renewalUrl?: string | null;
};

export function getPlanRenewalReminderEmail(props: PlanRenewalReminderEmailProps): BaseEmailContent {
  const subject = "Your plan renews soon";
  const body = `
    <p style="margin:0 0 12px;font-size:15px;color:#475569;">
      We will attempt to renew automatically on ${props.expiresAt}. Update your billing method or cancel before then if needed.
    </p>
    ${
      props.renewalUrl
        ? `<p style="margin:12px 0 0;">
            <a href="${props.renewalUrl}" style="display:inline-block;padding:12px 24px;background-color:#4f46e5;color:#ffffff;border-radius:8px;font-weight:600;text-decoration:none;">
              Manage renewal
            </a>
          </p>`
        : ""
    }
  `;

  const html = renderLayout({
    headline: "Your plan renews soon",
    intro: `Hi ${props.email}, your ${props.planName} plan renews on ${props.expiresAt}.`,
    body,
    previewText: `Your ${props.planName} plan renews soon`,
  });

  const textLines = [
    `Hi ${props.email}, your ${props.planName} plan renews on ${props.expiresAt}.`,
    "We'll attempt to renew automatically using your saved authorization.",
    props.renewalUrl ? `Manage renewal: ${props.renewalUrl}` : null,
  ];

  return { subject, html, text: renderText(textLines) };
}

export type AutoRenewalNotificationEmailProps = {
  customerEmail: string;
  planName: string;
  amount?: string;
  reference?: string;
  paidAt?: string | null;
};

export function getAutoRenewalNotificationEmail(
  props: AutoRenewalNotificationEmailProps
): BaseEmailContent {
  const subject = `Auto-renewal succeeded for ${props.customerEmail}`;
  const body = `
    <p style="margin:0 0 12px;font-size:15px;color:#475569;">
      ${props.customerEmail} just renewed ${props.planName}.
    </p>
    ${
      props.paidAt
        ? `<p style="margin:0 0 8px;font-size:15px;color:#475569;">Paid at: ${props.paidAt}</p>`
        : ""
    }
    ${props.amount ? `<p style="margin:0 0 8px;font-size:15px;color:#475569;">Amount: ${props.amount}</p>` : ""}
    ${
      props.reference
        ? `<p style="margin:0 0 8px;font-size:15px;color:#475569;">Reference: ${props.reference}</p>`
        : ""
    }
  `;

  const html = renderLayout({
    headline: "Auto-renewal processed",
    intro: `${props.customerEmail} renewed ${props.planName}.`,
    body,
    previewText: `${props.planName} auto-renewal succeeded`,
    footerNote: "Internal alert from Textopsy billing.",
  });

  const textLines = [
    `${props.customerEmail} renewed ${props.planName}.`,
    props.paidAt ? `Paid at: ${props.paidAt}` : null,
    props.amount ? `Amount: ${props.amount}` : null,
    props.reference ? `Reference: ${props.reference}` : null,
  ];

  return { subject, html, text: renderText(textLines) };
}


