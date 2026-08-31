# ACSES DKTE — Website (multi-page)

A dark, interactive, computer-science-engineering-themed site, now split
into six pages so each part of ACSES gets its own focused design and its
own 3D moment. Plain HTML/CSS/JS — no build tools, no npm install.

## Pages

| Page | File | Signature feature |
|---|---|---|
| Home | `index.html` | Draggable 3D circuit-sphere hero, news ticker, testimonial carousel, teasers for every other page |
| About | `about.html` | 3D "knowledge graph" header, full story, milestone timeline, achievement counters, partner strip |
| Events | `events.html` | 3D header + status tabs (All / Upcoming / Past) and category filter chips |
| Gallery | `gallery.html` | Draggable 3D coverflow ring of highlight photos + filterable full photo archive with a keyboard-navigable lightbox |
| Members | `members.html` | 3D header + live search, department filter, and flip cards (hover on desktop, tap on mobile) |
| Contact | `contact.html` | 3D header, contact info/socials, contact form, and an FAQ accordion |

Every page shares the same header/footer, mobile menu, cursor, and scroll
effects, so navigating between them feels like one site — not six
different templates stitched together.

## Files

- `index.html`, `about.html`, `events.html`, `gallery.html`, `members.html`, `contact.html` — the six pages
- `style.css` — all styling (colors, layout, animations) for every page
- `data.js` — **all editable content lives here** (see below)
- `common.js` — shared behavior used on every page: nav + mobile menu, custom cursor, tilt/spotlight cards, scroll reveals, page loader, back-to-top button, footer socials
- `scene3d.js` — the draggable/zoomable 3D circuit-sphere in the Home hero
- `scene-network.js` — the reusable 3D "knowledge graph" background used in the page-header banner on About / Events / Members / Contact (each page tints it differently via a `data-accent` attribute: blue, circuit, or amber)
- `page-home.js`, `page-about.js`, `page-events.js`, `page-gallery.js`, `page-members.js`, `page-contact.js` — the render logic specific to each page (reads from `data.js`, builds the HTML for that page's dynamic sections)

## How to edit your info

Open `data.js` in any text editor. Everything on the site — hero stats,
about text, history timeline, achievements, benefits, events, the photo
gallery, testimonials, FAQs, the member roster, partners, and contact
details — is defined there as plain JavaScript objects/arrays. Change the
text, save, and refresh any page in your browser to see the update.

**To add/remove/edit a member:**
```js
const MEMBERS = [
  { name: "Your Name", position: "Your Role", github: "yourgithubusername", dept: "Technical", bio: "One sentence about what you do." },
  // dept must be one of: Leadership, Technical, Design, Events
];
```

**To add a past-event photo to the Gallery:**
```js
const GALLERY = [
  { title: "Caption for the tile", event: "Event name", category: "Hackathon", year: "2026", tone: "blue" },
  // tone is "blue", "circuit", or "amber" — controls the generated placeholder color
];
```
No real photo files ship with the template — each gallery tile is a
generated color tile with a caption so the page works instantly. To use
real photos: add an `img` field pointing at a file (e.g. `assets/gallery/photo1.jpg`),
drop your images in an `assets/gallery/` folder next to `index.html`, and
swap the placeholder `<div class="photo-tile ...">` markup in
`page-gallery.js`'s `photoTileHTML()` function for an `<img>` tag when
`g.img` is set.

**To add/remove an event:** edit the `EVENTS` array — `status` must be
`"upcoming"` or `"past"`, and `category` can be anything (it becomes a
filter chip automatically on the Events page).

**To add an FAQ:** add a `{ q: "...", a: "..." }` object to the `FAQS`
array — it renders as a new accordion item automatically.

## Preview locally

Because the pages load `data.js`, `common.js`, etc. via `<script src>`,
some browsers restrict `fetch`/module loading from `file://` — but plain
`<script>` tags like these work fine by just double-clicking any `.html`
file. If you ever add real image files or run into browser restrictions,
serve the folder with any static server, e.g.:

```
npx serve .
# or
python3 -m http.server 8080
```

(If fonts don't load, make sure you have an internet connection since
they're pulled from Google Fonts, and the 3D scenes need Three.js from
the CDN link in each page's `<head>`.)

## Deploy to Vercel (to replace acses-dkte.vercel.app)

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → import that repo
3. Framework preset: **Other** (it's static HTML, no build command needed)
4. Deploy

Or drag-and-drop the folder straight into the Vercel dashboard's
"Deploy" upload area for an instant deploy. Because there are now
multiple `.html` files, make sure your host serves `about.html`,
`events.html`, etc. directly (Vercel does this automatically for static
folders — no extra config needed).

## Customizing the look

Colors are defined as CSS variables at the top of `style.css`:

```css
--blue: #4C8DFF;     /* primary accent */
--circuit: #4CFFB2;  /* secondary accent */
--amber: #FFB238;    /* highlight orb */
```

Change these to shift the whole palette — every page and every 3D scene
reads from the same variables, so the whole site restyles together.

## Adding more 3D or pages later

- To give another page its own 3D header like About/Events/Members/Contact, add `<canvas class="page-header-canvas" data-scene="network" data-accent="blue"></canvas>` inside a `<header class="page-header">`, and include `scene-network.js` before `common.js` on that page.
- To add a brand-new page, copy the header/footer/nav markup from any existing page (they're identical everywhere on purpose), give the `<nav-link>`/drawer entries a `data-page="yourpage.html"`, and add a `page-yourpage.js` for its dynamic content.
