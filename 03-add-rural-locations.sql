-- Add rural areas, small towns, and additional cities across India

-- Rural areas and small towns in Punjab (agricultural region with stubble burning issues)
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Bathinda', 'Punjab', 30.2110, 74.9455, 'PB001'),
('Moga', 'Punjab', 30.8158, 75.1711, 'PB002'),
('Fazilka', 'Punjab', 30.4028, 74.0286, 'PB003'),
('Barnala', 'Punjab', 30.3782, 75.5462, 'PB004'),
('Kapurthala', 'Punjab', 31.3800, 75.3800, 'PB005'),

-- Rural areas in Haryana (NCR region with high pollution)
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Panipat', 'Haryana', 29.3909, 76.9635, 'HR001'),
('Karnal', 'Haryana', 29.6857, 76.9905, 'HR002'),
('Rohtak', 'Haryana', 28.8955, 76.6066, 'HR003'),
('Hisar', 'Haryana', 29.1492, 75.7217, 'HR004'),
('Sirsa', 'Haryana', 29.5347, 75.0269, 'HR005'),

-- Small towns in Uttar Pradesh (industrial and agricultural mix)
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Moradabad', 'Uttar Pradesh', 28.8386, 78.7733, 'UP002'),
('Firozabad', 'Uttar Pradesh', 27.1592, 78.3957, 'UP003'),
('Bareilly', 'Uttar Pradesh', 28.3670, 79.4304, 'UP004'),
('Aligarh', 'Uttar Pradesh', 27.8974, 78.0880, 'UP005'),
('Mathura', 'Uttar Pradesh', 27.4924, 77.6737, 'UP006'),
('Meerut', 'Uttar Pradesh', 28.9845, 77.7064, 'UP007'),
('Saharanpur', 'Uttar Pradesh', 29.9680, 77.5552, 'UP008'),

-- Rural areas in Bihar (agricultural region)
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Muzaffarpur', 'Bihar', 26.1209, 85.3647, 'BR001'),
('Darbhanga', 'Bihar', 26.1542, 85.8918, 'BR002'),
('Begusarai', 'Bihar', 25.4182, 86.1272, 'BR003'),
('Katihar', 'Bihar', 25.5394, 87.5789, 'BR004'),
('Purnia', 'Bihar', 25.7771, 87.4753, 'BR005'),

-- Small towns in Madhya Pradesh (central India)
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Gwalior', 'Madhya Pradesh', 26.2183, 78.1828, 'MP001'),
('Ujjain', 'Madhya Pradesh', 23.1765, 75.7885, 'MP002'),
('Dewas', 'Madhya Pradesh', 22.9676, 76.0534, 'MP003'),
('Ratlam', 'Madhya Pradesh', 23.3315, 75.0367, 'MP004'),
('Singrauli', 'Madhya Pradesh', 24.1997, 82.6739, 'MP005'),

-- Rural areas in Rajasthan (desert region with dust storms)
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Jodhpur', 'Rajasthan', 26.2389, 73.0243, 'RJ002'),
('Bikaner', 'Rajasthan', 28.0229, 73.3119, 'RJ003'),
('Ajmer', 'Rajasthan', 26.4499, 74.6399, 'RJ004'),
('Bharatpur', 'Rajasthan', 27.2152, 77.5030, 'RJ005'),
('Alwar', 'Rajasthan', 27.5530, 76.6346, 'RJ006'),

-- Small towns in Odisha (eastern coastal region)
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Rourkela', 'Odisha', 22.2604, 84.8536, 'OR001'),
('Sambalpur', 'Odisha', 21.4669, 83.9812, 'OR002'),
('Balasore', 'Odisha', 21.4942, 86.9336, 'OR003'),
('Berhampur', 'Odisha', 19.3149, 84.7941, 'OR004'),

