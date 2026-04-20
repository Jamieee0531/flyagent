---
name: ctrip-flight-search
description: Search and extract real flight prices from Ctrip (携程) via direct URL
---

Task: Search for flights on Ctrip and extract the top 5 cheapest options with real prices.

Search parameters:
- From: {origin_code} (IATA code, e.g. SIN)
- To: {destination_code} (IATA code, e.g. TYO)
- Departure: {departure_date} (YYYY-MM-DD)
- Return: {return_date} (YYYY-MM-DD, empty for one-way)
- Passengers: {passengers} adults
- Class: Economy (cabin=y)

Steps:
1. Construct the search URL:
   - One-way: https://flights.ctrip.com/online/list/oneway-{origin_code}-{destination_code}?depdate={departure_date}&cabin=y&adult={passengers}
   - Round-trip: https://flights.ctrip.com/online/list/round-{origin_code}-{destination_code}?depdate={departure_date}&rdate={return_date}&cabin=y&adult={passengers}
2. Navigate directly to the constructed URL.
3. Wait for the page to fully load (flight cards with prices should be visible, look for elements containing "¥" or "含税价").
4. If the page shows a login popup or overlay, close it by clicking the X button or clicking outside the popup.
5. Extract the flight list from the page. Each flight card typically contains:
   - Airline name (e.g. "酷航", "全日空航空", "新加坡航空")
   - Flight number (e.g. "TR882", "ZG054")
   - Aircraft type (e.g. "波音787")
   - Departure time and airport terminal (e.g. "17:15 樟宜机场T1")
   - Arrival time and airport terminal (e.g. "01:05 +1天 羽田机场T3")
   - Flight duration (e.g. "6小时50分")
   - Whether direct or with stops (e.g. "直飞" or transfer info)
   - Price with tax (e.g. "¥1976起 含税价")
6. Extract the top 5 cheapest flights (page default is sorted by price).

Important notes:
- Ctrip uses IATA city codes, not airport codes (TYO for Tokyo, not NRT/HND)
- Prices shown are in CNY (¥) and include tax ("含税价")
- The page loads flight data dynamically; wait at least 3 seconds after navigation
- No login required for searching; login popups can be dismissed
- "+1天" means arrival is next day

Return the results as a JSON array:
[
  {"airline": "酷航", "flight_number": "TR882", "origin": "SIN", "destination": "HND", "departure": "17:15", "arrival": "01:05+1", "duration": "6h50m", "stops": "Direct", "price": "¥1976", "currency": "CNY"},
  ...
]
