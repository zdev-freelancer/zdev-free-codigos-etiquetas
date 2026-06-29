import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getCurrentTenant } from "@/lib/tenant";
import { createClient } from "@/lib/supabase/server";
import { saveSettings } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { SecretInput } from "@/components/ui/secret-input";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { DEFAULT_EMAIL_BODY, DEFAULT_EMAIL_SUBJECT } from "@/config/email";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Configuración",
  robots: { index: false },
};

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors duration-300 ease-in-out focus:border-accent";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-label text-muted">
        {label}
      </span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Group({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-border bg-background p-6">
      <legend className="px-2 text-sm font-semibold text-foreground">
        {title}
      </legend>
      {hint && <p className="mt-1 px-2 text-xs text-muted">{hint}</p>}
      <div className="mt-4 flex flex-col gap-5">{children}</div>
    </fieldset>
  );
}

const SOCIAL = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "x", label: "X (Twitter)" },
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
];

export default async function SettingsPage() {
  const { tenantId } = await requireAdmin();
  const tenant = await getCurrentTenant();
  const supabase = await createClient();
  const { data: secrets } = await supabase
    .from("tenant_payment_config")
    .select(
      "mp_access_token, mp_public_key, mp_webhook_secret, brevo_api_key, brevo_sender_email, brevo_sender_name, email_subject, email_body",
    )
    .eq("tenant_id", tenantId)
    .maybeSingle();

  const social = (tenant.social ?? {}) as Record<string, string>;

  return (
    <AdminShell>
      <form action={saveSettings} className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Configuración
          </h1>
          <p className="mt-1 text-sm text-muted">
            Credenciales e integraciones. Se guardan en tu cuenta y la app las
            usa al instante — sin necesidad de volver a desplegar.
          </p>
        </div>

        <Group
          title="Mercado Pago"
          hint="Tus integraciones → Credenciales de producción. El webhook secret habilita la confirmación de pagos."
        >
          <Field label="Access token">
            <SecretInput
              name="mp_access_token"
              defaultValue={secrets?.mp_access_token ?? ""}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Public key">
              <SecretInput
                name="mp_public_key"
                defaultValue={secrets?.mp_public_key ?? ""}
              />
            </Field>
            <Field label="Webhook secret">
              <SecretInput
                name="mp_webhook_secret"
                defaultValue={secrets?.mp_webhook_secret ?? ""}
              />
            </Field>
          </div>
        </Group>

        <Group
          title="Brevo (correo)"
          hint="API key de Brevo para enviar correos transaccionales."
        >
          <Field label="API key">
            <SecretInput
              name="brevo_api_key"
              defaultValue={secrets?.brevo_api_key ?? ""}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Remitente — email">
              <input
                name="brevo_sender_email"
                defaultValue={secrets?.brevo_sender_email ?? ""}
                placeholder="no-reply@tudominio.com"
                className={inputClass}
              />
            </Field>
            <Field label="Remitente — nombre">
              <input
                name="brevo_sender_name"
                defaultValue={secrets?.brevo_sender_name ?? ""}
                placeholder={tenant.name}
                className={inputClass}
              />
            </Field>
          </div>
        </Group>

        <Group
          title="Plantilla de correo"
          hint="Variables disponibles: {{tienda}}, {{nombre}}, {{codigo}}."
        >
          <Field label="Asunto">
            <input
              name="email_subject"
              defaultValue={secrets?.email_subject || DEFAULT_EMAIL_SUBJECT}
              className={inputClass}
            />
          </Field>
          <Field label="Cuerpo (HTML)">
            <textarea
              name="email_body"
              rows={7}
              defaultValue={secrets?.email_body || DEFAULT_EMAIL_BODY}
              className={cn(inputClass, "resize-y font-mono text-xs")}
            />
          </Field>
        </Group>

        <Group title="Analítica">
          <Field
            label="Google Analytics (Measurement ID)"
            hint="Ej. G-XXXXXXXXXX. Se inyecta automáticamente en la web."
          >
            <input
              name="ga_id"
              defaultValue={tenant.ga_id ?? ""}
              placeholder="G-XXXXXXXXXX"
              className={inputClass}
            />
          </Field>
        </Group>

        <Group title="Contacto">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="WhatsApp"
              hint="Solo números, con código de país. Activa la burbuja flotante."
            >
              <input
                name="whatsapp"
                defaultValue={tenant.whatsapp ?? ""}
                placeholder="51999000111"
                className={inputClass}
              />
            </Field>
            <Field label="Teléfono">
              <input
                name="contact_phone"
                defaultValue={tenant.contact_phone ?? ""}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Email de contacto">
            <input
              name="contact_email"
              defaultValue={tenant.contact_email ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Dirección">
            <input
              name="address"
              defaultValue={tenant.address ?? ""}
              className={inputClass}
            />
          </Field>
        </Group>

        <Group title="Redes sociales" hint="Pega la URL completa de cada perfil.">
          <div className="grid gap-5 sm:grid-cols-2">
            {SOCIAL.map((s) => (
              <Field key={s.key} label={s.label}>
                <input
                  name={`social_${s.key}`}
                  defaultValue={social[s.key] ?? ""}
                  placeholder="https://…"
                  className={inputClass}
                />
              </Field>
            ))}
          </div>
        </Group>

        <div>
          <ConfirmSubmit
            message="¿Guardar la configuración? Los cambios se aplican de inmediato."
            confirmLabel="Guardar"
          >
            Guardar configuración
          </ConfirmSubmit>
        </div>
      </form>
    </AdminShell>
  );
}
