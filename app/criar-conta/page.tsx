"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3;

type Preferences = {
  water: "none" | "still" | "sparkling";
  acTemp: number; // temperatura em ºC
  scent: "none" | "mylane";
  music:
    | "silent"
    | "chill"
    | "jazz"
    | "hits"
    | "classical"
    | "rock"
    | "custom";
  talk: "silent" | "smalltalk" | "free";
  seat: "front" | "rear_right" | "rear_left" | "none";
};

// ler configs da Supabase (vêm do .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export default function CriarContaPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);

  // passo 1
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // passo 2
  const [prefs, setPrefs] = useState<Preferences>({
    water: "still",
    acTemp: 21,
    scent: "mylane",
    music: "chill",
    talk: "smalltalk",
    seat: "rear_right",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const backgrounds: Record<Step, string> = {
    1: "/signup-step1.jpg",
    2: "/signup-step2.jpg",
    3: "/signup-step3.jpg",
  };

  function nextStep() {
    setError("");
    if (step === 1) {
      if (!fullName || !email || !phone || !password || !confirmPassword) {
        setError("Preenche todos os campos antes de continuar");
        return;
      }
      if (password.length < 6) {
        setError("A password deve ter pelo menos 6 caracteres");
        return;
      }
      if (password !== confirmPassword) {
        setError("As passwords não coincidem");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  }

  function prevStep() {
    setError("");
    setSuccessMessage("");
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        setError(
          "Configuração da Supabase em falta. Verifica o ficheiro .env.local"
        );
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // 1) criar utilizador de auth (email + password)
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (signUpError) {
        console.error(signUpError);
        setError(signUpError.message || "Erro ao criar utilizador");
        return;
      }

      const userId = signUpData.user?.id;
      if (!userId) {
        setError("Não foi possível obter o utilizador criado");
        return;
      }

      // 2) gravar dados na tabela mylane_users
      const { error: insertError } = await supabase.from("mylane_users").insert({
        id: userId, // mesmo id da auth para ficar ligado
        full_name: fullName,
        email,
        phone,
        water: prefs.water,
        ac_temp_c: Math.round(prefs.acTemp),
        scent: prefs.scent,
        music: prefs.music,
        talk: prefs.talk,
        seat: prefs.seat,
      });
      if (insertError) {
        console.error(insertError);
        setError("Conta criada mas falhou ao guardar o perfil MyLane");
        return;
      }

      setSuccessMessage("Conta criada com sucesso. Bem-vindo à MyLane");
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error(err);
      setError("Não foi possível criar a conta. Tenta outra vez em instantes");
    } finally {
      setSubmitting(false);
    }
  }

  const stepTitle =
    step === 1
      ? "Criar conta MyLane"
      : step === 2
      ? "Preferências MyLane"
      : "Confirmar detalhes";

  const stepSubtitle =
    step === 1
      ? "Bem-vindo à MyLane! O lado premium do transporte privado"
      : step === 2
      ? "Diga-nos como gosta de viajar e nós tratamos do resto"
      : "Revê os teus dados antes de entrar na MyLane";

  return (
    <main className="relative min-h-screen text-foreground">
      {/* background dinâmico */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgrounds[step]})` }}
      />
      <div className="absolute inset-0 bg-black/80" />

      {/* conteúdo */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
        <div className="card-mylane w-full max-w-xl p-6 md:p-8 backdrop-blur-md animate-fade-in">
          {/* logo + stepper */}
          <div className="flex flex-col items-center mb-6">
            <img
              src="/logo.png"
              alt="MyLane"
              className="h-16 md:h-20 mb-3 drop-shadow-lg"
            />
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-yellow-400">
              <span
                className={
                  step === 1 ? "font-semibold" : "text-yellow-400/60"
                }
              >
                1 Dados
              </span>
              <span className="text-yellow-400/40">•</span>
              <span
                className={
                  step === 2 ? "font-semibold" : "text-yellow-400/60"
                }
              >
                2 Preferências
              </span>
              <span className="text-yellow-400/40">•</span>
              <span
                className={
                  step === 3 ? "font-semibold" : "text-yellow-400/60"
                }
              >
                3 Confirmação
              </span>
            </div>
          </div>

          <h1 className="text-center text-lg md:text-xl font-semibold text-mylane-gold tracking-[0.18em] mb-1 uppercase">
            {stepTitle}
          </h1>
          <p className="text-center text-xs md:text-sm text-gray-300 mb-5">
            {stepSubtitle}
          </p>

          {error && (
            <div className="mb-4 text-xs text-red-400 bg-red-950/40 border border-red-500/40 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            {/* PASSO 1 – DADOS PESSOAIS */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-mylane text-sm"
                    placeholder="O seu nome"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-mylane text-sm"
                    placeholder="o.seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Telemóvel
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-mylane text-sm"
                    placeholder="+351 9xx xxx xxx"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-mylane text-sm"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Confirmar password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-mylane text-sm"
                    placeholder="Repete a password"
                  />
                </div>
              </>
            )}

            {/* PASSO 2 – PREFERÊNCIAS */}
            {step === 2 && (
  <div className="space-y-4">
    {/* LINHA 1: ÁGUA + AC */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Água a bordo */}
      <div>
        <div className="text-xs text-gray-300 mb-1">Água a bordo</div>
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <PrefButton
            label="Nenhuma"
            active={prefs.water === "none"}
            onClick={() => setPrefs((p) => ({ ...p, water: "none" }))}
          />
          <PrefButton
            label="Sem gás"
            active={prefs.water === "still"}
            onClick={() => setPrefs((p) => ({ ...p, water: "still" }))}
          />
          <PrefButton
            label="Com gás"
            active={prefs.water === "sparkling"}
            onClick={() => setPrefs((p) => ({ ...p, water: "sparkling" }))}
          />
        </div>
      </div>

      {/* Temperatura do AC */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-300">Temperatura do AC</span>
          <span className="text-[11px] text-mylane-gold">
            {prefs.acTemp} ºC
          </span>
        </div>
        <input
          type="range"
          min={18}
          max={24}
          step={0.5}
          value={prefs.acTemp}
          onChange={(e) =>
            setPrefs((p) => ({
              ...p,
              acTemp: Number(e.target.value),
            }))
          }
          className="ac-slider"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>18 ºC</span>
          <span>21 ºC</span>
          <span>24 ºC</span>
        </div>
      </div>
    </div>

    {/* LINHA 2: AROMA + CONVERSA  vs  MÚSICA */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Coluna esquerda: aroma + conversa */}
      <div className="space-y-4">
        {/* Ambiente aromático */}
        <div>
          <div className="text-xs text-gray-300 mb-1">Ambiente aromático</div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <PrefButton
              label="Sem cheiro"
              active={prefs.scent === "none"}
              onClick={() => setPrefs((p) => ({ ...p, scent: "none" }))}
            />
            <PrefButton
              label="MyLane Premium"
              active={prefs.scent === "mylane"}
              onClick={() => setPrefs((p) => ({ ...p, scent: "mylane" }))}
            />
          </div>
        </div>

        {/* Estilo de conversa */}
        <div>
          <div className="text-xs text-gray-300 mb-1">Estilo de conversa</div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <PrefButton
              label="Em silêncio"
              active={prefs.talk === "silent"}
              onClick={() => setPrefs((p) => ({ ...p, talk: "silent" }))}
            />
            <PrefButton
              label="Conversa leve"
              active={prefs.talk === "smalltalk"}
              onClick={() => setPrefs((p) => ({ ...p, talk: "smalltalk" }))}
            />
            <PrefButton
              label="Conversa à vontade"
              active={prefs.talk === "free"}
              onClick={() => setPrefs((p) => ({ ...p, talk: "free" }))}
            />
          </div>
        </div>
      </div>

      {/* Coluna direita: música preferida */}
      <div>
        <div className="text-xs text-gray-300 mb-1">Música preferida</div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <PrefButton
            label="Silêncio"
            active={prefs.music === "silent"}
            onClick={() => setPrefs((p) => ({ ...p, music: "silent" }))}
          />
          <PrefButton
            label="Chill / Lo-fi"
            active={prefs.music === "chill"}
            onClick={() => setPrefs((p) => ({ ...p, music: "chill" }))}
          />
          <PrefButton
            label="Jazz"
            active={prefs.music === "jazz"}
            onClick={() => setPrefs((p) => ({ ...p, music: "jazz" }))}
          />
          <PrefButton
            label="Hits / Rádio"
            active={prefs.music === "hits"}
            onClick={() => setPrefs((p) => ({ ...p, music: "hits" }))}
          />
          <PrefButton
            label="Clássica"
            active={prefs.music === "classical"}
            onClick={() => setPrefs((p) => ({ ...p, music: "classical" }))}
          />
          <PrefButton
            label="Rock"
            active={prefs.music === "rock"}
            onClick={() => setPrefs((p) => ({ ...p, music: "rock" }))}
          />
        </div>

        <button
          type="button"
          onClick={() => setPrefs((p) => ({ ...p, music: "custom" }))}
          className={`mt-2 w-full text-[11px] rounded-md px-2 py-1 ${
            prefs.music === "custom"
              ? "border-mylane-gold bg-mylane-gold-soft text-black"
              : "border border-yellow-400/30 text-gray-300 bg-black/40"
          }`}
        >
          Guardar playlist personalizada mais tarde
        </button>
      </div>
    </div>

    {/* LINHA 3: LUGAR HABITUAL */}
    <div>
      <div className="text-xs text-gray-300 mb-1">Lugar habitual</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
        <PrefButton
          label="Sem preferência"
          active={prefs.seat === "none"}
          onClick={() => setPrefs((p) => ({ ...p, seat: "none" }))}
        />
        <PrefButton
          label="Banco da frente"
          active={prefs.seat === "front"}
          onClick={() => setPrefs((p) => ({ ...p, seat: "front" }))}
        />
        <PrefButton
          label="Atrás direita"
          active={prefs.seat === "rear_right"}
          onClick={() => setPrefs((p) => ({ ...p, seat: "rear_right" }))}
        />
        <PrefButton
          label="Atrás esquerda"
          active={prefs.seat === "rear_left"}
          onClick={() => setPrefs((p) => ({ ...p, seat: "rear_left" }))}
        />
      </div>
    </div>

    <p className="text-[11px] text-gray-400 mt-1">
      Podes alterar estas preferências em qualquer altura no teu perfil MyLane.
    </p>
  </div>
)}
            {/* PASSO 3 – CONFIRMAÇÃO */}
            {step === 3 && (
              <div className="space-y-4 text-xs text-gray-200">
                <div className="border border-yellow-400/30 rounded-md p-3 space-y-2 bg-black/40">
                  <h3 className="text-[11px] font-semibold text-mylane-gold">
                    Dados pessoais
                  </h3>
                  <Row label="Nome" value={fullName} />
                  <Row label="Email" value={email} />
                  <Row label="Telemóvel" value={phone} />
                </div>

                <div className="border border-yellow-400/30 rounded-md p-3 space-y-2 bg-black/40">
                  <h3 className="text-[11px] font-semibold text-mylane-gold">
                    Preferências MyLane
                  </h3>
                  <Row
                    label="Água"
                    value={
                      prefs.water === "none"
                        ? "Nenhuma"
                        : prefs.water === "still"
                        ? "Sem gás"
                        : "Com gás"
                    }
                  />
                  <Row label="AC" value={`${prefs.acTemp.toFixed(1)} ºC`} />
                  <Row
                    label="Cheiro"
                    value={
                      prefs.scent === "none"
                        ? "Sem cheiro"
                        : "MyLane Premium"
                    }
                  />
                  <Row
                    label="Música"
                    value={
                      prefs.music === "silent"
                        ? "Silêncio"
                        : prefs.music === "chill"
                        ? "Chill / Lo-fi"
                        : prefs.music === "jazz"
                        ? "Jazz"
                        : prefs.music === "hits"
                        ? "Hits / Rádio"
                        : prefs.music === "classical"
                        ? "Clássica"
                        : prefs.music === "rock"
                        ? "Rock"
                        : "Playlist personalizada"
                    }
                  />
                  <Row
                    label="Conversa"
                    value={
                      prefs.talk === "silent"
                        ? "Prefiro silêncio"
                        : prefs.talk === "smalltalk"
                        ? "Conversa leve"
                        : "Conversa à vontade"
                    }
                  />
                  <Row
                    label="Lugar habitual"
                    value={
                      prefs.seat === "none"
                        ? "Sem preferência"
                        : prefs.seat === "front"
                        ? "Banco da frente"
                        : prefs.seat === "rear_right"
                        ? "Atrás lado direito"
                        : "Atrás lado esquerdo"
                    }
                  />
                </div>

                <p className="text-[11px] text-gray-400">
                  Ao criar conta concordas em receber emails relacionados com as
                  tuas reservas e comunicações de serviço MyLane. Nada de spam
                  chato prometido.
                </p>
              </div>
            )}

            {/* botões de navegação */}
            <div className="flex items-center gap-3 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-mylane-outline flex-1 text-[11px] md:text-xs"
                >
                  Voltar
                </button>
              )}

              {step < 3 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-mylane-primary flex-1 text-[11px] md:text-xs disabled:opacity-60"
                >
                  Continuar
                </button>
              )}

              {step === 3 && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-mylane-primary flex-1 text-[11px] md:text-xs disabled:opacity-60"
                >
                  {submitting ? "A criar conta..." : "Criar conta MyLane"}
                </button>
              )}
            </div>

            <p className="text-center text-[11px] text-gray-400 pt-1">
              Já tem conta{" "}
              <a href="/login" className="text-mylane-gold hover:underline">
                Entrar na MyLane
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* MODAL DE SUCESSO */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="card-mylane w-full max-w-sm p-6 text-sm">
            <h2 className="text-center text-base font-semibold text-mylane-gold mb-2">
              Conta criada com sucesso
            </h2>
            <p className="text-center text-xs text-gray-200 mb-4">
              {successMessage ||
                "A tua conta MyLane está pronta. Faz login para começar a reservar transfers premium."}
            </p>
            <button
              type="button"
              className="btn-mylane-primary w-full text-xs mb-2"
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/login");
              }}
            >
              Ir para login
            </button>
            <button
              type="button"
              className="btn-mylane-outline w-full text-[11px]"
              onClick={() => setShowSuccessModal(false)}
            >
              Ficar aqui por agora
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/* Componentes pequenos */

function PrefButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip-mylane w-full flex items-center justify-center text-[11px] ${
        active ? "chip-mylane--active" : ""
      }`}
    >
      {label}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-100 text-right">{value}</span>
    </div>
  );
}