CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name varchar(40) NOT NULL,
    login varchar(30) NOT NULL,
    salt varchar NOT NULL
);

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

drop table bookings;

INSERT INTO users (name, login, salt) VALUES
    ('User1', 'userLogin1', 'userSalt1'),
    ('User2', 'userLogin2', 'userSalt2'),
    ('User3', 'userLogin3', 'userSalt3');

INSERT INTO amenities (name) VALUES ('Massage room'), ('Gym'), ('Cinema'), ('Computer club');

INSERT INTO bookings (user_id, amenity_id, start_time, end_time, date) VALUES
    (1, 1, 600, 630, 1635238300000),
    (2, 2, 720, 780, 1635254300000),
    (3, 3, 540, 600, 1635275300000),
    (1, 4, 660, 780, 1635299300000);