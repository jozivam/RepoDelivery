import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1)
});

const serverSchema = clientSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1)
});

function formatIssues(issues: z.ZodIssue[]) {
  return issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
}

export function getPublicEnv() {
  const sharedInput = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  };

  const clientResult = clientSchema.safeParse(sharedInput);
  if (!clientResult.success) {
    throw new Error(`Variáveis públicas inválidas: ${formatIssues(clientResult.error.issues)}`);
  }

  return clientResult.data;
}

export function getServerEnv() {
  const serverResult = serverSchema.safeParse({
    ...getPublicEnv(),
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  if (!serverResult.success) {
    throw new Error(`Variáveis de ambiente inválidas: ${formatIssues(serverResult.error.issues)}`);
  }

  return serverResult.data;
}
