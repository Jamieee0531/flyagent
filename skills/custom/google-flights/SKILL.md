---
name: google-flights-search
description: Search and extract real flight prices from Google Flights
---

Task: Search for flights on Google Flights and extract the top 5 cheapest options with real prices.

Search parameters:
- From: {origin_city}
- To: {destination_city}
- Departure: {departure_date}
- Return: {return_date}
- Passengers: {passengers} adults
- Class: Economy

Steps:
1. Navigate to https://www.google.com/travel/flights
2. Find the "Where from?" combobox. It may already show a default city based on location. Click it, clear any existing text, type "{origin_city}". A dropdown will appear with airport options. Select the matching airport (e.g. "Singapore Changi Airport (SIN)").
3. Find the "Where to?" combobox. Click it, type "{destination_city}". A dropdown appears. Select the city option (e.g. "Tokyo, Japan") which includes all airports, OR select a specific airport.
4. Click the "Departure" textbox. A calendar grid appears showing dates as buttons. Each date button's label includes the full date and a price estimate (e.g. "Friday, May 1, 2026 , 484 Singapore dollars"). Find and click the button matching {departure_date}.
5. After selecting departure, the calendar automatically switches to return date selection. The departure date button now shows "departure date" in its label. Find and click the button matching {return_date}. Then click the "Done" button (its label will say something like "Done. Search for round trip flights, departing on ... and returning on ...").
6. If {passengers} is not 1, click the passenger button (e.g. "1 passenger, change number of passengers.") and adjust to {passengers} adults.
7. Click the "Search" button to start the search.
8. Wait for flight results to load (at least 5 seconds). Results appear as links with detailed flight information in their accessible names.

Extracting results:
- Each flight result is a link element with a comprehensive label like: "From 622 Singapore dollars round trip total. Nonstop flight with Scoot. Leaves Singapore Changi Airport at 5:15 PM on Friday, May 1 and arrives at Haneda Airport at 1:05 AM on Saturday, May 2. Total duration 6 hr 50 min. Select flight"
- The label contains ALL needed info: price, airline, airports, times, duration, stops
- Extract the top 5 results by parsing these link labels
- Filter tabs at the top: "Best" (default), "Cheapest" — click "Cheapest" tab for lowest prices

Important notes:
- Google Flights works in headless mode (no CAPTCHA)
- Origin may auto-fill based on user location (Singapore)
- Prices are shown in local currency (SGD for Singapore)
- The calendar shows price estimates per date even before searching
- After clicking "Done" on dates, you must click "Search" button separately
- Results include both direct and connecting flights
- Each result link leads to booking options when clicked

Return the results as a JSON array:
[
  {"airline": "Scoot", "flight_number": "", "origin": "SIN", "destination": "HND", "departure": "5:15 PM", "arrival": "1:05 AM+1", "duration": "6h50m", "stops": "Nonstop", "price": "SGD 622", "currency": "SGD", "booking_url": ""},
  ...
]
