-- Enable UUID extension for Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geospatial queries (if available)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Table for states (Maharashtra focus)
CREATE TABLE IF NOT EXISTS states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_code VARCHAR(2) NOT NULL UNIQUE,
  state_name VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(10) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for districts
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_id UUID NOT NULL REFERENCES states(id),
  district_code VARCHAR(3) NOT NULL,
  district_name VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(10) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(state_id, district_code)
);

-- Enhanced cities table to include villages, towns, and small cities
CREATE TABLE IF NOT EXISTS enhanced_cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID NOT NULL REFERENCES districts(id),
  city_code VARCHAR(6) NOT NULL,
  city_name VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('rural', 'town', 'small_city', 'major_city')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  population INTEGER,
  cpcb_station_id VARCHAR(50),
  status VARCHAR(10) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(district_id, city_code)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_states_state_code ON states(state_code);
CREATE INDEX IF NOT EXISTS idx_districts_state_id ON districts(state_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_cities_district_id ON enhanced_cities(district_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_cities_category ON enhanced_cities(category);
CREATE INDEX IF NOT EXISTS idx_enhanced_cities_location ON enhanced_cities(latitude, longitude);

-- Insert Maharashtra state
INSERT INTO states (state_code, state_name, description)
VALUES ('MH', 'Maharashtra', 'Western state with diverse rural and urban areas including villages, towns, and cities')
ON CONFLICT (state_code) DO NOTHING;

-- Insert districts in Maharashtra
INSERT INTO districts (state_id, district_code, district_name, description)
VALUES
  ((SELECT id FROM states WHERE state_code = 'MH'), '510', 'Ahmednagar', 'Largest district by area with significant rural population'),
  ((SELECT id FROM states WHERE state_code = 'MH'), '515', 'Nashik', 'Wine capital of India with mixed urban-rural areas'),
  ((SELECT id FROM states WHERE state_code = 'MH'), '523', 'Satara', 'Historical district with predominantly rural character'),
  ((SELECT id FROM states WHERE state_code = 'MH'), '527', 'Thane', 'Highly urbanized district near Mumbai'),
  ((SELECT id FROM states WHERE state_code = 'MH'), '531', 'Ratnagiri', 'Coastal district with rural dominance'),
  ((SELECT id FROM states WHERE state_code = 'MH'), '535', 'Pune', 'IT hub with surrounding rural areas'),
  ((SELECT id FROM states WHERE state_code = 'MH'), '539', 'Kolhapur', 'Sugar belt with agricultural towns'),
  ((SELECT id FROM states WHERE state_code = 'MH'), '543', 'Aurangabad', 'Industrial city with rural hinterland'),
  ((SELECT id FROM states WHERE state_code = 'MH'), '547', 'Solapur', 'Textile center with rural surroundings'),
  ((SELECT id FROM states WHERE state_code = 'MH'), '551', 'Nagpur', 'Orange city with rural districts')
ON CONFLICT (state_id, district_code) DO NOTHING;

-- Insert comprehensive data for villages, towns, and small cities
INSERT INTO enhanced_cities (district_id, city_code, city_name, category, latitude, longitude, population, cpcb_station_id)
VALUES
  -- Rural Villages (category: 'rural')
  ((SELECT id FROM districts WHERE district_name = 'Ahmednagar'), '000001', 'Pathardi', 'rural', 19.166667, 75.183333, 12000, 'MH_AHM_001'),
  ((SELECT id FROM districts WHERE district_name = 'Nashik'), '000002', 'Sinnar', 'rural', 19.850000, 74.000000, 15000, 'MH_NAS_001'),
  ((SELECT id FROM districts WHERE district_name = 'Satara'), '000003', 'Koregaon', 'rural', 17.700000, 74.150000, 10000, 'MH_SAT_001'),
  ((SELECT id FROM districts WHERE district_name = 'Thane'), '000004', 'Murbad', 'rural', 19.250000, 73.400000, 8000, 'MH_THA_001'),
  ((SELECT id FROM districts WHERE district_name = 'Ratnagiri'), '000005', 'Khed', 'rural', 17.716667, 73.383333, 9000, 'MH_RAT_001'),
  ((SELECT id FROM districts WHERE district_name = 'Pune'), '000006', 'Maval', 'rural', 18.750000, 73.433333, 11000, 'MH_PUN_001'),
  ((SELECT id FROM districts WHERE district_name = 'Kolhapur'), '000007', 'Hatkanangle', 'rural', 16.083333, 74.450000, 13000, 'MH_KOL_001'),
  ((SELECT id FROM districts WHERE district_name = 'Aurangabad'), '000008', 'Sillod', 'rural', 20.300000, 75.650000, 14000, 'MH_AUR_001'),
  ((SELECT id FROM districts WHERE district_name = 'Solapur'), '000009', 'Mangalwedha', 'rural', 17.566667, 75.450000, 16000, 'MH_SOL_001'),
  ((SELECT id FROM districts WHERE district_name = 'Nagpur'), '000010', 'Ramtek', 'rural', 21.400000, 79.316667, 18000, 'MH_NAG_001'),

  -- Towns (category: 'town')
  ((SELECT id FROM districts WHERE district_name = 'Ahmednagar'), '800001', 'Shirdi', 'town', 19.766667, 74.477778, 36004, 'MH_AHM_T01'),
  ((SELECT id FROM districts WHERE district_name = 'Nashik'), '800002', 'Malegaon', 'town', 20.549700, 74.534600, 471006, 'MH_NAS_T01'),
  ((SELECT id FROM districts WHERE district_name = 'Satara'), '800003', 'Karad', 'town', 17.283333, 74.183333, 74396, 'MH_SAT_T01'),
  ((SELECT id FROM districts WHERE district_name = 'Thane'), '800004', 'Bhiwandi', 'town', 19.300000, 73.066667, 709035, 'MH_THA_T01'),
  ((SELECT id FROM districts WHERE district_name = 'Ratnagiri'), '800005', 'Chiplun', 'town', 17.533333, 73.516667, 55000, 'MH_RAT_T01'),
  ((SELECT id FROM districts WHERE district_name = 'Pune'), '800006', 'Chinchwad', 'town', 18.650000, 73.800000, 1729320, 'MH_PUN_T01'),
  ((SELECT id FROM districts WHERE district_name = 'Kolhapur'), '800007', 'Ichalkaranji', 'town', 16.700000, 74.466667, 287570, 'MH_KOL_T01'),
  ((SELECT id FROM districts WHERE district_name = 'Aurangabad'), '800008', 'Jalna', 'town', 19.833333, 75.883333, 285349, 'MH_AUR_T01'),
  ((SELECT id FROM districts WHERE district_name = 'Solapur'), '800009', 'Pandharpur', 'town', 17.683333, 75.316667, 98923, 'MH_SOL_T01'),
  ((SELECT id FROM districts WHERE district_name = 'Nagpur'), '800010', 'Kamptee', 'town', 21.233333, 79.200000, 81032, 'MH_NAG_T01'),

  -- Small Cities (category: 'small_city')
  ((SELECT id FROM districts WHERE district_name = 'Nashik'), '800011', 'Nashik', 'small_city', 20.011247, 73.790236, 1486053, 'MH_NAS_C01'),
  ((SELECT id FROM districts WHERE district_name = 'Thane'), '800012', 'Thane', 'small_city', 19.186000, 72.975800, 1841488, 'MH_THA_C01'),
  ((SELECT id FROM districts WHERE district_name = 'Ahmednagar'), '800013', 'Ahmednagar', 'small_city', 19.094600, 74.738400, 350905, 'MH_AHM_C01'),
  ((SELECT id FROM districts WHERE district_name = 'Satara'), '800014', 'Satara', 'small_city', 17.685900, 74.018300, 120079, 'MH_SAT_C01'),
  ((SELECT id FROM districts WHERE district_name = 'Ratnagiri'), '800015', 'Ratnagiri', 'small_city', 16.994400, 73.312200, 111297, 'MH_RAT_C01'),
  ((SELECT id FROM districts WHERE district_name = 'Pune'), '800016', 'Pune', 'major_city', 18.520430, 73.856743, 3124458, 'MH_PUN_C01'),
  ((SELECT id FROM districts WHERE district_name = 'Kolhapur'), '800017', 'Kolhapur', 'small_city', 16.704000, 74.243000, 549236, 'MH_KOL_C01'),
  ((SELECT id FROM districts WHERE district_name = 'Aurangabad'), '800018', 'Aurangabad', 'small_city', 19.876165, 75.343315, 1175116, 'MH_AUR_C01'),
  ((SELECT id FROM districts WHERE district_name = 'Solapur'), '800019', 'Solapur', 'small_city', 17.659600, 75.906400, 951118, 'MH_SOL_C01'),
  ((SELECT id FROM districts WHERE district_name = 'Nagpur'), '800020', 'Nagpur', 'major_city', 21.145800, 79.088158, 2405421, 'MH_NAG_C01')
ON CONFLICT (district_id, city_code) DO NOTHING;

-- Create a comprehensive view for easier querying
CREATE OR REPLACE VIEW maharashtra_locations_view AS
SELECT
  s.state_code,
  s.state_name,
  d.district_name,
  c.city_name,
  c.category,
  c.latitude,
  c.longitude,
  c.population,
  c.cpcb_station_id,
  CASE 
    WHEN c.category = 'rural' THEN '🏘️ Village'
    WHEN c.category = 'town' THEN '🏘️ Town'
    WHEN c.category = 'small_city' THEN '🏙️ Small City'
    WHEN c.category = 'major_city' THEN '🏙️ Major City'
    ELSE c.category
  END as display_category
FROM states s
JOIN districts d ON s.id = d.state_id
JOIN enhanced_cities c ON d.id = c.district_id
WHERE s.state_code = 'MH'
ORDER BY c.category, c.population DESC;
