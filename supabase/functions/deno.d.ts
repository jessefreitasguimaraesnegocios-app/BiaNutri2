// Deno global types for Supabase Edge Functions

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  version: {
    deno: string;
  };
};

