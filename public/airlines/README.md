Airline logos, one per IATA code, 70×70 PNG with a transparent background.
`dark/` holds the variant drawn for dark surfaces. They are the airlines'
trademarks, shown only to identify the carrier beside its name. Files come
from the airline logo set Google Flights serves at
`https://www.gstatic.com/flights/airline_logos/70px/{CODE}.png` (and
`70px/dark/{CODE}.png`). Adding a carrier: drop both files here; `npm test`
fails until they exist.

Two carriers come from elsewhere: `XH.png` (Fly Cham) is not in that set,
so it is the bird mark from the airline's own site icon (flycham.com), the
same on light and dark. `DN.png` (Dan Air) is in the set only as a grey
wing, so it is the coloured logo from the airline's own site
(danair.ro); the dark variant turns the navy wordmark white.
