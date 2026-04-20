---
name: booking-com-search
description: Search and extract hotel prices from Booking.com
---

Task: Search for hotels on Booking.com and extract the top 5 options with real prices.

Search parameters:
- Destination: {city}
- Check-in: {checkin}
- Check-out: {checkout}
- Guests: {guests} adults
- Rooms: {rooms}

Steps:
1. Navigate to https://www.booking.com/
2. If a sign-in popup or modal appears (button labeled "Dismiss sign-in info" or similar), close it first.
3. Find the destination search field (combobox labeled "Where are you going?"). Click it, clear any existing text, then type "{city}" character by character. Wait 2-3 seconds for the autocomplete dropdown to appear.
4. From the dropdown, select the option that best matches "{city}" (e.g., "{city}, Japan" or "{city} Tokyo-to, Japan"). The option elements appear as `option` or `button` roles in the dropdown listbox.
5. After selecting the destination, the calendar picker opens automatically. It shows two months of dates as checkbox elements (e.g., "Fr 1 May 2026"). Find and click the checkbox for {checkin}. The check-in date is now set.
6. The calendar stays open for check-out selection. Find and click the checkbox for {checkout}. Both dates are now confirmed (shown as e.g., "Fri, May 1 — Wed, May 6" in the date button).
7. Close the calendar by clicking the date button itself (toggling it closed).
8. Look for an occupancy/guests button (labeled like "2 adults · 0 children · 1 room"). If visible and the values don't match {guests} adults and {rooms} room(s), click it and adjust using the +/- buttons. If not visible, the defaults (2 adults, 1 room) are already applied.
9. Click the "Search" button.
10. Wait for the page to load. Booking.com may redirect to a city page (URL like /city/jp/tokyo.html) with the calendar open again. If this happens:
    a. The calendar will show again — re-select {checkin} and {checkout} dates as in steps 5-6.
    b. Close the calendar and click "Search" again.
11. Once results load, look for sort buttons: "Our top picks", "Lowest Price First", "Star rating and price", "Top reviewed". Click "Lowest Price First" or "Top reviewed" based on preference.
12. Extract the top 5 hotels from the results. Each hotel card is a link element containing:
    - Hotel name
    - Location (e.g., "Hotel in Shibuya Ward, Tokyo")
    - Star rating (shown as "X stars")
    - Review score and label (e.g., "8.7 Excellent")
    - Price for the stay (e.g., "$164" or "S$ 890")
    - Each hotel has a "Check availability" link — use its href as the booking URL

Return the results as a JSON array with this format:
[
  {"name": "...", "location": "...", "rating": "...", "price_per_night": "...", "currency": "...", "booking_url": "..."},
  ...
]

Important notes:
- The calendar uses checkbox elements for dates, NOT regular buttons. Dates are labeled like "Fr 1 May 2026" or "We 6 May 2026".
- Past dates are disabled checkboxes.
- Use "Next month" button if the target month is not visible.
- If no prices are shown (only "Check availability"), it means dates were not properly applied — go back and re-enter dates.
