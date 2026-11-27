# Sources: search (How a search engine finds an answer in a second)
Researched Oct 27 2026. The Google pages were opened and checked.

| Claim (script) | Source |
|---|---|
| Google doesn't search the live web when you search; it searches its index, built beforehand by crawling | Google, "How Search organizes information": crawlers "visit publicly accessible webpages and follow links"; when you search, Google "looks through hundreds of billions of webpages ... organized in our Search index." https://www.google.com/search/howsearchworks/how-search-works/organizing-information/ |
| Crawlers visit pages and follow their links to find new ones | Same page ("follow links on those pages"; crawling runs continuously and discovers new pages through new links). Also Google Search Central, "In-depth guide to how Google Search works" https://developers.google.com/search/docs/fundamentals/how-search-works |
| Index: hundreds of billions of pages, over 100 million gigabytes | Google, "How Search organizes information": "hundreds of billions of webpages", "well over 100,000,000 gigabytes in size" |
| Google compares it to the index at the back of a book, with an entry for every word | Same page: "It's like the index in the back of a book - with an entry for every word seen on every webpage we index." |
| Each word points to a list of pages; a query fetches each word's list and keeps the pages on every list | Standard inverted index and postings-list intersection: Manning, Raghavan & Schütze, *Introduction to Information Retrieval*, sec. 1.3 "Processing Boolean queries" https://nlp.stanford.edu/IR-book/html/htmledition/processing-boolean-queries-1.html ; Schütze lecture slides https://www.cis.lmu.de/~hs/teach/14s/ir/pdf/02voc.flat.pdf |
| Results are ranked by meaning, relevance, quality, usability and context (e.g. location) | Google, "How Search ranks results" ("Meaning, Relevance, Quality, Usability, and Context") https://www.google.com/search/howsearchworks/how-search-works/ranking-results/ |
| One quality clue: whether other well-known sites link to the page | Same page: "understanding if other prominent websites link or refer to the content" |
| Fixes spelling, uses synonyms so pages without your exact words can match | Same page: recognises and corrects spelling mistakes; "sophisticated synonym system" finds documents without the exact words |
| Happens in a fraction of a second | Same page: "People expect Search to deliver quality results in a fraction of a second." |
| About 15% of daily searches are brand new | Google blog, Pandu Nayak, "Understanding searches better than ever before", Oct 25 2019: "15 percent of those queries are ones we haven't seen before." https://blog.google/products/search/search-language-understanding-bert/ (Google repeated the figure in 2013 and 2017). |

## Softened / careful wording
1. "pages that show up on every list are the ones that match" describes basic keyword matching (textbook inverted index). Google's real system also uses synonyms and language models, which the reel covers right after. The page lists and IDs on screen are made-up examples.
2. "fifteen percent" is attributed on screen and in the voiceover ("Google says ..., SOURCE: GOOGLE, 2019"). It is Google's own figure and not independently verified.
3. No number of results is claimed for "a huge pile". The "< 1 s" on screen restates "fraction of a second".
4. On screen, the example result "Why the atmosphere looks azure" and the link sources (encyclopedia, university, etc.) are illustrations.
5. "Google doesn't go out and search the web" refers to the classic web results. Newer AI features can fetch fresh content; the reel doesn't cover them.
