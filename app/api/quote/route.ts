// app/api/quote/route.ts
import { NextRequest, NextResponse } from "next/server";

/** Tipos */
type TripType = "one_way" | "round_trip" | "transfer";
type Band = "short" | "mid" | "long";

/** Configuração MyLane */
const CONFIG = {
  baseActivation: {
    short: 5,
    mid: 4,
    long: 3,
  } as Record<Band, number>,

  baseActivationTransfer: 8,

  perKm: {
    short: 0.6,
    mid: 0.55,
    long: 0.5,
  } as Record<Band, number>,

  perMin: {
    short: 0.22,
    mid: 0.25,
    long: 0.25,
  } as Record<Band, number>,

  night: {
    enabled: true,
    startHour: 22,
    endHour: 6,
    factor: 1.15,
  },

  roundTrip: {
    discount: 0.1,
    waitingFee: {
      short: 5,
      mid: 7.5,
      long: 10,
    } as Record<Band, number>,
  },

  transfer: {
    factor: 1.15,
  },

  // raio em km à volta de casa onde o retorno NÃO é cobrado
  freeReturnRadiusKm: 5,
};

/* ------------------ Utils de regra ------------------ */

function getBand(distanceKm: number): Band {
  if (distanceKm < 10) return "short";
  if (distanceKm <= 25) return "mid";
  return "long";
}

function isNight(dateISO?: string): boolean {
  if (!dateISO) return false;
  const d = new Date(dateISO);
  const h = d.getHours();
  return h >= CONFIG.night.startHour || h < CONFIG.night.endHour;
}

/* ------------------ Geoapify helpers ------------------ */

type RouteResult = { distanceKm: number; durationMin: number };

async function geoapifyGeocode(
  address: string,
  apiKey?: string
): Promise<{ lat: number; lon: number } | null> {
  if (!apiKey) return null;
  if (!address.trim()) return null;

  const params = new URLSearchParams({
    text: address,
    format: "json",
    limit: "1",
    apiKey,
  });

  const url = `https://api.geoapify.com/v1/geocode/search?${params.toString()}`;

  try {
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) return null;
    const json = await resp.json();

    const result = json?.results?.[0];
    if (!result) return null;

    return { lat: result.lat, lon: result.lon };
  } catch {
    return null;
  }
}

async function geoapifyRoute(
  originAddress: string,
  destinationAddress: string,
  apiKey?: string
): Promise<RouteResult | null> {
  if (!apiKey) return null;

  const origin = await geoapifyGeocode(originAddress, apiKey);
  const destination = await geoapifyGeocode(destinationAddress, apiKey);
  if (!origin || !destination) return null;

  const waypoints = `${origin.lat},${origin.lon}|${destination.lat},${destination.lon}`;
  const params = new URLSearchParams({
    waypoints,
    mode: "drive",
    apiKey,
  });

  const url = `https://api.geoapify.com/v1/routing?${params.toString()}`;

  try {
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) return null;
    const json = await resp.json();

    const feature = json?.features?.[0];
    const props = feature?.properties;
    if (
      !props ||
      typeof props.distance !== "number" ||
      typeof props.time !== "number"
    ) {
      return null;
    }

    const distanceKm = props.distance / 1000;
    const durationMin = props.time / 60;

    return { distanceKm, durationMin };
  } catch {
    return null;
  }
}

/** Se custo casa→pick-up (km × perKm) for > base, substitui base */
async function maybeOverrideBaseByPickupCost(
  band: Band,
  pickupAddress: string,
  perKm: number,
  baseActiv: number,
  apiKey?: string
): Promise<{ base: number; overrideApplied: boolean; homePickupKm?: number }> {
  const HOME = process.env.MYLANE_HOME_ADDRESS;
  if (!HOME || !apiKey) return { base: baseActiv, overrideApplied: false };

  const route = await geoapifyRoute(HOME, pickupAddress, apiKey);
  if (!route) return { base: baseActiv, overrideApplied: false };

  const homePickupKm = route.distanceKm;
  const homePickupCost = homePickupKm * perKm;

  if (homePickupCost > baseActiv) {
    return {
      base: homePickupCost,
      overrideApplied: true,
      homePickupKm,
    };
  }

  return {
    base: baseActiv,
    overrideApplied: false,
    homePickupKm,
  };
}

