Airline logos, one per IATA code, 70×70 PNG with a transparent background.
`dark/` holds the variant drawn for dark surfaces. They are the airlines'
trademarks, shown only to identify the carrier beside its name. Files come
from the airline logo set Google Flights serves at
`https://www.gstatic.com/flights/airline_logos/70px/{CODE}.png` (and
`70px/dark/{CODE}.png`). Adding a carrier: drop both files here; `npm test`
fails until they exist.

`XH.png` (Fly Cham) is not in that set; it is a plain monogram tile drawn
here, to be replaced with the airline's mark when one is available.
