// Edge Function: webhook do Mercado Pago (notificação de pagamento)
// Configurar no painel MP: URL desta função
// Requer: MERCADOPAGO_ACCESS_TOKEN (Supabase Secrets)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const DURATION_MONTHS: Record<string, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
  if (!accessToken) {
    console.error("MERCADOPAGO_ACCESS_TOKEN not set");
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  let paymentId: string | null = null;
  try {
    const body = (await req.json()) as { data?: { id?: string }; id?: string };
    paymentId = body?.data?.id ?? body?.id ?? null;
  } catch {
    const url = new URL(req.url);
    paymentId = url.searchParams.get("id");
  }
  if (!paymentId) {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  const paymentRes = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!paymentRes.ok) {
    console.error("MP get payment failed", paymentRes.status);
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  const payment = (await paymentRes.json()) as {
    status?: string;
    external_reference?: string;
  };
  if (payment.status !== "approved") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  const ref = payment.external_reference;
  if (!ref || !ref.includes("|")) {
    console.error("Invalid external_reference", ref);
    return new Response("ok", { status: 200, headers: corsHeaders });
  }
  const [userId, planId] = ref.split("|");
  const months = DURATION_MONTHS[planId] ?? 1;
  const validUntil = new Date();
  validUntil.setMonth(validUntil.getMonth() + months);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, supabaseServiceKey);

  const now = new Date().toISOString();
  const { error } = await admin
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        plan_id: planId,
        mp_payment_id: paymentId,
        status: "active",
        valid_until: validUntil.toISOString(),
        updated_at: now,
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: false,
      }
    );

  if (error) {
    console.error("Subscription upsert error", error);
  }

  return new Response("ok", { status: 200, headers: corsHeaders });
});
