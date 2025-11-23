import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      pickup,
      dropoff,
      distanceKm,
      durationMin,
      tripType,
      pickupDateTime,
      priceEur,
      userId,
      customerEmail,
    } = body;

    if (!pickup || !dropoff || !pickupDateTime || !priceEur) {
      return NextResponse.json(
        { error: "Dados em falta para criar reserva." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        pickup_address: pickup,
        dropoff_address: dropoff,
        distance_km: distanceKm,
        duration_min: durationMin,
        trip_type: tripType,
        pickup_datetime: pickupDateTime,
        price_eur: priceEur,
        status: "pending",
        user_id: userId ?? null,
        customer_email: customerEmail ?? null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Erro Supabase bookings:", error);
      return NextResponse.json(
        { error: "Falha ao gravar reserva." },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookingId: data.id });
  } catch (err) {
    console.error("Erro API /bookings:", err);
    return NextResponse.json(
      { error: "Erro inesperado ao criar reserva." },
      { status: 500 }
    );
  }
}