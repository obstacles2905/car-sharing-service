CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name varchar(40) NOT NULL,
    login varchar(30) NOT NULL,
    salt varchar NOT NULL
);

CREATE UNIQUE INDEX login_unique_idx on users (LOWER(login));

CREATE TABLE amenities (
    id SERIAL PRIMARY KEY,
    name varchar(30) UNIQUE NOT NULL
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id int,
    amenity_id int,
    start_time int NOT NULL,
    end_time int NOT NULL,
    date bigint NOT NULL,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
            REFERENCES users(id),
    CONSTRAINT fk_amenity
        FOREIGN KEY (amenity_id)
            REFERENCES amenities(id)
);

INSERT INTO users (name, login, salt) VALUES
    ('User1', 'userLogin1', '$2b$05$Z3Gqj82M97lS1bikajFcxemlcZ6n7L9nJzZDTNxMqTpmVWdSXX0Fa'),
    ('User2', 'userLogin2', '$2b$05$Z3Gqj82M97lS1bikajFcxemlcZ6n7L9nJzZDTNxMqTpmVWdSXX0Fa'),
    ('User3', 'userLogin3', '$2b$05$Z3Gqj82M97lS1bikajFcxemlcZ6n7L9nJzZDTNxMqTpmVWdSXX0Fa');

INSERT INTO amenities (name) VALUES ('Massage room'), ('Gym'), ('Cinema'), ('Computer club');

INSERT INTO bookings (user_id, amenity_id, start_time, end_time, date) VALUES
    (1, 1, 600, 630, 1635238300000),
    (2, 2, 720, 780, 1635254300000),
    (3, 3, 540, 600, 1635275300000),
    (1, 4, 660, 780, 1635299300000);