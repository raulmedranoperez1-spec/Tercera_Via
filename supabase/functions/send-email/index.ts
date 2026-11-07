import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  type: "welcome" | "password_changed";
  recipient_email?: string;
}

const RESEND_API = "https://api.resend.com/emails";
const FROM = "La Tercera Vía <no-reply@laterceravia.es>";
const APP_URL = Deno.env.get("APP_URL") ?? "https://laterceravia.es";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function welcomeHtml(name: string): string {
  const greeting = name ? `Hola, ${name}` : "Hola";
  return `<!DOCTYPE html><html><body style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#2a2a2a;background:#f7f1e7;">
  <h1 style="color:#704c12;font-size:22px;">Bienvenido a La Tercera Vía</h1>
  <p style="font-size:16px;line-height:1.6;">${greeting},</p>
  <p style="font-size:16px;line-height:1.6;">Tu cuenta se ha creado correctamente. Ya formas parte de La Tercera Vía, el periodismo universitario independiente.</p>
  <p style="font-size:16px;line-height:1.6;">Desde ahora puedes seguir y guardar publicaciones, dar like, participar en el foro y apoyar el proyecto.</p>
  <p style="margin:28px 0;">
    <a href="${APP_URL}" style="display:inline-block;background:#704c12;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">Ir a la página</a>
  </p>
  <p style="font-size:13px;color:#888;">Si no creaste esta cuenta, puedes ignorar este correo.</p>
</body></html>`;
}

function passwordChangedHtml(name: string): string {
  const greeting = name ? `Hola, ${name}` : "Hola";
  return `<!DOCTYPE html><html><body style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#2a2a2a;background:#f7f1e7;">
  <h1 style="color:#704c12;font-size:22px;">Tu contraseña ha cambiado</h1>
  <p style="font-size:16px;line-height:1.6;">${greeting},</p>
  <p style="font-size:16px;line-height:1.6;">Te confirmamos que la contraseña de tu cuenta en La Tercera Vía se ha actualizado correctamente.</p>
  <p style="font-size:16px;line-height:1.6;">Si no has sido tú quien cambió la contraseña, ponte en contacto con nosotros lo antes posible.</p>
  <p style="margin:28px 0;">
    <a href="${APP_URL}" style="display:inline-block;background:#704c12;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">Ir a la página</a>
  </p>
</body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Método no permitido." }, 405);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return jsonResponse({ error: "El servicio de correo no está configurado." }, 500);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the caller is a signed-in user (JWT from Authorization header)
    const jwt = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !userData.user) {
      return jsonResponse({ error: "No autorizado." }, 401);
    }
    const user = userData.user;
    const recipient = (await req.json().catch(() => null) as EmailRequest | null)?.recipient_email?.trim().toLowerCase() || user.email;
    if (!recipient) {
      return jsonResponse({ error: "Falta el destinatario." }, 400);
    }

    const body = await req.json().catch(() => ({} as EmailRequest));
    const type = (body as EmailRequest).type;

    // Insert pending record
    const { data: notifRow, error: insertErr } = await supabase
      .from("email_notifications")
      .insert({
        user_id: user.id,
        type,
        recipient_email: recipient,
        status: "pending",
      })
      .select("id")
      .single();
    const notifId = notifRow?.id;

    if (insertErr) {
      console.error("email_notifications insert error:", insertErr);
    }

    const name = user.user_metadata?.display_name as string | undefined;
    const subject = type === "welcome" ? "Bienvenido a La Tercera Vía" : "Tu contraseña ha cambiado";
    const html = type === "welcome" ? welcomeHtml(name) : passwordChangedHtml(name);

    const providerRes = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [recipient],
        subject,
        html,
      }),
    });

    if (!providerRes.ok) {
      const errText = await providerRes.text();
      if (notifId) {
        await supabase
          .from("email_notifications")
          .update({ status: "error", error_message: errText.slice(0, 500) })
          .eq("id", notifId);
      }
      return jsonResponse({ error: "No se pudo enviar el correo. Inténtalo más tarde." }, 502);
    }

    const providerData = await providerRes.json().catch(() => ({}));
    const messageId = (providerData as { id?: string }).id;

    if (notifId) {
      await supabase
        .from("email_notifications")
        .update({ status: "sent", provider_message_id: messageId ?? null })
        .eq("id", notifId);
    }

    return jsonResponse({ sent: true, messageId: messageId ?? null });
  } catch (err) {
    console.error("send-email error:", err);
    return jsonResponse({ error: "No se pudo completar el envío." }, 500);
  }
});
