# SkyCast

SkyCast is a simple weather application built with Vanilla JavaScript, HTML, and CSS. Users can search for a city and immediately view current weather data fetched from a public API. The app emphasizes a clean user interface for quick and easy weather checks.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Concepts](#concepts)
- [API Configuration](#api-configuration)
- [Further Application](#further-application)
- [Potential Features](#potential-features)
- [Installation](#installation)
- [Usage](#usage)

---

## Overview

SkyCast provides a straightforward way to check the current weather for any city. Built using only HTML, CSS, and Vanilla JavaScript, the project highlights API consumption, DOM manipulation, and responsive design.

---

## Features

- **City Search:** Enter a city name to view current weather conditions.
- **Real-Time Data:** Fetches weather information instantly via an external API.
- **Responsive UI:** Clean and minimal design optimized for all devices.

---

## Tech Stack

- **HTML:** Basic page structure and layout.
- **CSS:** Responsive styling with a minimal yet engaging design.
- **Vanilla JavaScript:** API calls, asynchronous operations, and DOM updates.

---

## Concepts

- **Fetch & Async Operations:** Handling API requests and processing JSON responses.
- **DOM Manipulation:** Dynamically updating the UI based on user input.
- **User Input Validation:** Ensuring valid city names and graceful error handling.
- **Responsive Design:** Creating a seamless experience across devices.

---

## API Configuration

To fetch weather data, SkyCast relies on the [OpenWeatherMap API](https://openweathermap.org/). You must obtain an API key by creating an account on their website. Once you have your API key:

1. Create a file named `config.js` in the project directory.
2. Add the following line to `config.js`:

   ```javascript
   const API_key = "YOUR API KEY";
   ```

3. Replace `'YOUR API KEY'` with the actual API key provided by OpenWeatherMap.

---

## Further Application

SkyCast can be integrated into a larger dashboard or embedded as a widget in another project. It also serves as a foundation for exploring more advanced API consumption patterns and data caching techniques.

---

## Potential Features

- **Extended Forecast:** Display a multi-day weather forecast.
- **Geolocation:** Auto-detect the user’s location on page load (with permission).
- **Unit Conversion:** Toggle between Celsius and Fahrenheit.
- **UI Enhancements:** Incorporate weather icons, dynamic backgrounds, or smooth animations.

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/SkyCast.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd SkyCast
   ```
3. **Configure your API key:**  
   Follow the steps in the [API Configuration](#api-configuration) section.
4. **Run the application:**  
   Open the `index.html` file in your preferred browser.

---

## Usage

Simply open the `index.html` in your browser, enter a city name in the search bar, and view the current weather information. Make sure that the `config.js` file is properly set up with your OpenWeatherMap API key for the app to function correctly.
