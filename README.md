# Retal Mohammed | Business Specialist

A responsive, interactive CV and portfolio website for Retal Mohammed. It is a self-contained static website designed to open directly in a modern browser, with no server, build step, account, API key, or network dependency.

## What is included

- English-only, left-to-right portfolio layout.
- A dark navy and blue visual system with dark mode enabled by default.
- A visible light/dark mode control. The selected mode is remembered in the current browser with `localStorage`.
- Clear card-based sections for the professional profile, skills, expandable experience timeline, education, certifications, portfolio, languages, and a privacy-safe contact placeholder.
- Gentle scroll reveal effects, active navigation feedback, interactive cards, and an accessible expandable experience timeline.
- A responsive layout for phones, tablets, and desktop screens.
- Respect for reduced-motion preferences: motion is removed when the browser requests less motion.

## Run locally

1. Open `index.html` by double-clicking it.
2. The site runs directly from the file with built-in example content.
3. Use the header control to switch between dark and light modes.
4. Select **Load example** to restore the built-in portfolio data in the current browser.

No internet connection or installation is required.

## Content and privacy

The public portfolio content is defined in `sample-data/data.js`. It contains only verified professional information. Phone numbers, email addresses, and other private contact details are deliberately excluded.

The contact form is intentionally disabled. Sending a message would require a secure backend or an explicitly approved public contact route.

Theme selection and the Load example state are stored only in the browser through `localStorage`. Nothing entered or viewed by the site is transmitted to a server.

## Accessibility

- Semantic landmarks, meaningful headings, and a skip link.
- Keyboard-operable navigation, cards, controls, and experience timeline.
- Visible focus states and text contrast in both themes.
- Responsive layout that supports zoom and small screens.
- Reduced-motion support through `prefers-reduced-motion`.

## Project files

- `index.html` — page structure and accessible controls.
- `styles.css` — blue-only visual system, dark/light themes, responsive layout, and motion styles.
- `script.js` — safe rendering, theme persistence, scroll behavior, reveal effects, and timeline interaction.
- `sample-data/data.js` — built-in verified public-safe portfolio data.

Built with Claude Code during the KKU Claude Code hackathon.
