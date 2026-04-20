---
name: skyscanner-search
description: Search and extract flight prices from Skyscanner
---

Task: Search for flights on Skyscanner and extract the top 5 cheapest options with real prices.

Search parameters:
- From: {origin_city}
- To: {destination_city}
- Departure: {departure_date}
- Return: {return_date}
- Passengers: {passengers} adults
- Class: Economy

Steps:
1. Navigate to https://www.skyscanner.com.sg/ (or https://www.skyscanner.net/)
2. Find the "From" field. Click it, clear existing text, type "{origin_city}", select the matching airport.
3. Find the "To" field. Click it, type "{destination_city}", select the matching airport.
4. Click the departure date field, navigate to the correct month, select {departure_date}.
5. Click the return date field, navigate to the correct month, select {return_date}.
6. Set passengers to {passengers} adults if not already set.
7. Click "Search flights".
8. Wait for results to load (flight cards with prices visible).
9. If asked to sort, select "Cheapest" sort option.
10. Extract the top 5 cheapest options. For each extract:
    - Airline name
    - Departure and arrival times
    - Duration and stops
    - Total price with currency
    - Booking link if available

Return the results as a JSON array with this format:
[
  {"airline": "...", "departure": "...", "arrival": "...", "duration": "...", "stops": "...", "price": "...", "currency": "...", "booking_url": "..."},
  ...
]
