-- Generate realistic AQI data for Maharashtra villages, towns, and cities
-- This script creates historical AQI data with location-specific characteristics

DO $$
DECLARE
    location_record RECORD;
    day_offset INTEGER;
    base_aqi INTEGER;
    random_variation INTEGER;
    seasonal_factor INTEGER;
    location_factor INTEGER;
    category_factor INTEGER;
    population_factor INTEGER;
BEGIN
    -- Loop through all Maharashtra locations
    FOR location_record IN 
        SELECT 
            c.id as city_id, 
            c.city_name, 
            c.category, 
            c.population,
            d.district_name,
            c.latitude,
            c.longitude
        FROM enhanced_cities c
        JOIN districts d ON c.district_id = d.id
        JOIN states s ON d.state_id = s.id
        WHERE s.state_code = 'MH'
    LOOP
        -- Set base AQI based on location characteristics
        CASE 
            -- Rural villages: Generally cleaner air
            WHEN location_record.category = 'rural' THEN base_aqi := 85;
            -- Towns: Moderate pollution due to local industry/traffic
            WHEN location_record.category = 'town' THEN base_aqi := 110;
            -- Small cities: Higher pollution due to urbanization
            WHEN location_record.category = 'small_city' THEN base_aqi := 130;
            -- Major cities: Highest pollution
            WHEN location_record.category = 'major_city' THEN base_aqi := 155;
            ELSE base_aqi := 100;
        END CASE;
        
        -- Population-based adjustment
        population_factor := CASE
            WHEN location_record.population > 1000000 THEN 25  -- Major cities
            WHEN location_record.population > 500000 THEN 15   -- Large towns
            WHEN location_record.population > 100000 THEN 10   -- Medium towns
            WHEN location_record.population > 50000 THEN 5     -- Small towns
            ELSE -5  -- Villages get cleaner air bonus
        END;
        
        -- District-specific factors
        location_factor := CASE
            -- Industrial districts
            WHEN location_record.district_name IN ('Thane', 'Pune', 'Aurangabad') THEN 20;
            -- Agricultural districts with some industry
            WHEN location_record.district_name IN ('Nashik', 'Ahmednagar', 'Solapur') THEN 10;
            -- Coastal districts (sea breeze effect)
            WHEN location_record.district_name = 'Ratnagiri' THEN -15;
            -- Hill stations and rural areas
            WHEN location_record.district_name IN ('Satara', 'Kolhapur') THEN -5;
            ELSE 0;
        END CASE;
        
        -- Special location adjustments
        CASE
            -- Tourist/religious places (more traffic during seasons)
            WHEN location_record.city_name = 'Shirdi' THEN location_factor := location_factor + 15;
            -- Industrial towns
            WHEN location_record.city_name IN ('Bhiwandi', 'Ichalkaranji', 'Malegaon') THEN location_factor := location_factor + 20;
            -- Coastal towns (cleaner air)
            WHEN location_record.city_name IN ('Chiplun', 'Ratnagiri') THEN location_factor := location_factor - 10;
            ELSE location_factor := location_factor;
        END CASE;
        
        -- Generate 90 days of historical data
        FOR day_offset IN 0..89 LOOP
            -- Seasonal variation (winter months have higher pollution)
            seasonal_factor := CASE 
                WHEN EXTRACT(MONTH FROM (NOW() - INTERVAL '1 day' * day_offset)) IN (11, 12, 1, 2) THEN 20
                WHEN EXTRACT(MONTH FROM (NOW() - INTERVAL '1 day' * day_offset)) IN (3, 4) THEN 10
                WHEN EXTRACT(MONTH FROM (NOW() - INTERVAL '1 day' * day_offset)) IN (6, 7, 8, 9) THEN -5  -- Monsoon cleaning effect
                ELSE 0
            END;
            
            -- Random daily variation
            random_variation := (RANDOM() * 50 - 25)::INTEGER; -- ±25 variation
            
            -- Calculate final AQI
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
                nh3,
                quality_category,
                recorded_at
            ) VALUES (
                -- Map to existing cities table (we'll need to handle this mapping)
                (SELECT id FROM cities WHERE name = location_record.city_name LIMIT 1),
                location_record.city_name || ' Monitoring Station',
                GREATEST(10, base_aqi + population_factor + location_factor + seasonal_factor + random_variation),
                (base_aqi + population_factor + location_factor + seasonal_factor + random_variation) * 0.6,
                (base_aqi + population_factor + location_factor + seasonal_factor + random_variation) * 0.8,
                (base_aqi + population_factor + location_factor + seasonal_factor + random_variation) * 0.4,
                (base_aqi + population_factor + location_factor + seasonal_factor + random_variation) * 0.2,
                (base_aqi + population_factor + location_factor + seasonal_factor + random_variation) * 0.1,
                (base_aqi + population_factor + location_factor + seasonal_factor + random_variation) * 0.3,
                (base_aqi + population_factor + location_factor + seasonal_factor + random_variation) * 0.15,
                CASE 
                    WHEN base_aqi + population_factor + location_factor + seasonal_factor + random_variation <= 50 THEN 'Good'
                    WHEN base_aqi + population_factor + location_factor + seasonal_factor + random_variation <= 100 THEN 'Satisfactory'
                    WHEN base_aqi + population_factor + location_factor + seasonal_factor + random_variation <= 200 THEN 'Moderate'
                    WHEN base_aqi + population_factor + location_factor + seasonal_factor + random_variation <= 300 THEN 'Poor'
                    WHEN base_aqi + population_factor + location_factor + seasonal_factor + random_variation <= 400 THEN 'Very Poor'
                    ELSE 'Severe'
                END,
                NOW() - INTERVAL '1 day' * day_offset
            );
        END LOOP;
    END LOOP;
END $$;
