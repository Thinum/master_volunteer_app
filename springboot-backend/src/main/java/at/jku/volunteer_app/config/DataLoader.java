package at.jku.volunteer_app.config;

import at.jku.volunteer_app.model.*;
import at.jku.volunteer_app.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository,
                                   OrganisationRepository organisationRepository,
                                   ActivityRepository activityRepository,
                                   UserRelationshipRepository relationshipRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() > 0) {
                return; // Data already loaded
            }

            // 1. Create Users (using Member and Org_Admin to match JOINED inheritance)
            Org_Admin alice = new Org_Admin();
            alice.setName("Alice");
            alice.setEmail("alice@mail.com");
            alice.setPassword(passwordEncoder.encode("password"));
            alice.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=1&size=512");
            alice.setPhone("+43 660 111 0001");
            alice.setActive(true);
            alice.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            alice.setUsername("alice");

            Member bob = new Member();
            bob.setName("Bob");
            bob.setEmail("bob@mail.com");
            bob.setPassword(passwordEncoder.encode("password"));
            bob.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=8&size=512");
            bob.setPhone("+43 660 111 0002");
            bob.setActive(true);
            bob.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            bob.setUsername("bob");

            Member charlie = new Member();
            charlie.setName("Charlie");
            charlie.setEmail("charlie@mail.com");
            charlie.setPassword(passwordEncoder.encode("password"));
            charlie.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=3&size=512");
            charlie.setPhone("+43 660 111 0003");
            charlie.setActive(true);
            charlie.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            charlie.setUsername("charlie");

            Member diana = new Member();
            diana.setName("Diana");
            diana.setEmail("diana@mail.com");
            diana.setPassword(passwordEncoder.encode("password"));
            diana.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=4&size=512");
            diana.setPhone("+43 660 111 2222");
            diana.setActive(true);
            diana.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            diana.setUsername("diana");

            Member ethan = new Member();
            ethan.setName("Ethan");
            ethan.setEmail("ethan@mail.com");
            ethan.setPassword(passwordEncoder.encode("password"));
            ethan.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=12&size=512");
            ethan.setPhone("+43 660 222 3333");
            ethan.setActive(true);
            ethan.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            ethan.setUsername("ethan");

            Member fiona = new Member();
            fiona.setName("Fiona");
            fiona.setEmail("fiona@mail.com");
            fiona.setPassword(passwordEncoder.encode("password"));
            fiona.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=6&size=512");
            fiona.setPhone("+43 660 111 0006");
            fiona.setActive(false);
            fiona.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            fiona.setUsername("fiona");

            Member george = new Member();
            george.setName("George");
            george.setEmail("george@mail.com");
            george.setPassword(passwordEncoder.encode("password"));
            george.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=13&size=512");
            george.setPhone("+43 660 111 0007");
            george.setActive(true);
            george.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            george.setUsername("george");
            
            // Admin User
            Org_Admin admin = new Org_Admin();
            admin.setName("Admin User");
            admin.setEmail("admin@volunteer.app");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=admin&size=512");
            admin.setPhone("+43 000 000 0000");
            admin.setActive(true);
            admin.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            admin.setUsername("admin");

            userRepository.saveAll(Arrays.asList(alice, bob, charlie, diana, ethan, fiona, george, admin));


            // 2. Create User Relationships
            relationshipRepository.save(new UserRelationship(null, alice, bob, RelationshipType.FRIEND));
            relationshipRepository.save(new UserRelationship(null, alice, charlie, RelationshipType.ACQUAINTANT));
            relationshipRepository.save(new UserRelationship(null, alice, diana, RelationshipType.RELATIVE));
            relationshipRepository.save(new UserRelationship(null, bob, charlie, RelationshipType.SIBLING));
            relationshipRepository.save(new UserRelationship(null, ethan, george, RelationshipType.PARTNER));

            // 3. Create Organisations
            Organisation techAid = new Organisation(0, "Tech Aid Association", new Location(48.2082, 16.3738), "https://logotypes.dev/Protopie?variant=glyph&version=color", new Timestamp(System.currentTimeMillis()), "Helping underprivileged communities learn coding skills.", false, null, OrganisationCategory.Technology, new java.util.HashSet<>(Arrays.asList("coding", "programming", "mentorship")), new java.util.HashSet<>(Arrays.asList(alice, bob)));
            Organisation greenFuture = new Organisation(0, "Green Future Org", new Location(48.3069, 14.2858), "https://logotypes.dev/Clearscope?variant=glyph&version=color", new Timestamp(System.currentTimeMillis()), "Dedicated to sustainability and green innovation.", false, null, OrganisationCategory.Environment, new java.util.HashSet<>(Arrays.asList("sustainability", "climate", "eco projects")), new java.util.HashSet<>(List.of(charlie)));
            Organisation communityConnect = new Organisation(0, "Community Connect", new Location(47.0707, 15.4395), "https://logotypes.dev/Contentful?variant=glyph&version=color", new Timestamp(System.currentTimeMillis()), "Connecting volunteers with local social projects.", false, null, OrganisationCategory.Community, new java.util.HashSet<>(Arrays.asList("volunteering", "local projects", "social impact")), new java.util.HashSet<>(List.of(diana)));
            Organisation eduForAll = new Organisation(0, "Education for All", new Location(47.8095, 13.055), "https://logotypes.dev/Feedly?variant=glyph&version=color", new Timestamp(System.currentTimeMillis()), "Providing access to quality education worldwide.", false, null, OrganisationCategory.Education, new java.util.HashSet<>(Arrays.asList("schools", "learning", "children")), new java.util.HashSet<>(List.of(ethan)));
            
            List<Organisation> organisations = Arrays.asList(techAid, greenFuture, communityConnect, eduForAll);
            organisationRepository.saveAll(organisations);

            // 4. Create Activities
            Activity parkCleanup = new Activity();
            parkCleanup.setTitle("Community Park Cleanup");
            parkCleanup.setBody("Join our team to clean and maintain the park area. Gloves and tools provided.");
            parkCleanup.setDescription("A community-driven initiative to clean up the local park, remove litter, and improve green spaces.");
            parkCleanup.setOrganisations(List.of(greenFuture));
            parkCleanup.setDate(Timestamp.valueOf("2025-10-12 09:00:00"));
            parkCleanup.setStartTime("09:00");
            parkCleanup.setEndTime("14:00");
            parkCleanup.setDuration("5 hours");
            parkCleanup.setExpiresAt(Timestamp.valueOf("2025-12-31 23:59:59"));
            parkCleanup.setLocation("Blue Mountain Park");
            parkCleanup.setCoordinates(new Coordinates(48.3069, 14.2858));
            parkCleanup.setCreatedBy(alice);
            parkCleanup.setSkills(Arrays.asList("Teamwork", "Organization", "Physical activity"));
            parkCleanup.setCapacity(25);
            parkCleanup.setSpotsTaken(8);
            parkCleanup.setDifficulty("easy");
            parkCleanup.setPublic(true);
            parkCleanup.setStatus("open");
            parkCleanup.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            parkCleanup.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            parkCleanup.setFriends(Arrays.asList(alice, bob, charlie, diana));

            Activity codingWorkshop = new Activity();
            codingWorkshop.setTitle("Coding Workshop for Kids");
            codingWorkshop.setBody("Teach kids how to write their first lines of code. A fun and educational event!");
            codingWorkshop.setDescription("Interactive workshop introducing children to programming basics using visual and simple coding tools.");
            codingWorkshop.setOrganisations(List.of(techAid));
            codingWorkshop.setDate(Timestamp.valueOf("2025-10-20 09:00:00"));
            codingWorkshop.setStartTime("09:00");
            codingWorkshop.setEndTime("12:00");
            codingWorkshop.setDuration("3 hours");
            codingWorkshop.setExpiresAt(Timestamp.valueOf("2025-11-01 23:59:59"));
            codingWorkshop.setLocation("Tech Learning Center");
            codingWorkshop.setCoordinates(new Coordinates(48.3060, 14.2865));
            codingWorkshop.setCreatedBy(charlie);
            codingWorkshop.setSkills(Arrays.asList("Programming", "Communication", "Teaching", "Mentoring"));
            codingWorkshop.setCapacity(15);
            codingWorkshop.setSpotsTaken(5);
            codingWorkshop.setDifficulty("medium");
            codingWorkshop.setPublic(true);
            codingWorkshop.setStatus("upcoming");
            codingWorkshop.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            codingWorkshop.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            codingWorkshop.setFriends(Arrays.asList(charlie, alice));

            // Extended Activity 1
            Activity foodBank = new Activity();
            foodBank.setTitle("Local Food Bank Assistance");
            foodBank.setBody("Help us sort and distribute food to those in need.");
            foodBank.setDescription("Support the local food bank by organizing incoming donations and preparing food packages for families.");
            foodBank.setOrganisations(List.of(communityConnect));
            foodBank.setDate(Timestamp.valueOf("2025-11-05 10:00:00"));
            foodBank.setStartTime("10:00");
            foodBank.setEndTime("16:00");
            foodBank.setDuration("6 hours");
            foodBank.setExpiresAt(Timestamp.valueOf("2025-12-15 23:59:59"));
            foodBank.setLocation("City Center Social Hall");
            foodBank.setCoordinates(new Coordinates(47.0707, 15.4395));
            foodBank.setCreatedBy(admin);
            foodBank.setSkills(Arrays.asList("Organization", "Teamwork"));
            foodBank.setCapacity(10);
            foodBank.setSpotsTaken(2);
            foodBank.setDifficulty("easy");
            foodBank.setPublic(true);
            foodBank.setStatus("open");
            foodBank.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            foodBank.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            foodBank.setFriends(Arrays.asList(ethan, fiona));

            // Extended Activity 2
            Activity reforestation = new Activity();
            reforestation.setTitle("Mountain Reforestation Project");
            reforestation.setBody("Planting trees to restore the local forest ecosystem.");
            reforestation.setDescription("A physically demanding but rewarding day of planting native tree species in the mountain area.");
            reforestation.setOrganisations(List.of(greenFuture));
            reforestation.setDate(Timestamp.valueOf("2025-05-15 08:00:00"));
            reforestation.setStartTime("08:00");
            reforestation.setEndTime("17:00");
            reforestation.setDuration("9 hours");
            reforestation.setExpiresAt(Timestamp.valueOf("2025-05-30 23:59:59"));
            reforestation.setLocation("High Peak Forest");
            reforestation.setCoordinates(new Coordinates(48.4500, 14.1500));
            reforestation.setCreatedBy(admin);
            reforestation.setSkills(Arrays.asList("Physical activity", "Teamwork"));
            reforestation.setCapacity(50);
            reforestation.setSpotsTaken(12);
            reforestation.setDifficulty("hard");
            reforestation.setPublic(true);
            reforestation.setStatus("upcoming");
            reforestation.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            reforestation.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            reforestation.setFriends(Arrays.asList(alice, george, bob));

            activityRepository.saveAll(Arrays.asList(parkCleanup, codingWorkshop, foodBank, reforestation));

            // 5. Create Appointments
            Appointment appt1 = new Appointment(0, "Park Cleanup Session 1", "Initial clearing", "Pasching Park", Timestamp.valueOf("2025-11-20 09:00:00"), Timestamp.valueOf("2025-11-20 12:00:00"), alice.getId(), parkCleanup);
            Appointment appt2 = new Appointment(0, "Coding Workshop Intro", "First session for beginners", "Linz Tech Center", Timestamp.valueOf("2025-12-05 14:00:00"), Timestamp.valueOf("2025-12-05 18:00:00"), charlie.getId(), codingWorkshop);
            
            // Add appointments to activities
            parkCleanup.setAppointments(List.of(appt1));
            codingWorkshop.setAppointments(List.of(appt2));
            
            activityRepository.save(parkCleanup);
            activityRepository.save(codingWorkshop);

            System.out.println("Database seeded successfully!");
        };
    }
}
