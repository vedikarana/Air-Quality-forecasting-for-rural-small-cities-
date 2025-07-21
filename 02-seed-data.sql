-- Insert sample cities
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Delhi', 'Delhi', 28.6139, 77.2090, 'DL001'),
('Mumbai', 'Maharashtra', 19.0760, 72.8777, 'MH001'),
('Bangalore', 'Karnataka', 12.9716, 77.5946, 'KA001'),
('Chennai', 'Tamil Nadu', 13.0827, 80.2707, 'TN001'),
('Kolkata', 'West Bengal', 22.5726, 88.3639, 'WB001'),
('Hyderabad', 'Telangana', 17.3850, 78.4867, 'TS001'),
('Pune', 'Maharashtra', 18.5204, 73.8567, 'MH002'),
('Ahmedabad', 'Gujarat', 23.0225, 72.5714, 'GJ001'),
('Jaipur', 'Rajasthan', 26.9124, 75.7873, 'RJ001'),
('Lucknow', 'Uttar Pradesh', 26.8467, 80.9462, 'UP001');

-- Insert health advisories based on AQI categories
INSERT INTO health_advisories (aqi_min, aqi_max, category, general_advice, sensitive_groups_advice, outdoor_activities, mask_recommendation, air_purifier_recommendation) VALUES
(0, 50, 'Good', 'Air quality is satisfactory. Enjoy outdoor activities.', 'No restrictions for sensitive groups.', 'All outdoor activities are safe.', FALSE, FALSE),
(51, 100, 'Satisfactory', 'Air quality is acceptable for most people.', 'Sensitive individuals may experience minor breathing discomfort.', 'Normal outdoor activities are fine.', FALSE, FALSE),
(101, 200, 'Moderate', 'May cause breathing discomfort to sensitive people.', 'Children, elderly, and people with respiratory issues should limit prolonged outdoor exposure.', 'Reduce prolonged or heavy outdoor activities.', TRUE, FALSE),
(201, 300, 'Poor', 'May cause breathing discomfort to most people on prolonged exposure.', 'Avoid outdoor activities. Use air purifiers indoors.', 'Avoid outdoor activities, especially for children and elderly.', TRUE, TRUE),
(301, 400, 'Very Poor', 'May cause respiratory illness on prolonged exposure.', 'Avoid all outdoor activities. Stay indoors with air purification.', 'Avoid all outdoor activities.', TRUE, TRUE),
(401, 500, 'Severe', 'May cause serious respiratory effects even on healthy people.', 'Emergency conditions. Everyone should avoid outdoor exposure.', 'All outdoor activities prohibited.', TRUE, TRUE);

-- Insert sample AQI readings for the last 30 days
DO $$
DECLARE
    city_record RECORD;
    day_offset INTEGER;
    base_aqi INTEGER;
    random_variation INTEGER;
BEGIN
    FOR city_record IN SELECT id, name FROM cities LOOP
        -- Set base AQI for different cities (Delhi higher, coastal cities lower)
        CASE 
            WHEN city_record.name = 'Delhi' THEN base_aqi := 180;
            WHEN city_record.name IN ('Mumbai', 'Chennai', 'Kolkata') THEN base_aqi := 120;
            WHEN city_record.name IN ('Bangalore', 'Pune') THEN base_aqi := 100;
            ELSE base_aqi := 140;
        END CASE;
        
        FOR day_offset IN 0..29 LOOP
            random_variation := (RANDOM() * 60 - 30)::INTEGER; -- ±30 variation
            INSERT INTO aqi_readings (
                city_id, 
                station_name, 
                aqi_value, 
                pm25, 
                pm10, 
                no2, 
                so2, 
                co, 
                o3,
                quality_category,
                recorded_at
            ) VALUES (
                city_record.id,
                city_record.name || ' Central',
                GREATEST(10, base_aqi + random_variation),
                (base_aqi + random_variation) * 0.6,
                (base_aqi + random_variation) * 0.8,
                (base_aqi + random_variation) * 0.4,
                (base_aqi + random_variation) * 0.2,
                (base_aqi + random_variation) * 0.1,
                (base_aqi + random_variation) * 0.3,
                CASE 
                    WHEN base_aqi + random_variation <= 50 THEN 'Good'
                    WHEN base_aqi + random_variation <= 100 THEN 'Satisfactory'
                    WHEN base_aqi + random_variation <= 200 THEN 'Moderate'
                    WHEN base_aqi + random_variation <= 300 THEN 'Poor'
                    WHEN base_aqi + random_variation <= 400 THEN 'Very Poor'
                    ELSE 'Severe'
                END,
                NOW() - INTERVAL '1 day' * day_offset
            );
        END LOOP;
    END LOOP;
END $$;
