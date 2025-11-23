"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// SUPABASE CONFIG
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset password pop-up
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  // AUTO-REDIRECT SE ESTIVER LOGADO
  useEffect(() => {
    if (!supabase) return;

    const check = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "mylane_user",
            JSON.stringify({
              id: data.session.user.id,
              email: data.session.user.email,
            })
          );
        }
        router.push("/reservar");
      }
    };

    check();
  }, [router]);

  // ---------- LOGIN ----------
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!supabase) {
      setError("Configuração da Supabase em falta.");
      return;
    }

    if (!email || !password) {
      setError("Introduz email e password.");
      return;
    }

    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError("Email ou password incorretos.");
      setLoading(false);
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "mylane_user",
        JSON.stringify({
          id: data.user.id,
          email: data.user.email,
        })
      );
    }

    setSuccess("Login efetuado com sucesso.");
    router.push("/reservar");
  }

  // ---------- RESET PASSWORD ----------
  async function handleResetPassword() {
    setResetMsg("");

    if (!supabase) {
      setResetMsg("Configuração da Supabase em falta.");
      return;
    }

    if (!resetEmail) {
      setResetMsg("Introduz o teu email.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: "http://localhost:3000/reset-password",
    });

    if (error) {
      setResetMsg("Erro ao enviar email. Verifica o endereço.");
      return;
    }

    setResetMsg("Email enviado  verifica a tua caixa de entrada.");
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative">
      {/* ---------------- POPUP: RESET PASSWORD ---------------- */}
      {resetOpen && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center px-4 z-20">
          <div className="card-mylane w-full max-w-sm p-6 space-y-4">
            <h2 className="text-center text-mylane-gold text-sm font-semibold tracking-wide">
              RECUPERAR PASSWORD
            </h2>

            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="input-mylane input-gold text-sm"
              placeholder="O teu email"
            />

            {resetMsg && (
              <div
                className={`text-xs px-3 py-2 rounded-md ${
                  resetMsg.includes("Email enviado")
                    ? "text-emerald-300 bg-emerald-900/40 border border-emerald-500/40"
                    : "text-red-300 bg-red-900/40 border border-red-500/40"
                }`}
              >
                {resetMsg}
              </div>
            )}

            <button
              onClick={handleResetPassword}
              className="btn-mylane-primary w-full text-sm"
            >
              Enviar email
            </button>

            <button
              onClick={() => setResetOpen(false)}
              className="w-full py-2 text-xs text-gray-300 hover:text-mylane-gold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ---------------- LOGIN FORM ---------------- */}
      <div className="w-full max-w-md text-center space-y-8 z-10">
        {/* LOGO + TÍTULO */}
        <div className="space-y-3">
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="MyLane"
              className="h-56 w-auto drop-shadow-[0_0_45px_rgba(243,201,105,0.65)]"
            />
          </div>

          <h1 className="text-lg tracking-[0.25em] text-mylane-gold font-semibold">
            ENTRAR NA MYLANE
          </h1>
          <p className="text-xs text-gray-300">Aceda às suas reservas.</p>
        </div>

        {/* FORMULÁRIO */}
        <form
          onSubmit={handleLogin}
          className="card-mylane p-6 text-left space-y-4"
        >
          {/* EMAIL */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-mylane input-gold text-sm"
              placeholder="o.seu@email.com"
            />
          </div>

          {/* PASSWORD */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-mylane input-gold text-sm"
              placeholder="A tua password"
            />
          </div>

          {/* MENSAGENS */}
          {error && (
            <div className="text-xs text-red-400 bg-red-950/40 border border-red-500/40 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {success && (
            <div className="text-xs text-emerald-300 bg-emerald-900/40 border border-emerald-500/40 rounded-md px-3 py-2">
              {success}
            </div>
          )}

          {/* BOTÃO LOGIN */}
          <button
            type="submit"
            disabled={loading}
            className="btn-mylane-primary w-full mt-1 text-sm disabled:opacity-60"
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>

          {/* RESET PASSWORD */}
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="w-full text-[11px] text-mylane-gold hover:underline mt-1 text-center"
          >
            Esqueci-me da password
          </button>
        </form>

        {/* CRIAR CONTA */}
        <p className="text-xs text-gray-400">
          Não tens conta?{" "}
          <a href="/criar-conta" className="text-mylane-gold hover:underline">
            Criar conta
          </a>
        </p>
      </div>
    </main>
  );
}