// Supabase Edge Function para chamar a API Gemini
// Esta função recebe a imagem, faz a chamada para a Gemini API e retorna o resultado

// @deno-types="./types.d.ts"
// @ts-ignore - Deno import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface RequestBody {
  base64Image: string;
  mimeType?: string;
  lang?: "en" | "pt";
  userDescription?: string;
}

interface GeminiResponse {
  foods: Array<{
    foodName: string;
    foodNameEn: string;
    foodNamePt: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    description: string;
    descriptionEn: string;
    descriptionPt: string;
  }>;
  mealDescription: string;
  mealDescriptionEn: string;
  mealDescriptionPt: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verificar se é POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ============================================
    // 1. LER E VALIDAR A API KEY
    // ============================================
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY não encontrada nas variáveis de ambiente");
      return new Response(
        JSON.stringify({ 
          error: "GEMINI_API_KEY não configurada. Configure no Supabase Dashboard > Edge Functions > Secrets" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Limpar a chave (remover espaços e quebras de linha)
    const cleanApiKey = apiKey.trim();
    
    if (!cleanApiKey || cleanApiKey.length < 20) {
      console.error("❌ GEMINI_API_KEY parece inválida. Tamanho:", cleanApiKey.length);
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY inválida ou muito curta" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log para debug (sem mostrar a chave completa por segurança)
    console.log("✅ GEMINI_API_KEY encontrada. Tamanho:", cleanApiKey.length);

    // ============================================
    // 2. PARSE DO BODY DA REQUISIÇÃO
    // ============================================
    const body: RequestBody = await req.json();
    const { base64Image, mimeType = "image/jpeg", lang = "pt", userDescription } = body;

    if (!base64Image) {
      return new Response(
        JSON.stringify({ error: "base64Image é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ============================================
    // 3. CONSTRUIR O PROMPT
    // ============================================
    let promptText = `Analyze this food image with EXTREME attention to detail. Your task is to identify EVERY SINGLE food item visible in the plate/meal.

CRITICAL INSTRUCTIONS:
1. Identify ALL individual food items separately (e.g., if there's rice, beans, chicken, salad, and bread, list each one)
2. For each food item, estimate the portion size visible in the image
3. Calculate nutritional values for each item based on the visible portion
4. Be precise and thorough - don't miss any food components
5. If you see multiple items of the same type (e.g., 2 pieces of bread), count them
6. Include side dishes, garnishes, sauces, and condiments as separate items
7. Estimate quantities realistically based on what's visible

For each food item, provide:
- Exact food name in both English and Portuguese
- Detailed description of the item and its preparation
- Accurate nutritional values (calories, protein, carbs, fat, fiber, sugar) for the visible portion

You MUST return ONLY a valid JSON object (no markdown, no code blocks, just pure JSON) with this exact structure:
{
  "foods": [
    {
      "foodName": "string",
      "foodNameEn": "string",
      "foodNamePt": "string",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number,
      "sugar": number,
      "description": "string",
      "descriptionEn": "string",
      "descriptionPt": "string"
    }
  ],
  "mealDescription": "string",
  "mealDescriptionEn": "string",
  "mealDescriptionPt": "string"
}

Return ONLY the JSON object, nothing else.`;

    // Adicionar contexto do usuário se fornecido
    if (userDescription?.trim()) {
      promptText += `\n\nUser provided context: "${userDescription}"\nUse this information to help identify foods, but still identify ALL items visible in the image.`;
    }

    // ============================================
    // 4. PREPARAR A CHAMADA PARA A API GEMINI
    // ============================================
    // Modelo principal: gemini-2.5-flash (com quota ativa)
    // Modelo fallback: gemini-2.5-flash-lite (usado em caso de erro 429)
    // Modelos descontinuados: gemini-2.0, gemini-1.5, gemini-1.0
    const primaryModel = "gemini-2.5-flash";
    const fallbackModel = "gemini-2.5-flash-lite";
    
    let currentModel = primaryModel;
    let geminiUrl = `https://generativelanguage.googleapis.com/v1/models/${currentModel}:generateContent?key=${cleanApiKey}`;
    
    console.log(`🔵 Chamando API Gemini com modelo ${currentModel}...`);

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image,
              },
            },
            { text: promptText },
          ],
        },
      ],
    };

    // ============================================
    // 5. FAZER A CHAMADA PARA A API GEMINI
    // ============================================
    let geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // ============================================
    // 6. TRATAR A RESPOSTA DA API
    // ============================================
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      console.error("❌ Erro na API Gemini. Status:", geminiResponse.status);
      console.error("❌ Erro detalhado:", JSON.stringify(errorData, null, 2));
      
      // Erro de quota excedida (429) - Tentar modelo fallback
      if (geminiResponse.status === 429 && currentModel === primaryModel) {
        console.error("⚠️ Erro 429: Quota excedida no modelo principal. Tentando modelo fallback...");
        
        // Tentar com modelo fallback
        currentModel = fallbackModel;
        geminiUrl = `https://generativelanguage.googleapis.com/v1/models/${currentModel}:generateContent?key=${cleanApiKey}`;
        
        console.log(`🔄 Tentando novamente com modelo fallback: ${currentModel}...`);
        
        // Fazer nova chamada com modelo fallback
        geminiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
        
        // Se ainda der erro após tentar fallback, retornar erro
        if (!geminiResponse.ok) {
          const fallbackErrorText = await geminiResponse.text();
          let fallbackErrorData;
          
          try {
            fallbackErrorData = JSON.parse(fallbackErrorText);
          } catch {
            fallbackErrorData = { message: fallbackErrorText };
          }
          
          console.error("❌ Erro também no modelo fallback. Status:", geminiResponse.status);
          
          // Tentar extrair informações de retry do erro
          let retryAfter = null;
          let quotaDetails = null;
          
          if (fallbackErrorData?.error?.details) {
            const retryInfo = fallbackErrorData.error.details.find(
              (d: any) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
            );
            if (retryInfo?.retryDelay) {
              retryAfter = Math.ceil(parseFloat(retryInfo.retryDelay.replace("s", "")));
            }
            
            const quotaFailure = fallbackErrorData.error.details.find(
              (d: any) => d["@type"] === "type.googleapis.com/google.rpc.QuotaFailure"
            );
            if (quotaFailure) {
              quotaDetails = quotaFailure.violations;
            }
          }
          
          let errorMessage = "Quota da API do Gemini excedida em ambos os modelos.";
          if (retryAfter) {
            errorMessage += ` Aguarde ${retryAfter} segundos antes de tentar novamente.`;
          } else {
            errorMessage += " Aguarde alguns minutos e tente novamente.";
          }
          
          if (fallbackErrorData?.error?.message?.includes("free_tier")) {
            errorMessage += " (Free tier limitado - considere verificar seu plano no Google AI Studio)";
          }
          
          return new Response(
            JSON.stringify({
              error: errorMessage,
              code: 429,
              isQuotaError: true,
              retryAfter: retryAfter,
              quotaDetails: quotaDetails,
              helpUrl: "https://ai.google.dev/gemini-api/docs/rate-limits",
            }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } else {
          console.log(`✅ Modelo fallback ${currentModel} funcionou!`);
        }
      } else if (geminiResponse.status === 429) {
        // Já tentou fallback e ainda deu erro 429
        console.error("⚠️ Erro 429: Quota excedida também no modelo fallback");
        
        let retryAfter = null;
        let quotaDetails = null;
        
        if (errorData?.error?.details) {
          const retryInfo = errorData.error.details.find(
            (d: any) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
          );
          if (retryInfo?.retryDelay) {
            retryAfter = Math.ceil(parseFloat(retryInfo.retryDelay.replace("s", "")));
          }
          
          const quotaFailure = errorData.error.details.find(
            (d: any) => d["@type"] === "type.googleapis.com/google.rpc.QuotaFailure"
          );
          if (quotaFailure) {
            quotaDetails = quotaFailure.violations;
          }
        }
        
        let errorMessage = "Quota da API do Gemini excedida em ambos os modelos.";
        if (retryAfter) {
          errorMessage += ` Aguarde ${retryAfter} segundos antes de tentar novamente.`;
        } else {
          errorMessage += " Aguarde alguns minutos e tente novamente.";
        }
        
        if (errorData?.error?.message?.includes("free_tier")) {
          errorMessage += " (Free tier limitado - considere verificar seu plano no Google AI Studio)";
        }
        
        return new Response(
          JSON.stringify({
            error: errorMessage,
            code: 429,
            isQuotaError: true,
            retryAfter: retryAfter,
            quotaDetails: quotaDetails,
            helpUrl: "https://ai.google.dev/gemini-api/docs/rate-limits",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Erro de API key inválida (401/403)
      if (geminiResponse.status === 401 || geminiResponse.status === 403) {
        console.error("⚠️ Erro 401/403: API Key inválida ou sem permissão");
        return new Response(
          JSON.stringify({
            error: "API Key do Gemini inválida ou sem permissão. Verifique se a chave está correta no Supabase Secrets e faça redeploy da função.",
            code: geminiResponse.status,
            isApiKeyError: true,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Outros erros
      return new Response(
        JSON.stringify({
          error: `Erro na API Gemini: ${errorData.error?.message || errorData.message || errorText}`,
          status: geminiResponse.status,
        }),
        {
          status: geminiResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ============================================
    // 7. PROCESSAR A RESPOSTA DA GEMINI
    // ============================================
    const geminiData = await geminiResponse.json();
    let responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.error("❌ Gemini não retornou resposta válida");
      return new Response(
        JSON.stringify({ error: "Gemini não retornou resposta válida" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Limpar o texto - remover markdown code blocks se houver
    responseText = responseText.trim();
    if (responseText.startsWith("```json")) {
      responseText = responseText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // Parse do JSON retornado pela Gemini
    let parsed: GeminiResponse;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse do JSON:", parseError);
      console.error("❌ Texto recebido (primeiros 500 chars):", responseText.substring(0, 500));
      return new Response(
        JSON.stringify({
          error: "Erro ao processar resposta da Gemini. A resposta não é um JSON válido.",
          rawResponse: responseText.substring(0, 500),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Garantir que a Gemini retornou array 'foods'
    if (!parsed.foods || !Array.isArray(parsed.foods)) {
      console.error("❌ Resposta da Gemini sem array 'foods'. Estrutura:", Object.keys(parsed || {}));
      return new Response(
        JSON.stringify({
          error: "A análise não retornou lista de alimentos. Tente outra foto ou tente novamente.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ============================================
    // 8. CALCULAR TOTAIS NUTRICIONAIS
    // ============================================
    const totals = parsed.foods.reduce(
      (acc, food) => ({
        calories: acc.calories + (food.calories || 0),
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbs || 0),
        fat: acc.fat + (food.fat || 0),
        fiber: acc.fiber + (food.fiber || 0),
        sugar: acc.sugar + (food.sugar || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
    );

    // ============================================
    // 9. RETORNAR RESPOSTA FORMATADA
    // ============================================
    const response = {
      foods: parsed.foods,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      totalFiber: totals.fiber,
      totalSugar: totals.sugar,
      mealDescription: parsed.mealDescription,
      mealDescriptionEn: parsed.mealDescriptionEn,
      mealDescriptionPt: parsed.mealDescriptionPt,
    };

    console.log(`✅ Análise concluída com sucesso usando modelo ${currentModel}. Alimentos identificados:`, parsed.foods.length);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("❌ Erro na Edge Function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Erro interno do servidor",
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
