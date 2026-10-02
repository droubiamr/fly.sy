@AGENTS.md

# Writing anything a traveller reads

This covers `data/*.json` (notes, news, needs), `src/messages/index.ts` (FAQ and page text) and anything
else that ends up on the site. People plan real journeys from it, so a confident wrong sentence is worse
than a gap.

1. **Say only what the source says.** Quote or paraphrase it; don't add the consequence you think follows.
   "EASA advises against flying below FL260" is the source. "So European airlines can't land in Syria" is
   an inference, and it was false: Sundair, LEAV and Dan Air fly in.
2. **Advice is not a ban.** EASA conflict-zone bulletins, foreign travel advisories and similar notices are
   recommendations. Write "advises", "recommends", "tells its operators to avoid". Never "bans", "rules
   out", "prevents" or "can't", unless the source itself is a binding order and says so.
3. **Check every absolute against the data.** Before writing "no", "none", "never", "only", "all", "can't"
   or "the only route", look in `data/arrivals.json` and `data/entries.json` (and the airport boards if it
   is about flights). If one row contradicts the sentence, the sentence is wrong. "Are there direct flights
   from Europe?" was once answered "No" while six European routes were listed on the site.
4. **New text must not contradict existing text.** When you add or change a note, a news item or an FAQ
   answer, search the data and `src/messages/index.ts` for the same subject and make them agree.
5. **Re-read as a traveller before pushing.** For each new sentence ask: could someone book, travel or
   stay home because of this, and is it exactly true? If not certain, say less, or say what is not known.

The rest of the editorial rules (sources, confidence levels, `seen` dates, what we won't publish) are in
`README.md` → "Updating data" and `CONTRIBUTING.md`.
