---
name: agoda-search
description: Search and extract hotel prices from Agoda
---

Task: Search for hotels on Agoda and extract the top 5 options with real prices.

Search parameters:
- Destination: {city}
- Check-in: {checkin}
- Check-out: {checkout}
- Guests: {guests} adults
- Rooms: {rooms}

Steps:
1. Navigate to https://www.agoda.com/
2. Find the destination search field (combobox labeled "Enter a destination or property"). Click it, clear any existing text, then type "{city}" character by character. Wait 2-3 seconds for the autocomplete dropdown to appear.
3. From the dropdown, select the option that best matches "{city}" (e.g., "{city}, Japan City Popular"). The options appear as `option` elements in the dropdown.
4. After selecting the destination, the calendar picker opens automatically. It shows date buttons labeled like "Fri May 01 2026". The current check-in and check-out dates are shown in two separate buttons at the top (e.g., "Check-in 16 Apr 2026 Thursday" and "Check-out 17 Apr 2026 Friday").
5. Find and click the button for {checkin}. The check-in is now set. The calendar automatically shifts to check-out selection.
6. Find and click the button for {checkout}. Both dates are now confirmed. Use the "Next Month" button if the target month is not visible.
7. The guests panel may open automatically after date selection. It shows the current setting (e.g., "2 adults 1 room") with +/- buttons for Room, Adults, and Children:
   - "Subtract Room" / "Add Room" buttons
   - "Subtract Adults" / "Add Adults" buttons
   - "Subtract Children" / "Add Children" buttons
   If the values don't match {guests} adults and {rooms} room(s), click the appropriate +/- buttons to adjust.
8. Click the "SEARCH" button.
9. Wait for hotel results to load (5-10 seconds). If an error appears ("There was a problem completing your search"):
   a. Close any popup (look for "Close modal" or "X" button).
   b. Re-fill the destination field with "{city}" and re-select from dropdown.
   c. The dates and guest count should still be preserved in the search bar.
   d. Click "SEARCH" again.
10. Once results load, look for sort/filter options. Agoda typically shows filters on the left sidebar and sort options above the results.
11. Extract the top 5 hotels from the results. For each hotel extract:
    - Hotel name
    - Location/area
    - Star rating or review score
    - Price per night with currency (Agoda shows prices in the local currency, e.g., "S$ 200")
    - The hotel page URL from the listing link

Return the results as a JSON array with this format:
[
  {"name": "...", "location": "...", "rating": "...", "price_per_night": "...", "currency": "...", "booking_url": "..."},
  ...
]

Important notes:
- Agoda calendar uses button elements for dates, NOT checkboxes. Dates are labeled like "Fri May 01 2026".
- Past dates are disabled buttons.
- The "Previous Month" button may be disabled if viewing the current month.
- Agoda may show promotional popups or coupon banners — dismiss them by clicking "Close" or "X" buttons.
- The search bar at the top of the results page always shows the current search parameters — use it to verify dates and destination are correct before extracting results.
- Currency display can be changed via the "Price display in Singapore Dollar" button in the header.
