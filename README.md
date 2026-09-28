# CV Identity

**Your CV is not just a document. It is your professional identity.**

CV Identity is a bilingual, local-first professional presentation product. The same verified profile powers two useful outcomes:

- An interactive English and Arabic portfolio website.
- A professional downloadable CV PDF.

**Build once. Present everywhere.**

## Why this is different

A normal portfolio often makes visitors scan a static page. CV Identity treats professional information as a reusable, accessible product: browse it online, switch between English and Arabic with true LTR/RTL layout support, and download the same verified information as a CV.

The included profile demonstrates the product with Retal Mohammed's approved professional information. It does not publish a phone number, email address, private CV file, or unverified project claims.

## Features

- English and Arabic language switcher with saved browser preference.
- Genuine document direction changes: English uses LTR and Arabic uses RTL.
- Dark and light themes, with dark mode as the default and saved browser preference.
- Responsive editorial layout for phones, tablets, and desktop screens.
- Accessible expandable work-experience timeline, active navigation, keyboard focus, skip link, and reduced-motion support.
- A single locale-aware data source in `sample-data/data.js`.
- Local automatic PDF download using bundled jsPDF and an embedded Arabic-capable font.
- Native **Save as PDF** fallback through the browser print dialog.
- No server, database, API key, CDN, analytics, remote font, or runtime network request.

## Run locally

1. Double-click `index.html`.
2. Use **EN** or **العربية** to switch language.
3. Use the appearance control to switch themes.
4. Use **Download CV** for the generated PDF, or **Save as PDF** near Contact to open the print dialog.
5. Use **Reset profile** to restore the approved sample profile in the current browser.

The site supports direct `file://` opening. No installation or server is required.

## Data and privacy

All public profile content and interface text are stored in `sample-data/data.js` as `CV_IDENTITY_SEED` schema version 2. Every displayed professional field has approved English and Arabic text. Dates use structured values and are formatted for the selected language.

Do not add phone numbers, email addresses, home addresses, identification numbers, passwords, API keys, secrets, private CV files, or unverified professional claims. Project case-study fields are intentionally hidden unless real details are approved.

Browser preferences and the sample-state reset are stored only in `localStorage`. The site does not transmit data.

## Local PDF tooling

The PDF exporter uses local copies of:

- `assets/vendor/jspdf.umd.min.js` — jsPDF 2.5.1, MIT License.
- `assets/fonts/NotoSansArabic-Regular.ttf` and `assets/fonts/noto-sans-arabic.js` — Noto Sans Arabic, SIL Open Font License 1.1; see `assets/fonts/OFL.txt`.

The font data is loaded from a local script because direct `file://` pages cannot reliably fetch font data for PDF embedding. The generated PDF uses selectable text rather than a screenshot. If the automatic exporter cannot initialize, the app opens the browser print dialog so the user can choose **Save as PDF**.

## Accessibility and quality checks

- Semantically structured landmarks and logical heading order.
- Visible keyboard focus and touch controls at least 44px high.
- True LTR/RTL layout using logical CSS properties.
- Reduced-motion support.
- Print styles remove product controls and expose all experience details.
- Responsive design for small phones through wide desktop layouts.

## Key files

- `index.html` — product shell and accessible controls.
- `styles.css` — responsive LTR/RTL styles, themes, motion, and print layout.
- `script.js` — locale/theme persistence, safe content rendering, interactions, and accessibility.
- `pdf-export.js` — local selectable-text CV PDF export.
- `sample-data/data.js` — verified bilingual profile data and interface copy.

Built with Claude Code during the KKU Claude Code hackathon.
