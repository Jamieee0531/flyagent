---
name: google-flights-search
description: Search and extract flight prices from Google Flights
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
2. Find the departure city field (may say "Where from?"). Click it, clear any existing text, type "{origin_city}", then select the matching airport from the dropdown.
3. Find the destination city field (may say "Where to?"). Click it, type "{destination_city}", then select the matching airport from the dropdown.
4. Click the departure date field. Navigate to the correct month and select {departure_date}.
5. Click the return date field. Navigate to the correct month and select {return_date}.
6. If the passenger count is not {passengers}, click the passenger selector and adjust to {passengers} adults.
7. Click the "Search" or "Explore" button to start the search.
8. Wait for flight results to fully load (price cards should be visible).
9. Extract the top 5 cheapest flight options. For each flight extract:
   - Airline name (e.g. "Singapore Airlines", "Scoot")
   - Departure time and arrival time
   - Flight duration and number of stops
   - Total price with currency (e.g. "SGD 1,312")
   - If possible, the direct booking URL when clicking "Select flight"

Return the results as a JSON array with this format:
[
  {"airline": "...", "departure": "...", "arrival": "...", "duration": "...", "stops": "...", "price": "...", "currency": "...", "booking_url": "..."},
  ...
]
