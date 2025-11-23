# 🏎️ Regras de Cálculo MyLane

Estas são as regras oficiais de cálculo de viagens para o sistema **MyLane** (serviços Ida, Ida & Volta e Transfer).

---

## 🚗 1. Preço Base de Ativação

| Tipo de Viagem | Distância | Preço Base (€) |
|----------------|------------|----------------|
| Ida / Ida & Volta | < 10 km | 5 € |
| Ida / Ida & Volta | 10–25 km | 4 € |
| Ida / Ida & Volta | > 25 km | 3 € |
| Transfer | Qualquer distância | 8 € |

> 💡 O preço base pode ser substituído se o custo do percurso de **pickup** (da morada do motorista à origem do cliente) for superior.  
> Ou seja: `se (pickup_cost > base_price) ⇒ usar pickup_cost`.

---

## 📏 2. Tarifas por Quilómetro

| Faixa | Condição | Tarifa €/km |
|--------|-----------|-------------|
| Curta | < 10 km | 0.60 €/km |
| Média | 10–25 km | 0.55 €/km |
| Longa | > 25 km | 0.50 €/km |

> Aplicável a todos os serviços (Ida, Ida & Volta e Transfer).

---

## ⏱️ 3. Tarifas por Minuto

| Faixa | Condição | Tarifa €/min |
|--------|-----------|--------------|
| Curta | < 10 km | 0.22 €/min |
| Média | 10–25 km | 0.25 €/min |
| Longa | > 25 km | 0.25 €/min |

> Também aplicável a todos os serviços.

---

## 🔁 4. Regra de Retorno (apenas para “Ida”)

| Distância | Regra de Retorno |
|------------|------------------|
| < 10 km | Não paga retorno |
| 10–25 km | Paga **metade do retorno** à morada do motorista |
| > 25 km | Paga **retorno completo** à morada do motorista |

---

## 🔂 5. Ida & Volta

- Aplica **10% de desconto** sobre o valor total (ida + volta).  
- Soma também a **taxa de espera**, conforme distância:

| Distância | Taxa de Espera (€) |
|------------|--------------------|
| < 10 km | 5 € |
| 10–25 km | 7.5 € |
| > 25 km | 10 € |

---

## ✈️ 6. Transfer

- Multiplica o valor total calculado (quilómetros + minutos + base) por um fator **1.15**  
  → `price = base + (km * rate_km) + (min * rate_min) × 1.15`
- Sem desconto nem taxa de espera adicional.

---

## 🌙 7. Taxa Noturna

- Aplica-se **entre as 22:00 e as 06:00**.
- Valor: **+15%** sobre o total final.  
  → `price_final = price × 1.15`

---

## 🧮 8. Estrutura do Cálculo (resumo)

```text
Preço Base = conforme faixa de distância
+ (km × tarifa_km)
+ (min × tarifa_min)
+ retorno (quando aplicável)
+ taxa de espera (ida & volta)
→ aplicar descontos ou multiplicadores (transfer, noturno)
