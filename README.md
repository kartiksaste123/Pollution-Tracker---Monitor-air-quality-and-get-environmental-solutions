# India Pollution & Weather Tracker

## Overview

India Pollution & Weather Tracker is an interactive web application that visualizes real-time air quality and weather data for locations across India. Users can click anywhere on the map to view detailed environmental information, including AQI, weather conditions, pollutant details, and AI-powered recommendations for improving air quality.

## Features

- **Interactive Map**: Clickable map of India powered by Leaflet.js.
- **Real-Time Data**: Fetches live AQI and weather data using public APIs.
- **Environmental Solutions**: AI-generated, location-specific recommendations via Google Gemini API.
- **Image Gallery**: Dynamic image carousel of location, weather, and air quality using Pexels API.
- **Responsive UI**: Modern, mobile-friendly design with Bootstrap and custom CSS.
- **Error Handling**: User-friendly alerts for API/data issues.

## Technologies Used

- React (Frontend)
- Leaflet.js & react-leaflet (Map)
- Bootstrap & react-bootstrap (UI)
- Axios (HTTP requests)
- OpenWeatherMap API (Weather)
- World Air Quality Index API (AQI)
- Pexels API (Images)
- Google Gemini API (AI solutions)

## Project Structure

```
.
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── index.js
│   ├── index.css
│   └── utils/
│       ├── geminiAI.js
│       └── imageAPI.js
├── package.json
├── .gitignore
├── README.md
└── project_overview.md
```

## Setup & Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/india-pollution-tracker.git
   cd india-pollution-tracker
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Start the development server:**
   ```sh
   npm start
   ```
   The app will run at [http://localhost:3000](http://localhost:3000).

## API Keys

This project uses several APIs. The demo includes example keys in the code, but for production use, you should obtain your own keys and keep them secure.

- **OpenWeatherMap**: [https://openweathermap.org/api](https://openweathermap.org/api)
- **World Air Quality Index**: [https://aqicn.org/api/](https://aqicn.org/api/)
- **Pexels**: [https://www.pexels.com/api/](https://www.pexels.com/api/)
- **Google Gemini**: [https://ai.google.dev/](https://ai.google.dev/)

Update the keys in [`src/utils/geminiAI.js`](src/utils/geminiAI.js) and [`src/utils/imageAPI.js`](src/utils/imageAPI.js) as needed.

## Usage

- Click anywhere on the map of India to select a location.
- View real-time AQI, weather, and pollutant details.
- Browse location-specific images in the gallery.
- Read AI-powered environmental solutions and recommendations.

## File Descriptions

- [`src/App.js`](src/App.js): Main React component, handles map, data fetching, and UI rendering.
- [`src/utils/geminiAI.js`](src/utils/geminiAI.js): Fetches AI-generated environmental solutions from Gemini API.
- [`src/utils/imageAPI.js`](src/utils/imageAPI.js): Fetches images from Pexels API based on location and AQI.
- [`src/index.js`](src/index.js): Entry point for React app.
- [`src/index.css`](src/index.css): Custom styles for layout and components.
- [`public/index.html`](public/index.html): HTML template.
- [`project_overview.md`](project_overview.md): Detailed project overview and feature list.

## License

This project is for educational and demonstration purposes. Please check API terms of use before deploying publicly.

## Credits

- Map data: [OpenStreetMap](https://www.openstreetmap.org/)
- AQI data: [World Air Quality Index](https://aqicn.org/)
- Weather data: [OpenWeatherMap](https://openweathermap.org/)
- Images: [Pexels](https://www.pexels.com/)
- AI solutions: [Google Gemini](https://ai.google.dev/)

---

*For more details,
