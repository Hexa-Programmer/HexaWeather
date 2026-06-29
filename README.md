# HexaWeather

View HexaWeather at: https://hexa-programmer.github.io/HexaWeather/
HexaWeather is a minimal, web application built using HTML, CSS, and JavaScript.  
It fetches live weather data from the Open-Meteo API and runs entirely in the browser with no backend.
![HexaWeather Gameplay](showcase.png)

---

## Features

    1) City Search: Search for weather information for cities around the world.

    2) Live Weather: Displays current temperature and weather conditions.

    3) 5-Day Forecast: View daily high and low temperatures for the coming week.

    4) Recent Searches: Stores recently searched cities using localStorage for quick access.

    5) Dynamic Theme: Automatically switches between day and night themes based on local time.

---

## How it works

When a city is searched:

    1) The Open-Meteo Geocoding API converts the city name into latitude and longitude.

    2) The Open-Meteo Forecast API retrieves current weather and forecast data.

Recent searches are stored locally using:

    localStorage

This allows quick access to previously searched cities without any backend.

---

## Tech Stack

    - HTML5
    - CSS3
    - Vanilla JavaScript (no frameworks)
    - Open-Meteo API

---

## Installation

To run HexaWeather locally:

    git clone https://github.com/Hexa-Programmer/HexaWeather.git
    cd HexaWeather
    open index.html

---

## Note

This is a personal learning project and will continue to evolve over time.

---

Made with ❤️ by Hexa-Programmer