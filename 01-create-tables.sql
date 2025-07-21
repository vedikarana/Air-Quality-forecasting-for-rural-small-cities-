-- Create tables for Air Quality data storage

-- Cities/Locations table
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    cpcb_station_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AQI readings table
CREATE TABLE IF NOT EXISTS aqi_readings (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id),
    station_name VARCHAR(100),
    aqi_value INTEGER NOT NULL,
    pm25 DECIMAL(8, 2),
    pm10 DECIMAL(8, 2),
    no2 DECIMAL(8, 2),
    so2 DECIMAL(8, 2),
    co DECIMAL(8, 2),
    o3 DECIMAL(8, 2),
    nh3 DECIMAL(8, 2),
    quality_category VARCHAR(20) NOT NULL, -- Good, Satisfactory, Moderate, Poor, Very Poor, Severe
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Satellite data snapshots
CREATE TABLE IF NOT EXISTS satellite_data (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id),
    image_url TEXT,
    pollution_density DECIMAL(8, 4),
    cloud_cover DECIMAL(5, 2),
    visibility_km DECIMAL(6, 2),
    captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    data_source VARCHAR(50) DEFAULT 'ISRO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health advisories
CREATE TABLE IF NOT EXISTS health_advisories (
    id SERIAL PRIMARY KEY,
    aqi_min INTEGER NOT NULL,
    aqi_max INTEGER NOT NULL,
    category VARCHAR(20) NOT NULL,
    general_advice TEXT NOT NULL,
    sensitive_groups_advice TEXT,
    outdoor_activities TEXT,
    mask_recommendation BOOLEAN DEFAULT FALSE,
    air_purifier_recommendation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forecasting data
CREATE TABLE IF NOT EXISTS aqi_forecasts (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id),
    forecast_date DATE NOT NULL,
    predicted_aqi INTEGER NOT NULL,
    predicted_pm25 DECIMAL(8, 2),
    confidence_score DECIMAL(5, 4),
    weather_factor JSONB,
    model_version VARCHAR(20) DEFAULT 'v1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification logs
CREATE TABLE IF NOT EXISTS notification_logs (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id),
    notification_type VARCHAR(50) NOT NULL, -- spike_alert, daily_forecast, health_warning
    message TEXT NOT NULL,
    aqi_value INTEGER,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recipients_count INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_aqi_readings_city_recorded ON aqi_readings(city_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_aqi_readings_recorded_at ON aqi_readings(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_satellite_data_city_captured ON satellite_data(city_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_forecasts_city_date ON aqi_forecasts(city_id, forecast_date);
CREATE INDEX IF NOT EXISTS idx_cities_location ON cities(latitude, longitude);
