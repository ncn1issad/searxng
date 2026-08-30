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

Open `index.html` to compare the concepts. Each page includes Latte and Mocha
themes and adapts to desktop and mobile widths.
