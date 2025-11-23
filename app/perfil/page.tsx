"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

type Preferences = {
  water: "none" | "still" | "sparkling";
  acTemp: number;
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

export default function PerfilPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [prefs, setPrefs] = useState<Preferences>({
    water: "still",
    acTemp: 21,
    scent: "mylane",
    music: "chill",
    talk: "smalltalk",
    seat: "rear_right",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // carregar perfil
  useEffect(() => {
    if (!supabase) return;

    const loadProfile = async () => {
      setLoading(true);
      setError("");
      setSuccess("");

      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData.session?.user;

      if (!sessionUser) {
        router.push("/login");
        return;
      }

      setUserId(sessionUser.id);

      const { data: profile, error } = await supabase
        .from("mylane_users")
        .select(
          "full_name, email, phone, water, ac_temp_c, scent, music, talk, seat"
        )
        .eq("id", sessionUser.id)
        .single();

      if (error) {
        console.error(error);
        setError("Não foi possível carregar o teu perfil");
        setLoading(false);
        return;
      }

      setFullName(profile?.full_name ?? "");
      setEmail(profile?.email ?? sessionUser.email ?? "");
      setPhone(profile?.phone ?? "");

      setPrefs({
        water: profile?.water ?? "still",
        acTemp: profile?.ac_temp_c ?? 21,
        scent: profile?.scent ?? "mylane",
        music: profile?.music ?? "chill",
        talk: profile?.talk ?? "smalltalk",
        seat: profile?.seat ?? "rear_right",
      });

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !userId) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updates = {
        full_name: fullName || null,
        email: email || null,
        phone: phone || null,
        water: prefs.water,
        ac_temp_c: Math.round(prefs.acTemp),
        scent: prefs.scent,
        music: prefs.music,
        talk: prefs.talk,
        seat: prefs.seat,
      };

      const { error } = await supabase
        .from("mylane_users")
        .update(updates)
        .eq("id", userId);

      if (error) {
        console.error(error);
        setError("Não foi possível guardar as alterações");
        setSaving(false);
        return;
      }

      // actualizar user no localStorage (para o menu do topo mostrar o nome novo)
      if (typeof window !== "undefined") {
        const simpleUser = {
          id: userId,
          email,
          full_name: fullName,
        };
        localStorage.setItem("mylane_user", JSON.stringify(simpleUser));
      }

      setSuccess("Perfil atualizado com sucesso");
    } catch (err) {
      console.error(err);
      setError("Erro inesperado ao guardar o perfil");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-sm text-gray-300">
        A carregar o teu perfil...
      </main>
    );
  }

  return (
    <main className="relative min-h-screen text-foreground">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/signup-step2.jpg)" }}
      />
      <div className="absolute inset-0 bg-black/80" />

      <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
        <div className="card-mylane w-full max-w-xl p-6 md:p-8 animate-fade-in">
          <h1 className="text-center text-lg md:text-xl font-semibold text-mylane-gold tracking-[0.18em] mb-1 uppercase">
            O MEU PERFIL
          </h1>
          <p className="text-center text-xs md:text-sm text-gray-300 mb-6">
            Revê e ajusta o teu perfil MyLane para manter cada viagem no ponto
          </p>

          {error && (
            <div className="mb-3 text-xs text-red-400 bg-red-950/40 border border-red-500/40 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 rounded-md px-3 py-2">
              {success}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5 text-sm">
            {/* DADOS PESSOAIS */}
            <section className="space-y-3 md:space-y-4">
              <h2 className="text-[11px] font-semibold text-mylane-gold uppercase tracking-[0.14em]">
                Dados pessoais
              </h2>

              <div>
                <label className="block text-xs text-gray-300 mb-1">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-mylane text-sm"
                  placeholder="O teu nome"
                  style={{ textTransform: "capitalize" }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Email (login)
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="input-mylane text-sm opacity-70 cursor-not-allowed"
                  />
                  <span className="block mt-1 text-[10px] text-gray-500">
                    Email de login da conta MyLane.
                  </span>
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
                    placeholder="9xx xxx xxx"
                  />
                </div>
              </div>
            </section>

            {/* PREFERÊNCIAS MYLANE (mesmo layout da criar conta) */}
            <section className="space-y-3 md:space-y-4">
              <h2 className="text-[11px] font-semibold text-mylane-gold uppercase tracking-[0.14em]">
                Preferências MyLane
              </h2>

              {/* Água + AC */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-300 mb-1">
                    Água a bordo
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <PrefButton
                      label="Nenhuma"
                      active={prefs.water === "none"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, water: "none" }))
                      }
                    />
                    <PrefButton
                      label="Sem gás"
                      active={prefs.water === "still"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, water: "still" }))
                      }
                    />
                    <PrefButton
                      label="Com gás"
                      active={prefs.water === "sparkling"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, water: "sparkling" }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-300">
                      Temperatura do AC
                    </span>
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

              {/* Cheiro + Música */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-300 mb-1">
                    Ambiente aromático
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <PrefButton
                      label="Sem cheiro"
                      active={prefs.scent === "none"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, scent: "none" }))
                      }
                    />
                    <PrefButton
                      label="MyLane Premium"
                      active={prefs.scent === "mylane"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, scent: "mylane" }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-300 mb-1">
                    Música preferida
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <PrefButton
                      label="Silêncio"
                      active={prefs.music === "silent"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, music: "silent" }))
                      }
                    />
                    <PrefButton
                      label="Chill / Lo-fi"
                      active={prefs.music === "chill"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, music: "chill" }))
                      }
                    />
                    <PrefButton
                      label="Jazz"
                      active={prefs.music === "jazz"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, music: "jazz" }))
                      }
                    />
                    <PrefButton
                      label="Hits / Rádio"
                      active={prefs.music === "hits"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, music: "hits" }))
                      }
                    />
                    <PrefButton
                      label="Clássica"
                      active={prefs.music === "classical"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, music: "classical" }))
                      }
                    />
                    <PrefButton
                      label="Rock"
                      active={prefs.music === "rock"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, music: "rock" }))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPrefs((p) => ({ ...p, music: "custom" }))
                    }
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

              {/* Conversa + Lugar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-300 mb-1">
                    Estilo de conversa
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <PrefButton
                      label="Em silêncio"
                      active={prefs.talk === "silent"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, talk: "silent" }))
                      }
                    />
                    <PrefButton
                      label="Conversa leve"
                      active={prefs.talk === "smalltalk"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, talk: "smalltalk" }))
                      }
                    />
                    <PrefButton
                      label="À vontade"
                      active={prefs.talk === "free"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, talk: "free" }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-300 mb-1">
                    Lugar habitual
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <PrefButton
                      label="Sem preferência"
                      active={prefs.seat === "none"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, seat: "none" }))
                      }
                    />
                    <PrefButton
                      label="Banco da frente"
                      active={prefs.seat === "front"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, seat: "front" }))
                      }
                    />
                    <PrefButton
                      label="Atrás direita"
                      active={prefs.seat === "rear_right"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, seat: "rear_right" }))
                      }
                    />
                    <PrefButton
                      label="Atrás esquerda"
                      active={prefs.seat === "rear_left"}
                      onClick={() =>
                        setPrefs((p) => ({ ...p, seat: "rear_left" }))
                      }
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 mt-1">
                Podes atualizar estas preferências sempre que quiseres mantemos
                tudo pronto para a próxima viagem MyLane.
              </p>
            </section>

            {/* BOTÕES */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/reservar")}
                className="btn-mylane-outline flex-1 text-[11px] md:text-xs"
              >
                Voltar às reservas
              </button>

              <button
                type="submit"
                disabled={saving}
                className="btn-mylane-primary flex-1 text-[11px] md:text-xs disabled:opacity-60"
              >
                {saving ? "A guardar..." : "Guardar alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

/* ---------- componentes pequenos ---------- */

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
      className={`chip-mylane text-[11px] ${
        active ? "chip-mylane--active" : ""
      }`}
    >
      {label}
    </button>
  );
}