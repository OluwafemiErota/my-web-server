require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the API. Use /api/hello?visitor_name= to get a personalized greeting.');
});

app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name || 'Guest';
  let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Handling IPv6 localhost
  if (clientIp === '::1') clientIp = '127.0.0.1';

  try {
    // Use IP geolocation API to get location
    console.log(`Fetching location for IP: ${clientIp}`);
    const geoResponse = await axios.get(`https://ipapi.co/${clientIp}/json/`);
    console.log(`GeoResponse: ${JSON.stringify(geoResponse.data)}`);
    
    const location = geoResponse.data.city || 'Unknown';

    // Use weather API to get temperature (Using the environment variable for the API key)
    const weatherApiKey = process.env.WEATHER_API_KEY;
    if (!weatherApiKey) {
      throw new Error('Weather API key is not set');
    }

    console.log(`Fetching weather for location: ${location}`);
    const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${weatherApiKey}`);
    console.log(`WeatherResponse: ${JSON.stringify(weatherResponse.data)}`);
    
    const temperature = weatherResponse.data.main.temp;

    res.json({
      client_ip: clientIp,
      location: location,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${location}`
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({
      response: {},
      remark: "Invalid API Endpoint",
      score: 0
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
