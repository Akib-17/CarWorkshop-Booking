CREATE TABLE mechanics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_name VARCHAR(100),
  address TEXT,
  phone VARCHAR(20),
  car_license VARCHAR(20),
  engine_number VARCHAR(20),
  appointment_date DATE,
  mechanic_id INT,
  FOREIGN KEY (mechanic_id) REFERENCES mechanics(id)
);
-- Insert initial mechanics
INSERT INTO mechanics (name) VALUES
('Mr. Karim'),
('Mr. Rahim'),
('Mr. Salim'),
('Mr. Babu'),
('Mr. Anis');
