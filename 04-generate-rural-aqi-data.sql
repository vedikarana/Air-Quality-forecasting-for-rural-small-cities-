-- Generate realistic AQI data for rural areas, towns, and cities
-- This script creates historical data for the newly added locations

DO $$
DECLARE
    city_record RECORD;
    day_offset INTEGER;
    base_aqi INTEGER;
    random_variation INTEGER;
    seasonal_factor INTEGER;
    location_factor INTEGER;
BEGIN
    FOR city_record IN SELECT id, name, state FROM cities WHERE id > 10 LOOP
        -- Set base AQI based on region and characteristics
        CASE 
            -- Punjab/Haryana: High due to stubble burning and industrial activity
            WHEN city_record.state IN ('Punjab', 'Haryana') THEN base_aqi := 160;
            -- UP: High due to industrial activity and population density
            WHEN city_record.state = 'Uttar Pradesh' THEN base_aqi := 150;
            -- Bihar: Moderate to high due to agricultural burning
            WHEN city_record.state = 'Bihar' THEN base_aqi := 130;
            -- Rajasthan: High due to dust storms and industrial activity
            WHEN city_record.state = 'Rajasthan' THEN base_aqi := 140;
            -- Mining states: High due to industrial pollution
            WHEN city_record.state IN ('Chhattisgarh', 'Jharkhand', 'Odisha') THEN base_aqi := 145;
            -- MP: Moderate due to mixed industrial and agricultural
            WHEN city_record.state = 'Madhya Pradesh' THEN base_aqi := 125;
            -- Hill stations: Generally better air quality
            WHEN city_record.state IN ('Himachal Pradesh', 'Uttarakhand') THEN base_aqi := 80;
            -- Coastal areas: Better due to sea breeze
            WHEN city_record.state IN ('Kerala', 'Andhra Pradesh') THEN base_aqi := 95;
            -- South Indian cities: Moderate
            WHEN city_record.state IN ('Karnataka', 'Tamil Nadu') THEN base_aqi := 110;
            -- Northeast: Generally cleaner air
            WHEN city_record.state = 'Assam' THEN base_aqi := 90;
            ELSE base_aqi := 120;
        END CASE;
        
        -- Add location-specific factors
        CASE
            -- Industrial towns get higher pollution
            WHEN city_record.name IN ('Singrauli', 'Korba', 'Dhanbad', 'Bokaro', 'Jamshedpur', 'Bhilai', 'Rourkela') THEN
                location_factor := 40;
            -- Agricultural areas during burning season
            WHEN city_record.name IN ('Bathinda', 'Moga', 'Fazilka', 'Barnala', 'Panipat', 'Karnal') THEN
                location_factor := 30;
            -- Tourist/hill stations
            WHEN city_record.name IN ('Shimla', 'Dharamshala', 'Kullu', 'Rishikesh', 'Dehradun') THEN
                location_factor := -30;
            -- Coastal cities
            WHEN city_record.name IN ('Kochi', 'Kozhikode', 'Mangalore', 'Visakhapatnam') THEN
                location_factor := -20;
            ELSE
                location_factor := 0;
        END CASE;
        
        FOR day_offset IN 0..89 LOOP -- 90 days of data
            -- Seasonal variation (winter months have higher pollution)
            seasonal_factor := CASE 
                WHEN EXTRACT(MONTH FROM (NOW() - INTERVAL '1 day' * day_offset)) IN (11, 12, 1, 2) THEN 25
                WHEN EXTRACT(MONTH FROM (NOW() - INTERVAL '1 day' * day_offset)) IN (3, 4) THEN 15
                WHEN EXTRACT(MONTH FROM (NOW() - INTERVAL '1 day' * day_offset)) IN (5, 6, 7, 8, 9) THEN -10
                ELSE 5
            END;
            
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
                nh3,
                quality_category,
                recorded_at
            ) VALUES (
                city_record.id,
                city_record.name || ' Monitoring Station',
                GREATEST(10, base_aqi + location_factor + seasonal_factor + random_variation),
                (base_aqi + location_factor + seasonal_factor + random_variation) * 0.6,
                (base_aqi + location_factor + seasonal_factor + random_variation) * 0.8,
                (base_aqi + location_factor + seasonal_factor + random_variation) * 0.4,
                (base_aqi + location_factor + seasonal_factor + random_variation) * 0.2,
                (base_aqi + location_factor + seasonal_factor + random_variation) * 0.1,
                (base_aqi + location_factor + seasonal_factor + random_variation) * 0.3,
                (base_aqi + location_factor + seasonal_factor + random_variation) * 0.15,
                CASE 
                    WHEN base_aqi + location_factor + seasonal_factor + random_variation <= 50 THEN 'Good'
                    WHEN base_aqi + location_factor + seasonal_factor + random_variation <= 100 THEN 'Satisfactory'
                    WHEN base_aqi + location_factor + seasonal_factor + random_variation <= 200 THEN 'Moderate'
                    WHEN base_aqi + location_factor + seasonal_factor + random_variation <= 300 THEN 'Poor'
                    WHEN base_aqi + location_factor + seasonal_factor + random_variation <= 400 THEN 'Very Poor'
                    ELSE 'Severe'
                END,
                NOW() - INTERVAL '1 day' * day_offset
            );
        END LOOP;
    END LOOP;
END $$;
