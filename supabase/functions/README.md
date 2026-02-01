# Supabase Edge Functions

Este diretório contém as Edge Functions do Supabase.

## Função: gemini

Esta função faz a ponte entre o frontend e a API do Gemini, mantendo a API key segura no backend.

### Configuração

1. **Variáveis de Ambiente no Supabase:**
   - Acesse o dashboard do Supabase
   - Vá em "Edge Functions" > "Settings"
   - Adicione a variável de ambiente: `GEMINI_API_KEY` com o valor da sua chave da API Gemini

2. **Deploy da Function:**
   ```bash
   supabase functions deploy gemini
   ```

### Uso

A função recebe um POST com o seguinte body:
```json
{
  "base64Image": "string (base64 da imagem)",
  "mimeType": "image/jpeg" (opcional, padrão: "image/jpeg"),
  "lang": "pt" | "en" (opcional, padrão: "pt"),
  "userDescription": "string" (opcional)
}
```

E retorna:
```json
{
  "foods": [...],
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "totalFiber": number,
  "totalSugar": number,
  "mealDescription": string,
  "mealDescriptionEn": string,
  "mealDescriptionPt": string
}
```
