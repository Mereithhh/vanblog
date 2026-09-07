export const WALINE_ADMIN_PATH: string;
export const WALINE_NOTIFICATION_DOCS_URL: string;
export const WALINE_SERVER_ENV_DOCS_URL: string;

type EmailFieldCopy = Readonly<{
  name: string;
  label: string;
  tooltip: string;
  placeholder: string;
}>;

export const WALINE_EMAIL_FIELDS: Readonly<{
  smtpEnabled: EmailFieldCopy;
  smtpHost: EmailFieldCopy;
  smtpPort: EmailFieldCopy;
  smtpUser: EmailFieldCopy;
  smtpPassword: EmailFieldCopy;
  authorEmail: EmailFieldCopy;
  senderName: EmailFieldCopy;
  senderEmail: EmailFieldCopy;
}>;
