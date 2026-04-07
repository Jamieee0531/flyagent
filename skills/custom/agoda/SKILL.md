---
name: agoda-search
description: Search and extract hotel prices from Agoda
---

Task: Search for hotels on Agoda and extract the top 5 options sorted by best value.

Search parameters:
- Destination: {city}
- Check-in: {checkin}
- Check-out: {checkout}
- Guests: {guests} adults
- Rooms: {rooms}

Steps:
1. Navigate to https://www.agoda.com/
2. Find the destination search field. Click it, type "{city}", select the matching destination from dropdown.
3. Click the check-in date field. Navigate to the correct month, select {checkin}.
4. Click the check-out date field. Navigate to the correct month, select {checkout}.
5. Set guests to {guests} adults and {rooms} room(s).
6. Click "Search" or "SEARCH" button.
7. Wait for hotel results to load.
8. Extract the top 5 hotels. For each extract:
    - Hotel name
    - Location/area
    - Star rating or review score
    - Price per night with currency
    - The hotel page URL

Return the results as a JSON array with this format:
[
  {"name": "...", "location": "...", "rating": "...", "price_per_night": "...", "currency": "...", "booking_url": "..."},
  ...
]
