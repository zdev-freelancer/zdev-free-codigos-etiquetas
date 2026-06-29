/**
 * Default transactional email template. Editable per tenant from
 * /admin/settings. Placeholders: {{tienda}}, {{nombre}}, {{codigo}}.
 */
export const DEFAULT_EMAIL_SUBJECT = "Hemos recibido tu solicitud · {{tienda}}";

export const DEFAULT_EMAIL_BODY = `<p>Hola {{nombre}},</p>
<p>Gracias por contactar a <strong>{{tienda}}</strong>. Recibimos tu solicitud y te responderemos a la brevedad.</p>
<p>Tu código de seguimiento es <strong>{{codigo}}</strong>. Puedes consultar el estado en cualquier momento desde nuestra web.</p>
<p>— El equipo de {{tienda}}</p>`;

export function fillTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => vars[k] ?? "");
}
