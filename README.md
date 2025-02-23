# SkyCast

SkyCast is a modern weather application that provides real-time weather information, hourly forecasts, and weekly predictions for any location. Built with HTML, CSS, and JavaScript, it features a clean interface with location saving capabilities and smooth weather data visualization.

## Features

- **Current Weather**: Displays current temperature, weather conditions, and wind speed
- **Hourly Forecast**: Scrollable hourly weather predictions
- **Weekly Forecast**: Detailed 7-day weather outlook
- **Location Search**: Autocomplete search functionality for any location worldwide
- **Saved Locations**: Save and manage favorite locations with quick access
- **Responsive Design**: Adapts to various screen sizes
- **Smooth Animations**: Enhanced user experience with sliding hourly forecast

## Tech Stack

- **HTML5**: Structure and content
- **CSS3**: Styling with custom properties and responsive design
- **JavaScript**: Dynamic functionality and API integration
- **APIs**:
  - Open-Meteo: Weather data
  - Nominatim (OpenStreetMap): Location search
  - BigDataCloud: Reverse geocoding

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/skycast.git
```

2. Navigate to the project directory:
```bash
cd skycast
```

3. Open `index.html` in a web browser or serve it using a local server:


## Usage

- **Search Locations**: Type in the search bar to find and select any location
- **View Weather**: Current conditions, hourly slider, and weekly forecast update automatically
- **Save Locations**: Click the "+" button to save the current location
- **Remove Locations**: Click the "X" button on saved location cards to remove them
- **Navigate Hourly Forecast**: Use the arrow buttons to scroll through hourly predictions

## File Structure

```
skycast/
├── index.html        # Main HTML structure
├── styles.css       # All styling
├── main.js          # Core functionality and API handling
├── slider.js        # Hourly slider functionality
├── images/          # Background images
│   └── horizontalBackground.jpg
├── icons/          # Icon assets
│   └── file.svg
└── README.md       # This file
```

## Dependencies

No external libraries are required. The project uses vanilla JavaScript and relies on browser APIs (geolocation) and external weather/location APIs.

## APIs Used

- **Open-Meteo**: Provides weather data (https://open-meteo.com/)
- **Nominatim**: Location search functionality (https://nominatim.org/)
- **BigDataCloud**: Reverse geocoding (https://www.bigdatacloud.com/)

## Customization

- **Colors**: Modify CSS variables in `:root` of `styles.css`
- **Fonts**: Adjust font imports and variables in `styles.css`
- **Layout**: Update CSS media queries for different breakpoints
- **Weather Units**: Modify API calls in `main.js` to change temperature/wind units

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

© 2025 SkyCast. Designed by Jacob Smith. This project is open-source and available under the [MIT License](LICENSE).

## Acknowledgments

- Weather data provided by Open-Meteo
- Location services by Nominatim and BigDataCloud
- Fonts from Google Fonts
