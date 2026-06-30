-- Services
CREATE TABLE services (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  duration_minutes integer NOT NULL,
  description      text,
  active           boolean NOT NULL DEFAULT true
);

-- Clients
CREATE TABLE clients (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  phone      text NOT NULL,
  email      text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX clients_phone_idx ON clients(phone);

-- Availability (one row per day of week)
CREATE TABLE availability (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week  integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   time NOT NULL DEFAULT '09:00',
  end_time     time NOT NULL DEFAULT '17:00',
  is_active    boolean NOT NULL DEFAULT false,
  UNIQUE (day_of_week)
);

-- Bookings
CREATE TABLE bookings (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_ref          text NOT NULL UNIQUE,
  client_id          uuid NOT NULL REFERENCES clients(id),
  service_id         uuid NOT NULL REFERENCES services(id),
  start_time         timestamptz NOT NULL,
  end_time           timestamptz NOT NULL,
  status             text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','denied','cancelled','expired')),
  twilio_message_sid text,
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX bookings_status_idx ON bookings(status);
CREATE INDEX bookings_start_time_idx ON bookings(start_time);

-- Atomic booking creation RPC (prevents double-booking)
CREATE OR REPLACE FUNCTION create_booking(
  p_client_id  uuid,
  p_service_id uuid,
  p_start_time timestamptz,
  p_end_time   timestamptz,
  p_short_ref  text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  overlap_count integer;
  new_id        uuid;
BEGIN
  SELECT COUNT(*) INTO overlap_count
  FROM bookings
  WHERE status IN ('pending', 'confirmed')
    AND start_time < p_end_time
    AND end_time   > p_start_time;

  IF overlap_count > 0 THEN
    RAISE EXCEPTION 'slot_unavailable';
  END IF;

  INSERT INTO bookings (client_id, service_id, start_time, end_time, short_ref)
  VALUES (p_client_id, p_service_id, p_start_time, p_end_time, p_short_ref)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;
