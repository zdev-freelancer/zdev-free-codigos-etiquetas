import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_EMAIL_BODY,
  DEFAULT_EMAIL_SUBJECT,
  fillTemplate,
} from "@/config/email";

/**
 * Sends a transactional email via Brevo using the tenant's stored credentials
 * and template. Fire-and-forget: never throws (email is best-effort). No-op if
 * Brevo isn't configured for the tenant.
 */
export async function sendTenantEmail(
  tenantId: string,
  to: string,
  vars: Record<string, string>,
): Promise<void> {
  if (!to || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  try {
    const admin = createAdminClient();
    const { data: cfg } = await admin
      .from("tenant_payment_config")
      .select(
        "brevo_api_key, brevo_sender_email, brevo_sender_name, email_subject, email_body",
      )
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (!cfg?.brevo_api_key || !cfg.brevo_sender_email) return;

    const subject = fillTemplate(cfg.email_subject || DEFAULT_EMAIL_SUBJECT, vars);
    const htmlContent = fillTemplate(cfg.email_body || DEFAULT_EMAIL_BODY, vars);

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": cfg.brevo_api_key,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: cfg.brevo_sender_email,
          name: cfg.brevo_sender_name || vars.tienda || "",
        },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    });
  } catch (e) {
    console.error("[brevo] send failed", e);
  }
}
