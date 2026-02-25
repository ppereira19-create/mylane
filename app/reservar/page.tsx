"use client";

import { FormEvent, useEffect, useState } from "react";

type TripType = "one_way" | "round_trip" | "transfer";

type Quote = {
  distanceKm: number;
  durationMin: number;
  priceEur: number; // já vem com IVA + taxas incluídas
  breakdown?: any;
};

type SimpleUser = {
  id: string;
  email: string | null;
  full_name: string | null;
};

export default function ReservarPage() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [time, setTime] = useState(""); // HH:MM
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");

  const [tripType, setTripType] = useState<TripType>("one_way");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // pagamento Stripe
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  // utilizador logado (vindo do localStorage "mylane_user")
  const [currentUser, setCurrentUser] = useState<SimpleUser | null>(null);

  // junta HH + MM e actualiza o state time
  function updateTime(h: string, m: string) {
    setHour(h);
    setMinute(m);

    if (h && m) setTime(`${h}:${m}`);
    else setTime("");
  }

  // ---------- Autocomplete + user ----------
  useEffect(() => {
    // 1) ler o utilizador guardado pelo UserMenu
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("mylane_user");
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as SimpleUser;
          setCurrentUser(parsed);
          console.log("User carregado do localStorage:", parsed);
        } catch (e) {
          console.warn("Erro a ler mylane_user do localStorage", e);
        }
      }
    }

    if (typeof window === "undefined") return;

    const key = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
    if (!key) {
      console.warn("Falta NEXT_PUBLIC_GEOAPIFY_KEY no .env.local");
      return;
    }

    const attachAutocomplete = (
      inputId: string,
      onSelect: (value: string) => void
    ) => {
      const input = document.getElementById(inputId) as HTMLInputElement | null;
      if (!input) return;

      let controller: AbortController | null = null;
      let list: HTMLDivElement | null = null;

      const ensureList = () => {
        if (!list) {
          list = document.createElement("div");
          list.id = `${inputId}-list`;
          list.className = "autocomplete-list";
          input.parentNode?.appendChild(list);
        }
        return list;
      };

      const clearList = () => {
        if (list) list.innerHTML = "";
      };

      const onInput = async () => {
        const query = input.value.trim();
        onSelect(query);

        if (query.length < 3) {
          clearList();
          return;
        }

        if (controller) controller.abort();
        controller = new AbortController();

        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          query
        )}&lang=pt&filter=countrycode:pt&limit=5&apiKey=${key}`;

        try {
          const res = await fetch(url, { signal: controller.signal });
          if (!res.ok) return;
          const data = await res.json();

          const container = ensureList();
          container.innerHTML = "";

          (data.features || []).forEach((item: any) => {
            const formatted = item.properties?.formatted as string;
            if (!formatted) return;

            const option = document.createElement("div");
            option.className = "autocomplete-item";
            option.textContent = formatted;
            option.onclick = () => {
              onSelect(formatted);
              clearList();
            };
            container.appendChild(option);
          });
        } catch {
          // ignore abort
        }
      };

      const onBlur = () => {
        setTimeout(clearList, 200);
      };

      input.addEventListener("input", onInput);
      input.addEventListener("blur", onBlur);

      return () => {
        input.removeEventListener("input", onInput);
        input.removeEventListener("blur", onBlur);
        controller?.abort();
        if (list) list.remove();
      };
    };

    const cleanups: Array<(() => void) | void> = [];
    cleanups.push(attachAutocomplete("pickup-input", setPickup));
    cleanups.push(attachAutocomplete("dropoff-input", setDropoff));

    return () => {
      cleanups.forEach((fn) => fn && fn());
    };
  }, []);

  // ---------- Calcular preço ----------
  async function handleCalculate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setQuote(null);
    setShowSummaryModal(false);
    setPayError("");

    if (!pickup || !dropoff || !date || !time) {
      setError("Preenche todos os campos primeiro.");
      return;
    }

    const pickupDateTimeIso = new Date(`${date}T${time}:00`).toISOString();

    try {
      setLoading(true);
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupAddress: pickup,
          dropoffAddress: dropoff,
          tripType,
          pickupDateTime: pickupDateTimeIso,
        }),
      });

      if (!res.ok) throw new Error("Erro ao calcular a viagem.");

      const data: Quote = await res.json();
      setQuote(data);
      setShowSummaryModal(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Algo correu mal. Tenta outra vez.");
    } finally {
      setLoading(false);
    }
  }

  // ---------- Iniciar pagamento Stripe ----------
  async function handlePayNow() {
    if (!quote) return;

    try {
      setPayError("");
      setPaying(true);

      if (!pickup || !dropoff || !date || !time) {
        setPayError(
          "Falta informação da viagem. Revê os dados antes de pagar."
        );
        setPaying(false);
        return;
      }

      const pickupDateTimeIso = new Date(`${date}T${time}:00`).toISOString();

      // 2) criar a reserva na tabela "bookings"
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup,
          dropoff,
          pickupDateTime: pickupDateTimeIso,
          tripType,
          distanceKm: quote.distanceKm,
          durationMin: quote.durationMin,
          priceEur: quote.priceEur, // preço final c/ IVA
          userId: currentUser?.id ?? null,
          customerEmail: currentUser?.email ?? null,
        }),
      });

      if (!bookingRes.ok) {
        const data = await bookingRes.json().catch(() => ({}));
        console.error("Erro ao criar booking:", data);
        setPayError("Não foi possível criar a reserva. Tenta outra vez.");
        setPaying(false);
        return;
      }

      const { bookingId } = await bookingRes.json();

      // 3) chamar a API de checkout Stripe já com o bookingId
      const res = await fetch("/api/Create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceEur: quote.priceEur,
          pickup,
          dropoff,
          distanceKm: quote.distanceKm,
          durationMin: quote.durationMin,
          tripType,
          bookingId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Erro ao criar checkout:", data);
        setPayError("Não foi possível iniciar o pagamento. Tenta outra vez.");
        setPaying(false);
        return;
      }

      const data = await res.json();

      if (!data.url) {
        setPayError("Resposta inválida do servidor de pagamento.");
        setPaying(false);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setPayError("Erro inesperado ao iniciar o pagamento.");
      setPaying(false);
    }
  }

  const tripLabel =
    tripType === "one_way"
      ? "Ida"
      : tripType === "round_trip"
      ? "Ida & Volta"
      : "Transfer";

  const formattedDateTime = date && time ? `${date} ${time}` : "—";

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero Mustang */}
      <div className="relative w-full h-[420px] md:h-[520px] overflow-hidden">
        <img
          src="/mustang1.png"
          alt="MyLane Mustang"
          className="object-cover w-full h-full scale-110 md:scale-100 object-center md:object-[center_50%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-black/25" />
        <div className="absolute bottom-10 left-0 right-0 text-center px-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-[0.18em] drop-shadow-lg text-mylane-gold">
            RESERVAR VIAGEM
          </h1>
          <p className="text-xs md:text-sm text-gray-200">
            Escolhe o percurso o serviço e vê o valor estimado MyLane em
            segundos.
          </p>

          {currentUser && (
            <p className="mt-2 text-[10px] text-gray-400">
              A reserva será associada a <span className="font-semibold">
                {currentUser.email}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Form + resultado */}
      <div className="flex-1 flex items-start justify-center px-4 pb-10">
        <div className="w-full max-w-xl space-y-6 -mt-14">
          <form
            onSubmit={handleCalculate}
            className="space-y-4 card-mylane p-5 backdrop-blur"
          >
            {/* Ponto de partida */}
            <div className="relative">
              <label className="text-xs text-gray-400">Ponto de partida</label>
              <div className="mt-1 relative">
                <input
                  id="pickup-input"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="input-mylane input-gold placeholder:text-gray-500"
                  placeholder="Hotel morada ou aeroporto"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Destino */}
            <div className="relative">
              <label className="text-xs text-gray-400">Destino</label>
              <div className="mt-1 relative">
                <input
                  id="dropoff-input"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="input-mylane input-gold placeholder:text-gray-500"
                  placeholder="Morada ou local"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Data + Hora */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 input-mylane input-gold"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">Hora</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <select
                    value={hour}
                    onChange={(e) => updateTime(e.target.value, minute)}
                    className="input-mylane input-gold bg-transparent"
                  >
                    <option value="" className="bg-black text-white">
                      HH
                    </option>
                    {Array.from({ length: 24 }).map((_, h) => {
                      const value = String(h).padStart(2, "0");
                      return (
                        <option
                          key={value}
                          value={value}
                          className="bg-black text-white"
                        >
                          {value}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    value={minute}
                    onChange={(e) => updateTime(hour, e.target.value)}
                    className="input-mylane input-gold bg-transparent"
                  >
                    <option value="" className="bg-black text-white">
                      MM
                    </option>
                    {Array.from({ length: 60 }).map((_, m) => {
                      const value = String(m).padStart(2, "0");
                      return (
                        <option
                          key={value}
                          value={value}
                          className="bg-black text-white"
                        >
                          {value}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Tipo de serviço */}
            <div className="space-y-2 mt-2">
              <div className="text-xs text-gray-400">Tipo de serviço</div>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-300">
                <button
                  type="button"
                  onClick={() => setTripType("one_way")}
                  className={
                    "chip-mylane " +
                    (tripType === "one_way" ? "chip-mylane--active" : "")
                  }
                >
                  Ida
                </button>
                <button
                  type="button"
                  onClick={() => setTripType("round_trip")}
                  className={
                    "chip-mylane " +
                    (tripType === "round_trip" ? "chip-mylane--active" : "")
                  }
                >
                  Ida &amp; Volta
                </button>
                <button
                  type="button"
                  onClick={() => setTripType("transfer")}
                  className={
                    "chip-mylane " +
                    (tripType === "transfer" ? "chip-mylane--active" : "")
                  }
                >
                  Transfer
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/40 border border-red-500/40 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 btn-mylane-primary disabled:opacity-60"
            >
              {loading ? "A calcular..." : "Calcular viagem"}
            </button>
          </form>

          {/* Resultado compacto em baixo */}
          {quote && (
            <div className="card-mylane p-4 text-sm space-y-1">
              <div className="text-xs text-gray-400">
                Estimativa MyLane (preço final c/ IVA) ({tripLabel})
              </div>
              <div className="text-2xl font-semibold text-mylane-gold">
                {quote.priceEur.toFixed(2)} €
              </div>
              <div className="text-xs text-gray-300">
                Distância aproximada: {quote.distanceKm.toFixed(1)} km
              </div>
              <div className="text-xs text-gray-300">
                Duração aproximada: {Math.round(quote.durationMin)} min
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------- POP-UP CONFIRMAR RESERVA ---------- */}
      {showSummaryModal && quote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg card-mylane bg-black/95 px-6 py-5 shadow-2xl">
            {/* botão X */}
            <button
              type="button"
              onClick={() => setShowSummaryModal(false)}
              className="absolute right-4 top-4 text-sm text-neutral-400 hover:text-neutral-100"
            >
              ✕
            </button>

            <h2 className="mb-1 text-center text-lg font-semibold tracking-[0.25em] text-mylane-gold">
              CONFIRMAR RESERVA
            </h2>
            <p className="mb-4 text-center text-xs text-neutral-400">
              Revê os detalhes da tua MyLane antes de avançar
            </p>

            {/* Resumo da viagem */}
            <div className="mb-4 space-y-2 text-sm text-neutral-200">
              <div className="flex justify-between">
                <span className="text-neutral-400">Tipo de serviço</span>
                <span className="font-medium">{tripLabel}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Ponto de partida</span>
                <span className="w-1/2 text-right text-xs">{pickup}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Destino</span>
                <span className="w-1/2 text-right text-xs">{dropoff}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Data &amp; hora</span>
                <span className="font-medium text-xs">
                  {formattedDateTime}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Distância</span>
                <span>{quote.distanceKm.toFixed(1)} km</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Duração</span>
                <span>{Math.round(quote.durationMin)} min</span>
              </div>
            </div>

            {/* Preço em destaque */}
            <div className="mb-3 rounded-xl bg-neutral-900/80 px-4 py-3">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wide text-neutral-400">
                    Estimativa MyLane (preço final c/ IVA)
                  </span>
                  <div className="text-2xl font-semibold text-mylane-gold">
                    {quote.priceEur.toFixed(2)} €
                  </div>
                </div>
                {quote.breakdown?.nightApplied && (
                  <span className="rounded-full px-3 py-1 text-xs text-mylane-gold bg-mylane-gold/10">
                    tarifa nocturna
                  </span>
                )}
              </div>
            </div>

            {/* Erro de pagamento */}
            {payError && (
              <p className="mb-2 text-center text-[11px] text-red-400">
                {payError}
              </p>
            )}

            {/* Botões */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="flex-1 rounded-xl border border-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-200 hover:bg-neutral-800/80"
              >
                Editar viagem
              </button>
              <button
                type="button"
                onClick={handlePayNow}
                disabled={paying}
                className="flex-1 btn-mylane-primary disabled:opacity-60"
              >
                {paying ? "A encaminhar para pagamento..." : "Pagar agora"}
              </button>
            </div>

            <p className="mt-3 text-center text-[10px] text-neutral-500">
              O valor final poderá variar em função do trânsito real e
              alterações ao percurso.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}