-- Rural areas in Chhattisgarh (mining and industrial region)
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Raipur', 'Chhattisgarh', 21.2514, 81.6296, 'CG001'),
('Bhilai', 'Chhattisgarh', 21.1938, 81.3509, 'CG002'),
('Korba', 'Chhattisgarh', 22.3595, 82.7501, 'CG003'),
('Durg', 'Chhattisgarh', 21.1901, 81.2849, 'CG004'),

-- Small towns in Jharkhand (mining region)
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Jamshedpur', 'Jharkhand', 22.8046, 86.2029, 'JH001'),
('Dhanbad', 'Jharkhand', 23.7957, 86.4304, 'JH002'),
('Bokaro', 'Jharkhand', 23.6693, 85.9606, 'JH003'),
('Ranchi', 'Jharkhand', 23.3441, 85.3096, 'JH004'),

-- Rural areas in Assam (northeastern region)
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Guwahati', 'Assam', 26.1445, 91.7362, 'AS001'),
('Dibrugarh', 'Assam', 27.4728, 94.9120, 'AS002'),
('Silchar', 'Assam', 24.8333, 92.7789, 'AS003'),
('Jorhat', 'Assam', 26.7509, 94.2037, 'AS004'),

-- Small towns in Himachal Pradesh (hill stations)
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Shimla', 'Himachal Pradesh', 31.1048, 77.1734, 'HP001'),
('Dharamshala', 'Himachal Pradesh', 32.2190, 76.3234, 'HP002'),
('Kullu', 'Himachal Pradesh', 31.9578, 77.1734, 'HP003'),
('Mandi', 'Himachal Pradesh', 31.7084, 76.9319, 'HP004'),

-- Rural areas in Uttarakhand (mountain region)
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Dehradun', 'Uttarakhand', 30.3165, 78.0322, 'UK001'),
('Haridwar', 'Uttarakhand', 29.9457, 78.1642, 'UK002'),
('Rishikesh', 'Uttarakhand', 30.0869, 78.2676, 'UK003'),
('Roorkee', 'Uttarakhand', 29.8543, 77.8880, 'UK004'),

-- Small towns in Kerala (coastal southern region)
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Kochi', 'Kerala', 9.9312, 76.2673, 'KL001'),
('Kozhikode', 'Kerala', 11.2588, 75.7804, 'KL002'),
('Thrissur', 'Kerala', 10.5276, 76.2144, 'KL003'),
('Kollam', 'Kerala', 8.8932, 76.6141, 'KL004'),

-- Rural areas in Andhra Pradesh
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Visakhapatnam', 'Andhra Pradesh', 17.6868, 83.2185, 'AP001'),
('Vijayawada', 'Andhra Pradesh', 16.5062, 80.6480, 'AP002'),
('Guntur', 'Andhra Pradesh', 16.3067, 80.4365, 'AP003'),
('Nellore', 'Andhra Pradesh', 14.4426, 79.9865, 'AP004'),

-- Small towns in Karnataka (beyond Bangalore)
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Mysore', 'Karnataka', 12.2958, 76.6394, 'KA002'),
('Hubli', 'Karnataka', 15.3647, 75.1240, 'KA003'),
('Mangalore', 'Karnataka', 12.9141, 74.8560, 'KA004'),
('Belgaum', 'Karnataka', 15.8497, 74.4977, 'KA005'),

-- Rural areas in Tamil Nadu (beyond Chennai)
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Coimbatore', 'Tamil Nadu', 11.0168, 76.9558, 'TN002'),
('Madurai', 'Tamil Nadu', 9.9252, 78.1198, 'TN003'),
('Salem', 'Tamil Nadu', 11.6643, 78.1460, 'TN004'),
('Tirupur', 'Tamil Nadu', 11.1085, 77.3411, 'TN005'),
('Vellore', 'Tamil Nadu', 12.9165, 79.1325, 'TN006');

-- Create indexes for better performance on new data
CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(state);
CREATE INDEX IF NOT EXISTS idx_cities_name_state ON cities(name, state);
