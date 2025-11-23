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

type SimpleUser = {
  id: string;
  email: string | null;
  full_name: string | null;
};

export default function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // se por algum motivo não houver supabase, não fazemos nada
    if (!supabase) return;

    let cancelled = false;

    const saveUser = (u: SimpleUser | null) => {
      if (cancelled) return;
      setUser(u);

      if (typeof window === "undefined") return;

      if (u) {
        localStorage.setItem("mylane_user", JSON.stringify(u));
      } else {
        localStorage.removeItem("mylane_user");
      }
    };

    const loadFromSession = async (session: any) => {
      if (!session?.user) {
        saveUser(null);
        return;
      }

      const { user } = session;

      // ir buscar o nome à tabela mylane_users
      const { data: profile } = await supabase
        .from("mylane_users")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const finalUser: SimpleUser = {
        id: user.id,
        email: user.email ?? "",
        full_name: profile?.full_name ?? null,
      };

      saveUser(finalUser);
    };

    // 1) tentar ler rapidamente do localStorage
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("mylane_user");
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as SimpleUser;
          setUser(parsed);
        } catch {
          // se estiver estragado, ignoramos
        }
      }
    }

    // 2) confirmar sessão actual
    supabase.auth.getSession().then(({ data }) => {
      loadFromSession(data.session);
    });

    // 3) ouvir alterações de sessão (login / logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadFromSession(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("mylane_user");
    }

    setUser(null);
    setOpen(false);
    router.push("/login");
  }

  const initial =
    user?.full_name?.trim()[0]?.toUpperCase() ??
    user?.email?.trim()[0]?.toUpperCase() ??
    "M";

  /* =========================
     SEM LOGIN
     ========================= */
  if (!user) {
    return (
      <div className="user-pill">
        <div className="user-pill__circle">M</div>
        <span className="user-pill__name">Guest</span>

        <button onClick={() => router.push("/login")}>Entrar</button>
      </div>
    );
  }

  /* =========================
     COM LOGIN
     ========================= */
  return (
    <>
      <div
        className="user-pill cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="user-pill__circle">{initial}</div>

        <span className="user-pill__name">
          {user.full_name || user.email}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        >
          {open ? "Fechar" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="fixed right-[1.4rem] top-[3.9rem] z-50 w-44 rounded-xl border border-yellow-400/40 bg-black/95 text-xs text-gray-100 overflow-hidden shadow-lg">
          <div className="px-3 py-2 border-b border-yellow-400/20">
            <div className="text-[11px] text-gray-400">Sessão como</div>
            <div className="truncate text-[11px] text-mylane-gold">
              {user.full_name || user.email}
            </div>
            <div className="truncate text-[10px] text-gray-500">
              {user.email}
            </div>
          </div>

          <button
            onClick={() => router.push("/perfil")}
            className="w-full text-left px-3 py-2 hover:bg-white/5 text-[11px]"
          >
            Ver / Editar perfil
          </button>

          <button
            onClick={() => router.push("/reservar")}
            className="w-full text-left px-3 py-2 hover:bg-white/5 text-[11px]"
          >
            Minhas reservas
          </button>

          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-[11px] text-red-300"
          >
            Terminar sessão
          </button>
        </div>
      )}
    </>
  );
}