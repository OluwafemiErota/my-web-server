require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name || 'Guest';
  let clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Handling IPv6 localhost
  if (clientIp === '::1') clientIp = '127.0.0.1';

  try {
    // Use IP geolocation API to get location
    const geoResponse = await axios.get(`https://ipapi.co/${clientIp}/json/`);
    const location = geoResponse.data.city || 'Unknown';

    // Use weather API to get temperature (Using the environment variable for the API key)
    const weatherApiKey = process.env.WEATHER_API_KEY;
    if (!weatherApiKey) {
      throw new Error('Weather API key is not set');
    }

    const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${weatherApiKey}`);
    const temperature = weatherResponse.data.main.temp;

    res.json({
      client_ip: clientIp,
      location: location,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${location}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching data');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
