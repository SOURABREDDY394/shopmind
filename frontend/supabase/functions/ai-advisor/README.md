# AI Advisor Edge Function

Deploy this function from the `frontend` folder:

```sh
supabase functions deploy ai-advisor --no-verify-jwt
```

Set the OpenRouter secret in Supabase. Do not add it to any React/Vite `.env` file.

```sh
supabase secrets set OPENROUTER_API_KEY=your-openrouter-key
```

Optionally choose a model:

```sh
supabase secrets set OPENROUTER_MODEL=openai/gpt-4o-mini
```

The function fetches `products`, `customers`, `orders`, and `order_items` from Supabase, summarizes the business data, then sends only that summary plus the user's question to OpenRouter.
