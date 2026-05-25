-- Volunteer DB Populated Dump
-- Generated on: 2026-05-20
-- Matches Spring Boot Entities and Angular Mock Data

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS `user_relationship`;
DROP TABLE IF EXISTS `appointment`;
DROP TABLE IF EXISTS `activity_participants`;
DROP TABLE IF EXISTS `activity_organisations`;
DROP TABLE IF EXISTS `activity_skills`;
DROP TABLE IF EXISTS `activity_tags`;
DROP TABLE IF EXISTS `activity_qualifications`;
DROP TABLE IF EXISTS `activity_prerequisites`;
DROP TABLE IF EXISTS `activity_equipment_provided`;
DROP TABLE IF EXISTS `activity`;
DROP TABLE IF EXISTS `organisation_contacts`;
DROP TABLE IF EXISTS `organisation_tags`;
DROP TABLE IF EXISTS `organisation`;
DROP TABLE IF EXISTS `org_admin`;
DROP TABLE IF EXISTS `member`;
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `notification`;
DROP TABLE IF EXISTS `user_notification`;

-- Create user table
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create member table (JOINED inheritance)
CREATE TABLE `member` (
  `id` int NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_member_user` FOREIGN KEY (`id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create org_admin table (JOINED inheritance)
CREATE TABLE `org_admin` (
  `id` int NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_org_admin_member` FOREIGN KEY (`id`) REFERENCES `member` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create organisation table
CREATE TABLE `organisation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `org_name` varchar(255) DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `lon` double DEFAULT NULL,
  `profilepicture` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `body` text,
  `deactivated` tinyint(1) DEFAULT '0',
  `reactivation_time` timestamp NULL DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create organisation_tags table (ElementCollection)
CREATE TABLE `organisation_tags` (
  `organisation_id` int NOT NULL,
  `tags` varchar(255) DEFAULT NULL,
  KEY `FK_org_tags` (`organisation_id`),
  CONSTRAINT `FK_org_tags_org` FOREIGN KEY (`organisation_id`) REFERENCES `organisation` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create organisation_contacts table (ManyToMany)
CREATE TABLE `organisation_contacts` (
  `organisation_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`organisation_id`,`user_id`),
  KEY `FK_org_contacts_user` (`user_id`),
  CONSTRAINT `FK_org_contacts_org` FOREIGN KEY (`organisation_id`) REFERENCES `organisation` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_org_contacts_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create activity table
CREATE TABLE `activity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `body` text,
  `description` text,
  `project_id` int DEFAULT NULL,
  `date` timestamp NULL DEFAULT NULL,
  `start_time` varchar(255) DEFAULT NULL,
  `end_time` varchar(255) DEFAULT NULL,
  `duration` varchar(255) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `lng` double DEFAULT NULL,
  `created_by_id` int DEFAULT NULL,
  `capacity` int DEFAULT '0',
  `spots_taken` int DEFAULT '0',
  `difficulty` varchar(255) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT '1',
  `status` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_activity_user` (`created_by_id`),
  CONSTRAINT `FK_activity_user` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create activity_organisations table (ManyToMany)
CREATE TABLE `activity_organisations` (
  `activity_id` int NOT NULL,
  `organisation_id` int NOT NULL,
  PRIMARY KEY (`activity_id`,`organisation_id`),
  KEY `FK_act_org_org` (`organisation_id`),
  CONSTRAINT `FK_act_org_act` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_act_org_org` FOREIGN KEY (`organisation_id`) REFERENCES `organisation` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create activity_participants table (ManyToMany)
CREATE TABLE `activity_participants` (
  `activity_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`activity_id`,`user_id`),
  KEY `FK_act_part_user` (`user_id`),
  CONSTRAINT `FK_act_part_act` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_act_part_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create activity ElementCollection tables
CREATE TABLE `activity_skills` (
  `activity_id` int NOT NULL,
  `skills` varchar(255) DEFAULT NULL,
  KEY `FK_act_skills` (`activity_id`),
  CONSTRAINT `FK_act_skills_act` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `activity_tags` (
  `activity_id` int NOT NULL,
  `tags` varchar(255) DEFAULT NULL,
  KEY `FK_act_tags` (`activity_id`),
  CONSTRAINT `FK_act_tags_act` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create appointment table
CREATE TABLE `appointment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `start_date_time` timestamp NULL DEFAULT NULL,
  `end_date_time` timestamp NULL DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `activity_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_appointment_activity` (`activity_id`),
  CONSTRAINT `FK_appointment_activity` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create user_relationship table
CREATE TABLE `user_relationship` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `from_user_id` int DEFAULT NULL,
  `to_user_id` int DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_rel_from` (`from_user_id`),
  KEY `FK_rel_to` (`to_user_id`),
  CONSTRAINT `FK_rel_from` FOREIGN KEY (`from_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_rel_to` FOREIGN KEY (`to_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------
-- INSERT DATA
-- ---------------------------------------------------------

-- Users (Password: 'password', Admin Password: 'admin123')
-- Hash is for BCrypt
INSERT INTO `user` (id, name, email, password, profile_picture, phone, is_active, joined_at, username) VALUES
(1, 'Alice', 'alice@mail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVu4GnG', 'https://api.dicebear.com/9.x/lorelei/svg/seed=1&size=512', '+43 660 111 0001', 1, '2024-03-10 02:30:00', 'alice'),
(2, 'Bob', 'bob@mail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVu4GnG', 'https://api.dicebear.com/9.x/lorelei/svg/seed=8&size=512', '+43 660 111 0002', 1, '2024-03-10 02:30:00', 'bob'),
(3, 'Charlie', 'charlie@mail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVu4GnG', 'https://api.dicebear.com/9.x/lorelei/svg/seed=3&size=512', '+43 660 111 0003', 1, '2024-03-10 02:30:00', 'charlie'),
(4, 'Diana', 'diana@mail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVu4GnG', 'https://api.dicebear.com/9.x/lorelei/svg/seed=4&size=512', '+43 660 111 2222', 1, '2024-03-10 02:30:00', 'diana'),
(5, 'Ethan', 'ethan@mail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVu4GnG', 'https://api.dicebear.com/9.x/lorelei/svg/seed=12&size=512', '+43 660 222 3333', 1, '2024-03-10 02:30:00', 'ethan'),
(6, 'Fiona', 'fiona@mail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVu4GnG', 'https://api.dicebear.com/9.x/lorelei/svg/seed=6&size=512', '+43 660 111 0006', 0, '2024-03-10 02:30:00', 'fiona'),
(7, 'George', 'george@mail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVu4GnG', 'https://api.dicebear.com/9.x/lorelei/svg/seed=13&size=512', '+43 660 111 0007', 1, '2024-03-10 02:30:00', 'george'),
(8, 'Admin User', 'admin@volunteer.app', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgdt9Ad8UXMFVba8hS1m1P9U76qC', 'https://api.dicebear.com/9.x/lorelei/svg/seed=admin&size=512', '+43 000 000 0000', 1, '2024-05-20 10:00:00', 'admin');

-- Members
INSERT INTO `member` (id) VALUES (1), (2), (3), (4), (5), (6), (7), (8);

-- Org Admins
INSERT INTO `org_admin` (id) VALUES (1), (8);

-- User Relationships
INSERT INTO `user_relationship` (from_user_id, to_user_id, type) VALUES
(1, 2, 'FRIEND'),
(1, 3, 'ACQUAINTANT'),
(1, 4, 'RELATIVE'),
(2, 3, 'SIBLING'),
(5, 7, 'PARTNER');

-- Organisations
INSERT INTO `organisation` (id, org_name, lat, lon, profilepicture, created_at, body, deactivated, category) VALUES
(1, 'Tech Aid Association', 48.2082, 16.3738, 'https://logotypes.dev/Protopie?variant=glyph&version=color', '2023-06-15 00:00:00', 'Helping underprivileged communities learn coding skills.', 0, 'Technology'),
(2, 'Green Future Org', 48.3069, 14.2858, 'https://logotypes.dev/Clearscope?variant=glyph&version=color', '2023-09-20 00:00:00', 'Dedicated to sustainability and green innovation.', 0, 'Environment'),
(3, 'Community Connect', 47.0707, 15.4395, 'https://logotypes.dev/Contentful?variant=glyph&version=color', '2023-10-01 00:00:00', 'Connecting volunteers with local social projects.', 0, 'Community'),
(4, 'Education for All', 47.8095, 13.055, 'https://logotypes.dev/Feedly?variant=glyph&version=color', '2024-02-10 00:00:00', 'Providing access to quality education worldwide.', 0, 'Education');

-- Organisation Tags
INSERT INTO `organisation_tags` (organisation_id, tags) VALUES
(1, 'coding'), (1, 'programming'), (1, 'mentorship'),
(2, 'sustainability'), (2, 'climate'), (2, 'eco projects'),
(3, 'volunteering'), (3, 'local projects'), (3, 'social impact'),
(4, 'schools'), (4, 'learning'), (4, 'children');

-- Organisation Contacts
INSERT INTO `organisation_contacts` (organisation_id, user_id) VALUES
(1, 1), (1, 2),
(2, 3),
(3, 4),
(4, 5);

-- Activities
INSERT INTO `activity` (id, title, body, description, project_id, date, start_time, end_time, duration, expires_at, location, lat, lng, created_by_id, capacity, spots_taken, difficulty, is_public, status) VALUES
(1, 'Community Park Cleanup', 'Join our team to clean and maintain the park area.', 'A community-driven initiative to clean up the local park, remove litter, and improve green spaces.', 101, '2025-10-12 09:00:00', '09:00', '14:00', '5 hours', '2025-12-31 23:59:59', 'Blue Mountain Park', 48.3069, 14.2858, 1, 25, 8, 'easy', 1, 'open'),
(2, 'Coding Workshop for Kids', 'Teach kids how to write their first lines of code.', 'Interactive workshop introducing children to programming basics using visual and simple coding tools.', 102, '2025-10-20 09:00:00', '09:00', '12:00', '3 hours', '2025-11-01 23:59:59', 'Tech Learning Center', 48.3060, 14.2865, 3, 15, 5, 'medium', 1, 'upcoming'),
(3, 'Local Food Bank Assistance', 'Help us sort and distribute food to those in need.', 'Support the local food bank by organizing incoming donations and preparing food packages for families.', 103, '2025-11-05 10:00:00', '10:00', '16:00', '6 hours', '2025-12-15 23:59:59', 'City Center Social Hall', 47.0707, 15.4395, 8, 10, 2, 'easy', 1, 'open'),
(4, 'Mountain Reforestation Project', 'Planting trees to restore the local forest ecosystem.', 'A physically demanding but rewarding day of planting native tree species in the mountain area.', 104, '2025-05-15 08:00:00', '08:00', '17:00', '9 hours', '2025-05-30 23:59:59', 'High Peak Forest', 48.4500, 14.1500, 8, 50, 12, 'hard', 1, 'upcoming');

-- Activity Organisations
INSERT INTO `activity_organisations` (activity_id, organisation_id) VALUES
(1, 2),
(2, 1),
(3, 3),
(4, 2);

-- Activity Participants
INSERT INTO `activity_participants` (activity_id, user_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 3), (2, 1),
(3, 5), (3, 6),
(4, 1), (4, 7), (4, 2);

-- Activity Skills
INSERT INTO `activity_skills` (activity_id, skills) VALUES
(1, 'Teamwork'), (1, 'Organization'), (1, 'Physical activity'),
(2, 'Programming'), (2, 'Communication'), (2, 'Teaching'), (2, 'Mentoring'),
(3, 'Organization'), (3, 'Teamwork'),
(4, 'Physical activity'), (4, 'Teamwork');

-- Appointments
INSERT INTO `appointment` (id, title, description, location, start_date_time, end_date_time, created_by, activity_id) VALUES
(1, 'Park Cleanup Session 1', 'Initial clearing', 'Pasching Park', '2025-11-20 09:00:00', '2025-11-20 12:00:00', 1, 1),
(2, 'Coding Workshop Intro', 'First session for beginners', 'Linz Tech Center', '2025-12-05 14:00:00', '2025-12-05 18:00:00', 3, 2);

SET FOREIGN_KEY_CHECKS = 1;
