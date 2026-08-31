# ACSES Codebase Architecture Updates

This document summarizes the recent architectural and stylistic changes made to the codebase.

## 1. Global Navigation & Assets
- **Logo Replacement**: The text-based "ACSES" brand in the header and footer has been replaced with the official `logo.png`. Both logos are now clickable links pointing to `index.html`.
- **Footer Updates**: The official contact numbers have been injected into the footer under the "Get involved" section. They are wrapped in `href="tel:..."` tags, making them directly clickable on mobile devices.

## 2. Members Page Overhaul (`members.html`)
- **Static Grid Transition**: The members grid has transitioned from a dynamically generated JavaScript layout (`renderGrid()`) to a static HTML structure using the `.holo-team-grid` class.
- **Holographic Cards**: A new 3D holographic UI (`.holo-card`) replaces the old flip-cards.
- **Responsive Design**: The grid utilizes modern CSS Grid (`grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))`) to natively adapt to all screen sizes, from mobile phones to 4K projectors, without relying heavily on rigid media breakpoints.

## 3. JavaScript Animations (`page-members.js`)
- **Scroll Detection Engine**: Since hovering is not feasible on touch devices, a new JavaScript engine (`initPopOutAnimations()`) tracks scroll positioning in real-time. It detects when a row of cards enters the vertical center of the viewport and automatically triggers the `.pop-active` class.
- **Syntax**: `renderGrid()` logic has been safely block-commented out (`/* renderGrid(); */`) to prevent syntax errors while retaining legacy code for reference.

## 4. CSS Modifications (`style.css`)
- **Animation Scaling**: The hover and pop-out animations for `.holo-avatar-box img` have been significantly scaled up (up to `scale(1.5)` on hover and `scale(1.4)` on scroll).
- **Subtle Theming**: The "Read our story ->" ghost button on the homepage was given a subtle opacity background and sharper border to increase visibility while preserving the dark theme.

## 5. Global Data Synchronization
- **Centralized Stats**: To ensure numbers are perfectly synced across all pages (Home, About, Members), global stats (e.g., Total Members: "TBA", Core Members: "20") are exclusively managed in `data.js` via the `PORTAL_HOME.stats` and `ABOUT.stats` arrays.
- **Member Page Logic**: `page-members.js` no longer counts HTML cards. Instead, it reads directly from `data.js` so its headers never conflict with the Home page.

## 6. Dynamic Home Page Core Team Preview
- **Live Sync Engine**: `index.html` now features a Core Team preview section that is 100% dynamic. The JavaScript in `page-home.js` uses `fetch()` and `DOMParser` to silently read `members.html` in the background, extract the President and Vice President cards, and inject them into the Home page.
- **Offline Fallback**: Since `fetch()` fails when the site is opened offline via the `file:///` protocol (due to CORS), `page-home.js` includes a robust `try/catch` fallback block. If it detects an offline load, it instantly injects hardcoded backup cards so the section is never blank. Testing the dynamic sync requires a local web server (e.g., `python3 -m http.server 8000`).


## 7. Search Engine Optimization (SEO) & Metadata
- **CRITICAL WARNING TO TECH TEAM**: Do **NOT** remove or modify the `<meta name="keywords">`, `<meta name="description">`, or `<meta property="og:...">` tags located in the `<head>` of all HTML files.
- **Why?** These tags were meticulously engineered to capture search traffic for the club, including competitor keywords (CodeChef DKTE), all core member names, and exact event names. 
- **Open Graph (og:) Tags**: These control how the website looks when the link is pasted into WhatsApp, Discord, or LinkedIn. Removing them will break the link previews and the custom dark-theme tint on mobile browsers.
- **Favicon**: The square icon (`favicon.png`) is explicitly linked. Do not replace it with the wide rectangle `logo.png` or Google will reject the search icon.

- **Sitemap & Robots (DO NOT DELETE)**: The files `sitemap.xml` and `robots.txt` located in the root directory were automatically generated for Google Search Console. They map out the entire site architecture specifically for `acses-dkte.vercel.app`. Deleting them will cause Google's web crawlers to get lost and your search ranking will plummet. If you add new pages to the website, you MUST update `sitemap.xml` manually.

## 8. UX Enhancements & Image Property Management
- **Member Image Cropping**: The images in the `.holo-avatar-box img` (`members.html`) are set with `object-fit: cover`. Because the original source photos have vastly different aspect ratios and face alignments, they use inline `object-position` rules to manually crop them perfectly within the circle. 
  - *Example*: `<img src="..." style="object-position: center 5%;">`
  - *Important*: If you upload a new photo for a member, you MUST inspect the live site and tweak the `object-position` inline style (e.g., `top`, `center 20%`, etc.) until their face is centered in the circle. Do not try to standardise the CSS class to a single position, as it will decapitate some photos.
- **Social Icon Display**: In `style.css`, the `.social-bar a` elements use an attribute selector (`a[href="#"], a[href=""] { display: none; }`). This ensures that if a member does not provide a specific social link (like GitHub or Instagram), the icon dynamically hides itself without needing JavaScript logic.
- **Mobile Menu Scrim**: The dark background overlay (`.drawer-scrim`) behind the mobile menu is clickable and bound in `common.js` to automatically close the menu, preventing users from getting trapped if they miss the "X" button.
- **Lazy Loading**: `loading="lazy"` has been applied to all dynamically injected images (`page-home.js`) and all avatar images (`members.html`). This is critical for performance—never remove this attribute when adding new member cards, otherwise mobile users will suffer from massive initial data payloads.
- **Accessibility (a11y)**: The navigation drawer respects the `Escape` key (`keydown` listener in `common.js`) and gracefully auto-closes if the window is resized beyond `900px`, preventing viewport lock bugs on tablets.
