"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Form, Input, Label, TextField } from "@heroui/react";
import { ArrowRight, LockKeyhole, Server } from "lucide-react";

const mono = { fontFamily: "'JetBrains Mono', 'Fira Code', monospace" } as const;

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setError("Usuário ou senha inválidos.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Falha ao conectar com o servidor de autenticação.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app px-5 text-body">
      <div className="decorative-orb" style={{ width: 420, height: 420, top: -160, right: -120, opacity: 0.24 }} />
      <div className="decorative-orb" style={{ width: 320, height: 320, bottom: -120, left: -100, opacity: 0.16 }} />

      <Card className="relative z-10 w-full max-w-[420px] p-5">
        <Card.Header className="flex flex-col items-start gap-4 p-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[rgba(255,107,44,0.08)] text-[#D4835A] glow-orange">
            <Server size={20} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-subtle" style={mono}>OpenClaw</p>
            <h1 className="mt-2 text-2xl font-semibold text-heading" style={mono}>Dashboard login</h1>
            <p className="mt-2 text-sm leading-relaxed text-subtle">
              Entre com as credenciais configuradas no `.env` do servidor para acessar o painel operacional.
            </p>
          </div>
        </Card.Header>

        <Card.Content className="mt-6 p-0">
          <Form className="space-y-4" onSubmit={handleSubmit}>
            <TextField isRequired name="username" className="flex flex-col gap-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-subtle" style={mono}>Usuário</Label>
              <div className="relative">
                <LockKeyhole size={16} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-subtle" />
                <Input
                  aria-label="Usuário"
                  autoComplete="username"
                  className="w-full border-[#222] pl-10 hover:border-[#ff6b2c] focus-visible:!border-[#ff6b2c]"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
            </TextField>
            <TextField isRequired name="password" type="password" className="flex flex-col gap-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-subtle" style={mono}>Senha</Label>
              <Input
                aria-label="Senha"
                autoComplete="current-password"
                className="w-full border-[#222] hover:border-[#ff6b2c] focus-visible:!border-[#ff6b2c]"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </TextField>

            {error && (
              <div className="rounded-[12px] border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="btn-neu h-11 w-full justify-center"
              isDisabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
              {!isLoading && <ArrowRight size={15} />}
            </Button>
          </Form>
        </Card.Content>
      </Card>
    </main>
  );
}