/* ------------------ Handler ------------------ */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const pickupAddress: string = body.pickupAddress ?? "";
    const dropoffAddress: string = body.dropoffAddress ?? "";
    const tripType: TripType = body.tripType ?? "one_way";
    const pickupDateTime: string | undefined = body.pickupDateTime;

    if (!pickupAddress || !dropoffAddress) {
      return NextResponse.json(
        { error: "Campos obrigatórios em falta." },
        { status: 400 }
      );
    }

    const API_KEY =
      process.env.GEOAPIFY_API_KEY || process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

    // Distância / duração
    let distanceKm = 12;
    let durationMin = 24;

    const live = await geoapifyRoute(pickupAddress, dropoffAddress, API_KEY);
    if (live) {
      distanceKm = Math.max(0.1, Number(live.distanceKm.toFixed(1)));
      durationMin = Math.max(10, Math.round(live.durationMin));
    }

    const band = getBand(distanceKm);
    const perKm = CONFIG.perKm[band];
    const perMin = CONFIG.perMin[band];

    let base =
      tripType === "transfer"
        ? CONFIG.baseActivationTransfer
        : CONFIG.baseActivation[band];

    const baseOverride = await maybeOverrideBaseByPickupCost(
      band,
      pickupAddress,
      perKm,
      base,
      API_KEY
    );
    base = baseOverride.base;

    const oneWayCost = base + distanceKm * perKm + durationMin * perMin;

    // retorno
    let returnRule:
      | "sem retorno"
      | "meio retorno"
      | "retorno total"
      | "retorno perto casa (não cobrado)"
      | "n/a" = "n/a";

    let returnCost = 0;
    let homeReturnKm: number | null = null;

    if (tripType === "one_way") {
      const HOME = process.env.MYLANE_HOME_ADDRESS;

      if (HOME && API_KEY) {
        const dmHome = await geoapifyRoute(dropoffAddress, HOME, API_KEY);
        if (dmHome) {
          homeReturnKm = Number(dmHome.distanceKm.toFixed(1));
        }
      }

      if (
        homeReturnKm !== null &&
        homeReturnKm <= CONFIG.freeReturnRadiusKm
      ) {
        returnRule = "retorno perto casa (não cobrado)";
        returnCost = 0;
      } else {
        if (band === "short") {
          returnRule = "sem retorno";
        } else if (band === "mid") {
          returnRule = "meio retorno";
          returnCost = (distanceKm / 2) * perKm;
        } else {
          returnRule = "retorno total";
          returnCost = distanceKm * perKm;
        }
      }
    }

    // subtotal sem IVA / Stripe
    let subtotal = 0;
    let waitingFee = 0;

    if (tripType === "one_way") {
      subtotal = oneWayCost + returnCost;
    } else if (tripType === "round_trip") {
      const raw = oneWayCost * 2;
      const discount = CONFIG.roundTrip.discount;
      waitingFee = CONFIG.roundTrip.waitingFee[band];
      subtotal = raw * (1 - discount) + waitingFee;
      returnRule = "n/a";
    } else {
      subtotal = oneWayCost * CONFIG.transfer.factor;
      returnRule = "n/a";
    }

    const nightApplied = CONFIG.night.enabled && isNight(pickupDateTime);
    const nightFactor = nightApplied ? CONFIG.night.factor : 1;

    const basePrice = Number((subtotal * nightFactor).toFixed(2)); // sem IVA/Stripe

    // ---------- IVA + Stripe aqui mesmo ----------
    const IVA = 0.23;
    const STRIPE_PCT = 0.014;
    const STRIPE_FIXO = 0.25;

    const withIva = basePrice * (1 + IVA);
    const stripeFee = withIva * STRIPE_PCT + STRIPE_FIXO;
    const finalPrice = Number((withIva + stripeFee).toFixed(2));

    return NextResponse.json({
      distanceKm: Number(distanceKm.toFixed(2)),
      durationMin: Math.round(durationMin),

      // preço final usado pela app e pela Stripe
      priceEur: finalPrice,

      breakdown: {
        band,
        perKm,
        perMin,
        baseActivation: Number(base.toFixed(2)),
        baseOverriddenByPickup: baseOverride.overrideApplied ?? false,
        baseHomePickupKm: baseOverride.homePickupKm ?? null,
        oneWayCost: Number(oneWayCost.toFixed(2)),
        returnRule,
        returnCost: Number(returnCost.toFixed(2)),
        waitingFee: tripType === "round_trip" ? waitingFee : 0,
        tripType,
        roundTripDiscount:
          tripType === "round_trip" ? CONFIG.roundTrip.discount : 0,
        transferFactor: tripType === "transfer" ? CONFIG.transfer.factor : 1,
        nightApplied,
        nightFactor,
        subtotal: Number(subtotal.toFixed(2)),          // sem night
        subtotalWithNight: basePrice,                    // com night
        totalWithFees: finalPrice,                       // com IVA + Stripe
        homeReturnKm,
        freeReturnRadiusKm: CONFIG.freeReturnRadiusKm,
      },
    });
  } catch (e) {
    console.error("Erro em /api/quote:", e);
    return NextResponse.json(
      { error: "Erro a calcular o orçamento." },
      { status: 500 }
    );
  }
}