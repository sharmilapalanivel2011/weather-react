import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const API_KEY = 'fe949b96200365f6e9ffcb6a8f64e09e';

// Animated Weather Icon Component
const WeatherIcon = ({ condition, size = 80 }) => {
  const icons = {
    Clear: (
      <div className="icon-sun" style={{ width: size, height: size }}>
        <div className="sun-core" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="sun-ray" style={{ transform: `rotate(${i * 45}deg)` }} />
        ))}
      </div>
    ),
    Clouds: (
      <div className="icon-cloud" style={{ width: size, height: size }}>
        <div className="cloud-body" />
        <div className="cloud-puff1" />
        <div className="cloud-puff2" />
      </div>
    ),
    Rain: (
      <div className="icon-rain" style={{ width: size, height: size }}>
        <div className="cloud-body rain-cloud" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="raindrop" style={{ left: `${15 + i * 14}%`, animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    ),
    Drizzle: (
      <div className="icon-rain" style={{ width: size, height: size }}>
        <div className="cloud-body rain-cloud" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="raindrop drizzle-drop" style={{ left: `${20 + i * 16}%`, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    ),
    Thunderstorm: (
      <div className="icon-thunder" style={{ width: size, height: size }}>
        <div className="cloud-body thunder-cloud" />
        <div className="lightning" />
      </div>
    ),
    Snow: (
      <div className="icon-snow" style={{ width: size, height: size }}>
        <div className="cloud-body" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="snowflake" style={{ left: `${15 + i * 18}%`, animationDelay: `${i * 0.3}s` }}>❄</div>
        ))}
      </div>
    ),
    Mist: (
      <div className="icon-mist" style={{ width: size, height: size }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mist-line" style={{ top: `${30 + i * 20}%`, animationDelay: `${i * 0.4}s` }} />
        ))}
      </div>
    ),
  };
  return icons[condition] || icons['Clouds'];
};

// Alert Banner Component
const AlertBanner = ({ alerts, onDismiss }) => {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div className="alert-banner">
      {alerts.map((alert, i) => (
        <div key={i} className="alert-item">
          <span className="alert-icon">⚠️</span>
          <span className="alert-text">{alert}</span>
          <button className="alert-close" onClick={() => onDismiss(i)}>✕</button>
        </div>
      ))}
    </div>
  );
};

// Search History Component
const SearchHistory = ({ history, onSelect, onClear }) => {
  if (!history.length) return null;
  return (
    <div className="search-history">
      <div className="history-header">
        <span className="history-label">🕐 Recent Searches</span>
        <button className="clear-btn" onClick={onClear}>Clear</button>
      </div>
      <div className="history-chips">
        {history.map((city, i) => (
          <button key={i} className="history-chip" onClick={() => onSelect(city)}>
            {city}
          </button>
        ))}
      </div>
    </div>
  );
};

