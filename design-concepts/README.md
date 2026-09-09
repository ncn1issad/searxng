# Search interface design concepts

This directory contains disposable visual concepts for the public SearXNG
search interface. It does not cover administration pages.

## Structure

- `fixtures/` stores captured or simplified search-result content.
- `shared/` contains Catppuccin colour tokens and common prototype styles.
- `concepts/` contains one self-contained directory per design direction.

Concepts use semantic HTML, plain CSS, and small amounts of vanilla JavaScript.
They intentionally have no framework or build step. Once a direction is chosen,
its visual rules can be moved into SearXNG's real templates and theme assets.

## Elephant fixture

- `fixtures/elephants-page-source.txt` contains the captured results markup.
- `fixtures/elephants-readable.txt` contains the same page as readable text.

The capture includes regular links, thumbnails, an infobox, suggestions, video
and book results, engine metadata, category navigation, and pagination. Each
concept should render the same representative subset so comparisons are about
design rather than content.

## Concepts

- `01-familiar-flat` is a restrained Google/DDG-like results layout.
- `02-soft-surfaces` groups results and sidebar content into soft panels.
- `03-compact-focus` uses denser rows and stronger metadata hierarchy.
- `04-comfortable-compact` removes result numbering from concept 03 and uses
  larger type, subtle result cards, and plain Catppuccin surfaces.
- `05-ddg-results` borrows DuckDuckGo's single-column results, horizontal
  answer card, inline media packs, and bottom related searches.
- `tab-files` is a dedicated Files category concept for torrents, documents,
  datasets, and disk images with swarm health, file sizes, seeds, and magnet actions.
- `tab-social-media` is a dedicated Social Media category concept for microblogs,
  conversation threads, creator profiles, and engagement metrics across Mastodon,
  Bluesky, Reddit, and Lemmy.
- `tab-it` is a dedicated IT and developer category concept for repositories,
  code snippets with syntax highlighting, package registries with copyable install commands,
  and Stack Overflow Q&A entries with accepted answer badges.
- `tab-videos` is a dedicated Videos category concept referencing concept 05. It features
  16:9 responsive video cards, duration and quality badges, a spotlight documentary card,
  privacy embed player modal, duration/time/quality filters, and grid/list switching.
- `tab-map` is a dedicated Map category concept referencing concept 05. It features
  a dual-pane layout with scrollable place cards, ratings, opening status, and directions
  alongside an interactive Catppuccin vector map with numbered pins, popovers, and region presets.
- `tab-news` is a dedicated News category concept referencing concept 05. It features
  a breaking news hero cluster with lead story and companion cards, publisher badges with timestamps,
  topic filter pills, expandable multi-source coverage drawers, video news reports, and Catppuccin theme tokens.
- `tab-science` is a dedicated Science category concept referencing concept 05. It features
  academic paper results with DOI resolvers, peer-review and open access badges, direct PDF links,
  expandable abstracts, interactive citation modals (APA, Chicago, BibTeX), and journal metrics.
- `tab-music` is a dedicated Music category concept referencing concept 05. It features
  verified artist spotlight cards, playable track previews with waveforms, discography release grids,
  lyrics drawers, streaming service badges, and a persistent bottom playback bar.
- `06-refined` refines the search tabs based on design critique of concept 05 and
  the initial tab concepts. It keeps the 05-ddg visual language, Catppuccin palette,
  and shared header while reducing oversized featured sections, badges, and repeated actions.
  It models realistic SearXNG fields, handles missing metadata cleanly, keeps categories
  accessible on mobile with horizontal scrolling, and covers General, Videos, News, Map,
  Music, IT, Science, Files, and Social Media.

Open `index.html` to compare the concepts. Each page includes Latte and Mocha
themes and adapts to desktop and mobile widths.
