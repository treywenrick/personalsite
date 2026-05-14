# Website Handoff

Project path: `/Users/treywenrick/Documents/New project`

## Current Site Structure

This portfolio was refactored from a single-page site into a multi-page static site:

- `index.html`
- `experience.html`
- `projects.html`
- `travel.html`
- `premier-league.html`
- `cool-things.html`
- `contact.html`

Shared assets and logic:

- `style.css` for shared styling across all pages
- `script.js` for dark mode, reveal animations, travel globe, and Premier League table loading
- `server.py` for local preview and backend proxy routes
- `assets/travel/` for local travel images

## Navigation

The top header nav now links page-to-page instead of section anchors.

The current page is indicated using `aria-current="page"` in the nav links.

## Travel Page

File: `travel.html`

Implemented:

- Interactive drag-to-rotate globe
- Country outlines rendered with D3 + TopoJSON
- Marker labels visible directly on the globe
- Click a location label to populate the left-side travel panel
- Local image assets and personal blurbs for:
  - Berkeley
  - Miami
  - Seville
  - Rome
  - Peru

Relevant files:

- `travel.html`
- `script.js`
- `style.css`
- `assets/travel/`

Travel images currently used:

- `assets/travel/berkeley.jpeg`
- `assets/travel/miami.jpeg`
- `assets/travel/seville.jpeg`
- `assets/travel/rome.jpeg`
- `assets/travel/peru.jpeg`

## Premier League Page

File: `premier-league.html`

Implemented:

- Dedicated page for live Premier League standings
- Frontend fetches from local route: `/api/premier-league`
- `server.py` proxies standings data from TheSportsDB
- Data-source bubble sits below the table

Important note:

- SportMonks token was tested, but the current plan did not expose the league/standings endpoint needed for the full table.
- The working implementation now uses TheSportsDB through `server.py`.

## Local Preview

Use the local Python server instead of a plain static server:

```bash
python3 server.py
```

Then open:

```text
http://127.0.0.1:4173
```

Why this matters:

- The Premier League page depends on the backend proxy route in `server.py`
- A plain `python3 -m http.server` will not provide `/api/premier-league`

## Dark Mode

Dark mode is shared across pages and stored in `localStorage`.

Relevant file:

- `script.js`

## Likely Next Tasks

Good next improvements if continuing:

- Add more page-specific intros so each page feels more distinct
- Polish the Premier League table with highlighted zones or favorite club emphasis
- Add more travel markers and custom blurbs/photos
- Add better active nav styling or breadcrumbs
- Add deployment prep for a static host plus a lightweight backend/proxy story

## Suggested Prompt For Next Chat

```text
Continue working on my personal website in /Users/treywenrick/Documents/New project.
Read handoff.md first.
Use the existing multi-page setup, shared style.css/script.js, travel globe, and Premier League proxy in server.py.
```
