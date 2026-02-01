// Edge Function: cria preferência de checkout no Mercado Pago
// Requer: MERCADOPAGO_ACCESS_TOKEN (Supabase Secrets)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const PLANS: Record<
  string,
  { title: string; totalPrice: number; durationMonths: number }
> = {
  monthly: { title: "BiaNutri - 1 mês", totalPrice: 39.9, durationMonths: 1 },
  quarterly: {
    title: "BiaNutri - 3 meses",
    totalPrice: 89.7,
    durationMonths: 3,
  },
  yearly: {
    title: "BiaNutri - 1 ano",
    totalPrice: 214.8,
    durationMonths: 12,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Authorization header required" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token);
  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: "Invalid or expired token" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
  if (!accessToken) {
    return new Response(
      JSON.stringify({
        error: "MERCADOPAGO_ACCESS_TOKEN not configured",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const body = (await req.json()) as {
    user_id: string;
    plan_id: string;
    success_url: string;
    failure_url: string;
  };
  if (body.user_id !== user.id) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const plan = PLANS[body.plan_id];
  if (!plan) {
    return new Response(JSON.stringify({ error: "Invalid plan_id" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const externalReference = `${body.user_id}|${body.plan_id}`;
  const webhookUrl = `${supabaseUrl}/functions/v1/mercadopago-webhook`;

  const preference = {
    items: [
      {
        id: body.plan_id,
        title: plan.title,
        description: `${plan.durationMonths} ${plan.durationMonths === 1 ? "mês" : "meses"} de acesso ao BiaNutri`,
        quantity: 1,
        currency_id: "BRL",
        unit_price: plan.totalPrice,
      },
    ],
    payer: { email: user.email ?? undefined },
    back_urls: {
      success: body.success_url || undefined,
      failure: body.failure_url || undefined,
      pending: body.success_url || undefined,
    },
    auto_return: "approved" as const,
    external_reference: externalReference,
    notification_url: webhookUrl,
  };

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(preference),
  });

  const data = (await res.json()) as {
    init_point?: string;
    sandbox_init_point?: string;
    error?: string;
    message?: string;
  };

  if (!res.ok) {
    return new Response(
      JSON.stringify({
        error: data.message || data.error || "Mercado Pago error",
      }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const initPoint = data.init_point ?? data.sandbox_init_point;
  if (!initPoint) {
    return new Response(
      JSON.stringify({ error: "No checkout URL in response" }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({ init_point: initPoint, url: initPoint }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
