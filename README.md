# Find Anime Character

Find Anime Character is a responsive front-end web app that searches anime characters with the Jikan API and presents them in a clean card layout.

## Features

* Search anime characters by name
* `Enter` key support
* Debounced search input with a 300ms delay
* Sort results from A-Z or Z-A
* Filter current results by name
* Loading spinner, empty state, and no-results state
* Dark/light mode toggle
* Favorites saved in `localStorage`
* Responsive design for mobile, tablet, and desktop

## API

The app uses the Jikan API:

`https://api.jikan.moe/v4/characters?q={name}`

## Tech Stack

* HTML
* CSS
* JavaScript (ES6)
* Fetch API

## Project Structure

* `index.html` - structure and UI markup
* `style.css` - styling, layout, and theming
* `script.js` - API calls, rendering, sorting, filtering, debounce, and favorites
* `README.md` - project notes

## Run Locally

1. Open the project folder.
2. Open `index.html` in your browser.
3. Search for a character like `Naruto`, `Luffy`, or `Mikasa`.

## Notes

* Theme choice and favorites are stored in the browser with `localStorage`.
* If the Jikan API rate-limits requests, wait a moment and try again.
