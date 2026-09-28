# Sample portfolio data

`data.js` contains the built-in public-safe portfolio data used by the website.

It is a JavaScript file instead of JSON because the website must work when `index.html` is opened directly from a browser. Browsers do not reliably allow a page opened from `file://` to fetch a local JSON file, while a local script tag works without a server.

The data includes:

- Display name and professional title
- Professional summary and location
- Skills
- Work experience
- Education
- Certifications and professional courses
- Languages
- Portfolio project cards
- A privacy-safe contact note

Do not add phone numbers, email addresses, home addresses, identification numbers, passwords, API keys, or any other private contact information to this file. Only add professional details that are verified and approved for public display.
