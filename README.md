# Find Anime Character

## Project Overview

**Find Anime Character** is a web application that allows users to search and explore anime characters in real-time. The application fetches data from a public API and displays detailed information about characters such as their name, anime, image, and description.

The project demonstrates the use of JavaScript, API integration, and dynamic UI rendering along with interactive features like search, filtering, and sorting.

---

## Features

### Search Functionality

* Users can search for anime characters by name
* Real-time results using API calls

### Filtering

* Filter characters based on anime series or category

### Sorting

* Sort characters alphabetically (A–Z / Z–A)
* Sort based on popularity (if supported by API)

### Favorites (Optional)

* Save favorite characters using localStorage

### Dark / Light Mode (Optional)

* Toggle between themes for better user experience

---

## API Used

This project uses a public anime API to fetch character data:

Jikan API (MyAnimeList API)
https://docs.api.jikan.moe/

---

## Technologies Used

* HTML5
* CSS3 (or Tailwind / Bootstrap)
* JavaScript (ES6+)
* Fetch API
* Array Higher-Order Functions:

  * map()
  * filter()
  * sort()
  * find()

---

## How It Works

1. User enters a character name in the search bar
2. The app sends a request to the API using fetch
3. Data is received and processed
4. Characters are displayed dynamically on the UI
5. Users can filter, sort, and interact with results

---

## Project Structure

```
Find-Anime-Character
│── index.html
│── style.css
│── script.js
│── README.md
```

---

## Responsiveness

The application is fully responsive and works on:

* Mobile devices
* Tablets
* Desktop

---

## Bonus Features (if implemented)

* Debounced search input
* Loading spinner while fetching data
* Pagination or infinite scroll
* Local storage for favorites

---

## Future Improvements

* Add voice search
* Show character voice actors
* Add anime recommendations based on character
* Improve UI animations

---

## Setup Instructions

1. Clone the repository:
   git clone <your-repo-link>

2. Open the project folder:
   cd Find-Anime-Character

3. Open index.html in your browser

---