// Hourly Forecast Component
const HourlyForecast = ({ data }) => {
  if (!data || !data.length) return null;
  return (
    <div className="hourly-section">
      <h3 className="section-title">⏱ Hourly Forecast</h3>
      <div className="hourly-scroll">
        {data.slice(0, 8).map((item, i) => {
          const time = new Date(item.dt * 1000);
          const hour = time.getHours();
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          return (
            <div key={i} className="hourly-card">
              <span className="hourly-time">{`${hour12} ${ampm}`}</span>
              <WeatherIcon condition={item.weather[0].main} size={36} />
              <span className="hourly-temp">{Math.round(item.main.temp - 273.15)}°C</span>
              <span className="hourly-desc">{item.weather[0].main}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main App
function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('weatherHistory')) || []; }
    catch { return []; }
  });
  const [alerts, setAlerts] = useState([]);
  const [unit, setUnit] = useState('C');

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const generateAlerts = useCallback((data) => {
    const newAlerts = [];
    const tempC = data.main.temp - 273.15;
    const windSpeed = data.wind.speed;
    const humidity = data.main.humidity;
    if (tempC > 38) newAlerts.push(`🌡️ Extreme heat warning! Temperature is ${tempC.toFixed(1)}°C — Stay hydrated!`);
    if (tempC < 5) newAlerts.push(`🥶 Cold alert! Temperature is ${tempC.toFixed(1)}°C — Dress warmly!`);
    if (windSpeed > 15) newAlerts.push(`💨 Strong wind advisory! Wind speed: ${windSpeed} m/s`);
    if (humidity > 85) newAlerts.push(`💧 High humidity alert: ${humidity}% — Feels very muggy!`);
    const cond = data.weather[0].main;
    if (cond === 'Thunderstorm') newAlerts.push(`⛈️ Thunderstorm warning! Stay indoors and avoid open areas.`);
    if (cond === 'Snow') newAlerts.push(`❄️ Snowfall detected! Roads may be slippery.`);
    setAlerts(newAlerts);
  }, []);

  const addToHistory = useCallback((cityName) => {
    setSearchHistory(prev => {
      const updated = [cityName, ...prev.filter(c => c.toLowerCase() !== cityName.toLowerCase())].slice(0, 6);
      localStorage.setItem('weatherHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getWeather = useCallback(async (searchCity) => {
    const target = searchCity || city;
    if (!target.trim()) { setError('Please enter a city name'); return; }
    setLoading(true); setError(''); setWeather(null); setHourly([]); setAlerts([]);
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        axios(`https://api.openweathermap.org/data/2.5/weather?q=${target}&appid=${API_KEY}`),
        axios(`https://api.openweathermap.org/data/2.5/forecast?q=${target}&appid=${API_KEY}`)
      ]);
      setWeather(weatherRes.data);
      setHourly(forecastRes.data.list);
      generateAlerts(weatherRes.data);
      addToHistory(weatherRes.data.name);
    } catch (err) {
      setError('City not found. Please check the spelling and try again.');
    } finally {
      setLoading(false);
    }
  }, [city, generateAlerts, addToHistory]);

  const handleKeyDown = (e) => { if (e.key === 'Enter') getWeather(); };

  const convertTemp = (kelvin) => {
    const c = kelvin - 273.15;
    return unit === 'C' ? `${c.toFixed(1)}°C` : `${(c * 9 / 5 + 32).toFixed(1)}°F`;
  };

  const getBackground = () => {
    if (!weather) return '';
    const cond = weather.weather[0].main;
    const map = {
      Clear: 'bg-clear', Clouds: 'bg-clouds', Rain: 'bg-rain',
      Drizzle: 'bg-rain', Thunderstorm: 'bg-thunder', Snow: 'bg-snow',
      Mist: 'bg-mist', Fog: 'bg-mist', Haze: 'bg-mist',
    };
    return map[cond] || 'bg-clouds';
  };

  const dismissAlert = (index) => setAlerts(prev => prev.filter((_, i) => i !== index));

  return (
    <div className={`app-wrapper ${darkMode ? 'dark-mode' : 'light-mode'} ${getBackground()}`}>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="app-brand">
          <span className="brand-icon">🌤</span>
          <span className="brand-name">SkyCast</span>
        </div>
        <div className="top-controls">
          <button className="unit-toggle" onClick={() => setUnit(u => u === 'C' ? 'F' : 'C')}>
            °{unit === 'C' ? 'F' : 'C'}
          </button>
          <button className="theme-toggle" onClick={() => setDarkMode(d => !d)} title="Toggle theme">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="main-container">
        {/* Alerts */}
        <AlertBanner alerts={alerts} onDismiss={dismissAlert} />

        {/* Search Box */}
        <div className="search-wrapper">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search city..."
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="search-btn" onClick={() => getWeather()} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Search'}
            </button>
          </div>
          <SearchHistory
            history={searchHistory}
            onSelect={(c) => { setCity(c); getWeather(c); }}
            onClear={() => { setSearchHistory([]); localStorage.removeItem('weatherHistory'); }}
          />
        </div>

        {/* Error */}
        {error && <div className="error-card">❌ {error}</div>}

        {/* Loading */}
        {loading && (
          <div className="loading-card">
            <div className="loading-animation">
              <span>🌤</span><span>⛅</span><span>🌥</span>
            </div>
            <p>Fetching weather data...</p>
          </div>
        )}

        {/* Weather Card */}
        {weather && !loading && (
          <div className="weather-card">
            <div className="weather-header">
              <div className="location-info">
                <h2 className="city-name">📍 {weather.name}, {weather.sys.country}</h2>
                <p className="weather-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="weather-main">
              <div className="weather-icon-wrap">
                <WeatherIcon condition={weather.weather[0].main} size={100} />
              </div>
              <div className="temp-block">
                <div className="temperature">{convertTemp(weather.main.temp)}</div>
                <div className="feels-like">Feels like {convertTemp(weather.main.feels_like)}</div>
                <div className="condition-label">{weather.weather[0].description}</div>
              </div>
            </div>

            <div className="weather-stats">
              <div className="stat-card">
                <span className="stat-icon">💧</span>
                <span className="stat-label">Humidity</span>
                <span className="stat-value">{weather.main.humidity}%</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">💨</span>
                <span className="stat-label">Wind</span>
                <span className="stat-value">{weather.wind.speed} m/s</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🌡️</span>
                <span className="stat-label">Min / Max</span>
                <span className="stat-value">{convertTemp(weather.main.temp_min)} / {convertTemp(weather.main.temp_max)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">👁️</span>
                <span className="stat-label">Visibility</span>
                <span className="stat-value">{((weather.visibility || 0) / 1000).toFixed(1)} km</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🌅</span>
                <span className="stat-label">Sunrise</span>
                <span className="stat-value">{new Date(weather.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🌇</span>
                <span className="stat-label">Sunset</span>
                <span className="stat-value">{new Date(weather.sys.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Hourly Forecast */}
            <HourlyForecast data={hourly} />
          </div>
        )}

        {/* Empty State */}
        {!weather && !loading && !error && (
          <div className="empty-state">
            <div className="empty-icon">🌍</div>
            <h3>Search any city to get started</h3>
            <p>Get live weather, hourly forecasts & smart alerts</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;