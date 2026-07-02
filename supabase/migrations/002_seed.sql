-- Services
INSERT INTO services (name, duration_minutes, description) VALUES
  ('Full Set',  120, 'Complete new set of eyelash extensions. Perfect for first-time clients.'),
  ('Regular',    60, 'Lash fill for existing extensions. Recommended every 2–3 weeks.'),
  ('Mini',       30, 'Quick fill for minor touch-ups. Best for 1–2 weeks after a regular fill.');

-- Availability: Mon–Fri (1–5) active 9am–5pm, Sat–Sun inactive
INSERT INTO availability (day_of_week, start_time, end_time, is_active) VALUES
  (0, '09:00', '17:00', false),  -- Sunday
  (1, '09:00', '17:00', true),   -- Monday
  (2, '09:00', '17:00', true),   -- Tuesday
  (3, '09:00', '17:00', true),   -- Wednesday
  (4, '09:00', '17:00', true),   -- Thursday
  (5, '09:00', '17:00', true),   -- Friday
  (6, '09:00', '17:00', false);  -- Saturday
