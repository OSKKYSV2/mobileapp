# CounterApp (AP5PM 2026, CV04)

Ionic + Angular + Capacitor aplikace s počítadly. Uložená počítadla se sdílejí mezi záložkami
pomocí služby `CounterService` a trvale se ukládají přes Capacitor Preferences.

## Technologie

Angular 22, Ionic 9, Capacitor 8.5, TypeScript 6, Vitest. Projekt byl ověřen na Node.js 24.20
(Angular 22 vyžaduje `^22.22.3 || ^24.15.0 || >=26`, kurz používá Node.js 26).

## Spuštění

```bash
npm install
ionic serve
```

Aplikace poběží na `http://localhost:8100`. Kontroly kvality:

```bash
npm run lint
npm test -- --watch=false
ionic build
```

## Funkce

### Povinná část CV04

- záložka **Počítadlo** – zadání názvu, změna hodnoty a uložení počítadla,
- záložka **Historie** – seznam uložených počítadel s časem vytvoření,
- `CounterService` – jediné místo, které zná klíč v Preferences a převod do JSON; stav je signal
  vystavený pouze pro čtení, inicializace proběhne nejvýše jednou,
- odstranění jednoho záznamu i celé historie, data přežijí obnovení stránky,
- samostatné stavy „načítám“, prázdná historie a seznam,
- testy `CounterService` s mockem Preferences (`counter.service.spec.ts`).

### Povinná rozšíření (bonusy zadání)

| Rozšíření                        | Kde                                                          |
| -------------------------------- | ------------------------------------------------------------ |
| součet hodnot všech počítadel    | záložka Historie, `sumValues()`                              |
| řazení historie                  | `ion-select` – podle času, názvu a hodnoty, `sortCounters()` |
| vyhledávání podle názvu          | `ion-searchbar` (bez ohledu na velikost písmen a diakritiku) |
| potvrzení před vymazáním         | `ion-alert` před „Vymazat vše“                               |
| oznámení po uložení / odstranění | `ion-toast` na záložkách Počítadlo a Historie                |

Bonusová logika (součet, řazení, filtrování) je schválně v samostatném souboru
[`src/app/utils/counter-list.ts`](src/app/utils/counter-list.ts) a ne ve službě pro ukládání dat.

### Individuální funkce – varianta A

SHA-256 hash univerzitního e-mailu začíná číslicí `2` (rozsah `0–3`), proto je přidělena
**varianta A: zobrazit průměr hodnot uložených počítadel**.

Průměr je vidět na záložce **Historie** (řádek „Průměrná hodnota“). Je to `computed` signal
odvozený ze signálu služby, takže se sám přepočítá po každém přidání, odstranění i vymazání
záznamů. Počítá se ze všech uložených záznamů, vyhledávání ho neovlivňuje. Pro prázdnou historii
je průměr nedefinovaný (`averageValue()` vrací `null`), takže se nedělí nulou a řádek se nezobrazí.

- výpočet: `averageValue()` v [`src/app/utils/counter-list.ts`](src/app/utils/counter-list.ts),
- zobrazení: [`src/app/tab2/tab2.page.html`](src/app/tab2/tab2.page.html),
- testy: `counter-list.spec.ts` (výpočet) a `tab2.page.spec.ts` (reakce na změny dat).

## Struktura

```text
src/app/
├── components/counter/   znovupoužitelná komponenta počítadla (input/output)
├── models/               rozhraní SavedCounter
├── services/             CounterService (signaly + Capacitor Preferences)
├── utils/                čisté funkce: součet, průměr, filtrování, řazení
├── tab1/                 záložka Počítadlo
├── tab2/                 záložka Historie
└── tab3/                 záložka O aplikaci
```
