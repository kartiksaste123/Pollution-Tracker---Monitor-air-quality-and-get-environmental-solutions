import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Container, Row, Col, Card, Table, Spinner, Carousel, Alert } from 'react-bootstrap';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getEnvironmentalSolutions } from './utils/geminiAI';
import { getCityImages } from './utils/imageAPI';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_TOKEN = '8d00d4b1272f3b1177d7f5dc2c1db3699cd55375';

// Map click handler component
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [environmentalTips, setEnvironmentalTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSolutions, setLoadingSolutions] = useState(false);
  const [cityImages, setCityImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [error, setError] = useState(null);

  const getAQIColor = (aqi) => {
    if (aqi <= 30) return '#00FF00'; // Good - Dark Green
    if (aqi <= 60) return '#90EE90'; // Satisfactory - Light Green
    if (aqi <= 90) return '#FFFF00'; // Moderate - Yellow
    if (aqi <= 120) return '#FFA500'; // Poor - Orange
    if (aqi <= 250) return '#FF0000'; // Very Poor - Red
    return '#800000'; // Severe - Dark Red
  };

  const getAQIStatus = (aqi) => {
    if (aqi <= 30) return 'Good';
    if (aqi <= 60) return 'Satisfactory';
    if (aqi <= 90) return 'Moderate';
    if (aqi <= 120) return 'Poor';
    if (aqi <= 250) return 'Very Poor';
    return 'Severe';
  };

  const handleLocationSelect = async (lat, lng) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch air quality data
      const aqResponse = await axios.get(
        `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${API_TOKEN}`
      );

      if (!aqResponse.data || aqResponse.data.status !== 'ok') {
        throw new Error('Unable to fetch air quality data');
      }

      // Fetch location name using reverse geocoding
      const geoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );

      const locationData = {
        name: geoResponse.data.display_name.split(',')[0],
        lat,
        lng,
        aqi: aqResponse.data.data.aqi,
        iaqi: aqResponse.data.data.iaqi,
        time: aqResponse.data.data.time,
        weather: {
          main: {
            temp: 'N/A',
            feels_like: 'N/A',
            humidity: 'N/A'
          },
          wind: {
            speed: 'N/A'
          },
          weather: [{
            description: 'Weather data unavailable'
          }]
        }
      };

      // Try to fetch weather data if available
      try {
        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=7fa076f39929bdd82720b9fd6a770262&units=metric`
        );
        locationData.weather = weatherResponse.data;
      } catch (weatherError) {
        console.log('Weather data unavailable:', weatherError);
      }

      setSelectedLocation(locationData);
      fetchEnvironmentalSolutions(locationData);
      fetchCityImages(locationData.name, locationData.aqi);
    } catch (error) {
      console.error('Error fetching location data:', error);
      setError('Unable to fetch data for this location. Please try another location.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnvironmentalSolutions = async (location) => {
    setLoadingSolutions(true);
    try {
      const locationData = {
        name: location.name,
        aqi: location.aqi,
        status: getAQIStatus(location.aqi),
        iaqi: location.iaqi,
        weather: location.weather
      };
      
      const solutions = await getEnvironmentalSolutions(locationData);
      setEnvironmentalTips(solutions);
    } catch (error) {
      console.error('Error fetching environmental solutions:', error);
      setEnvironmentalTips([
        "• Use masks when going outside",
        "• Keep windows closed during high pollution hours",
        "• Use air purifiers indoors",
        "• Avoid outdoor exercise when AQI is high",
        "• Consider carpooling or public transport"
      ]);
    } finally {
      setLoadingSolutions(false);
    }
  };

  const fetchCityImages = async (locationName, aqi) => {
    setLoadingImages(true);
    try {
      const images = await getCityImages(locationName, aqi);
      setCityImages(images);
    } catch (error) {
      console.error('Error fetching location images:', error);
      setCityImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const renderEnvironmentalTip = (tip) => {
    if (tip.startsWith('<h6')) {
      return <div dangerouslySetInnerHTML={{ __html: tip }} />;
    }
    return <li className="mb-2">{tip}</li>;
  };

  return (
    <Container fluid className="app-container">
      <Row className="header-section mb-4">
        <Col>
          <h1 className="text-center mt-4">India Pollution & Weather Tracker</h1>
          <p className="text-center">Click anywhere on the map to view real-time air quality and weather information</p>
          <p className="text-center text-muted small">Note: Weather information may be limited without an API key</p>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="main-content">
        <Col lg={8} className="mb-4">
          <Card className="map-card h-100">
            <Card.Body className="p-0">
              <div className="map-container" style={{ height: '600px' }}>
                <MapContainer
                  center={[23.5937, 78.9629]}
                  zoom={5}
                  style={{ height: '100%', width: '100%' }}
                  maxBounds={[[8.4, 68.7], [37.6, 97.25]]}
                  minZoom={4}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapClickHandler onLocationSelect={handleLocationSelect} />
                  {selectedLocation && (
                    <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                      <Popup>
                        {selectedLocation.name}<br />
                        AQI: {selectedLocation.aqi}
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </Card.Body>
          </Card>

          {selectedLocation && cityImages.length > 0 && (
            <Card className="mt-4">
              <Card.Header>
                <h4 className="mb-0">Location Images</h4>
              </Card.Header>
              <Card.Body>
                <Carousel
                  activeIndex={activeImageIndex}
                  onSelect={setActiveImageIndex}
                  className="mt-3"
                >
                  {cityImages.map((image, index) => (
                    <Carousel.Item key={index}>
                      <div style={{ position: 'relative', height: '400px' }}>
                        <img
                          className="d-block w-100"
                          src={image.url}
                          alt={`${selectedLocation.name} - Image ${index + 1}`}
                          style={{ 
                            height: '100%', 
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                        <div 
                          style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '20px',
                            right: '20px',
                            background: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            padding: '10px',
                            borderRadius: '4px'
                          }}
                        >
                          <p className="mb-0">{image.description}</p>
                          <small>Photo by {image.photographer}</small>
                        </div>
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4} className="mb-4">
          {loading ? (
            <Card className="h-100">
              <Card.Body className="d-flex align-items-center justify-content-center">
                <div className="text-center">
                  <Spinner animation="border" role="status" />
                  <p className="mt-2">Loading location data...</p>
                </div>
              </Card.Body>
            </Card>
          ) : selectedLocation ? (
            <Card className="info-card h-100">
              <Card.Header style={{ backgroundColor: getAQIColor(selectedLocation.aqi), color: selectedLocation.aqi > 60 ? 'white' : 'black' }}>
                <h3>{selectedLocation.name}</h3>
              </Card.Header>
              <Card.Body>
                <h4>Air Quality Index: {selectedLocation.aqi} µg/m³</h4>
                <p>Status: {getAQIStatus(selectedLocation.aqi)}</p>

                <h5 className="mt-4">Weather Information:</h5>
                <Table striped bordered hover size="sm">
                  <tbody>
                    <tr>
                      <td>Temperature</td>
                      <td>{selectedLocation.weather.main.temp}°C</td>
                    </tr>
                    <tr>
                      <td>Feels Like</td>
                      <td>{selectedLocation.weather.main.feels_like}°C</td>
                    </tr>
                    <tr>
                      <td>Humidity</td>
                      <td>{selectedLocation.weather.main.humidity}%</td>
                    </tr>
                    <tr>
                      <td>Wind Speed</td>
                      <td>{selectedLocation.weather.wind.speed} m/s</td>
                    </tr>
                    <tr>
                      <td>Weather</td>
                      <td>{selectedLocation.weather.weather[0].description}</td>
                    </tr>
                  </tbody>
                </Table>
                
                <h5 className="mt-4">Pollutant Details:</h5>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Pollutant</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLocation.iaqi && Object.entries(selectedLocation.iaqi).map(([key, value]) => (
                      <tr key={key}>
                        <td>{key.toUpperCase()}</td>
                        <td>{value.v}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <h5 className="mt-4">AI-Powered Environmental Solutions:</h5>
                {loadingSolutions ? (
                  <div className="text-center">
                    <Spinner animation="border" size="sm" />
                    <p>Generating solutions...</p>
                  </div>
                ) : (
                  <div className="solutions-container">
                    <ul className="custom-bullets">
                      {environmentalTips.map((tip, index) => (
                        <React.Fragment key={index}>
                          {renderEnvironmentalTip(tip)}
                        </React.Fragment>
                      ))}
                    </ul>
                  </div>
                )}
              </Card.Body>
            </Card>
          ) : (
            <Card className="h-100">
              <Card.Body className="d-flex align-items-center justify-content-center">
                <div className="text-center">
                  <p>Click anywhere on the map to view location information</p>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default App;