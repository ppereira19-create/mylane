// app/api/Create-checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20" as any,
});

type TripType = "one_way" | "round_trip" | "transfer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      priceEur,       // PREÇO FINAL já com IVA + taxas MyLane
      pickup,
      dropoff,
      distanceKm,
      durationMin,
      tripType,
      bookingId,
    } = body as {
      priceEur: number;
      pickup: string;
      dropoff: string;
      distanceKm: number;
      durationMin: number;
      tripType: TripType;
      bookingId?: string | null;
    };

    // validações básicas
    if (!priceEur || isNaN(priceEur)) {
      return NextResponse.json(
        { error: "Preço inválido recebido do orçamento." },
        { status: 400 }
      );
    }

    if (!pickup || !dropoff) {
      return NextResponse.json(
        { error: "Dados da viagem em falta." },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      console.error("NEXT_PUBLIC_APP_URL em falta no .env.local");
      return NextResponse.json(
        { error: "Configuração da app em falta" },
        { status: 500 }
      );
    }

    // descrição legível
    const tripLabel =
      tripType === "one_way"
        ? "Serviço só ida"
        : tripType === "round_trip"
        ? "Serviço ida & volta"
        : "Transfer";

    // criar sessão de checkout na Stripe
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(priceEur * 100), // em cêntimos
            product_data: {
              name: `MyLane – ${pickup} → ${dropoff}`,
              description: tripLabel,
            },
          },
        },
      ],
      success_url: `${baseUrl}/reservar?status=paid&bookingId=${
        bookingId ?? ""
      }`,
      cancel_url: `${baseUrl}/reservar?status=cancel`,
      metadata: {
        pickup,
        dropoff,
        distanceKm: String(distanceKm ?? ""),
        durationMin: String(durationMin ?? ""),
        tripType: tripType ?? "one_way",
        bookingId: bookingId ?? "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Erro Stripe checkout:", err);
    return NextResponse.json(
      { error: "Não foi possível criar o checkout" },
      { status: 500 }
    );
  }
}