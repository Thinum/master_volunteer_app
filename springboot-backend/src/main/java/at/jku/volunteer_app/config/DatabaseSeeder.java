package at.jku.volunteer_app.config;

import at.jku.volunteer_app.model.*;
import at.jku.volunteer_app.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.sql.Timestamp;
import java.util.Arrays;

@Configuration
public class DatabaseSeeder {

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            OrganisationRepository organisationRepository,
            ActivityRepository activityRepository,
            UserRelationshipRepository relationshipRepository) {
        return args -> {
            if (userRepository.count() > 0) {
                return; // Already seeded
            }

            // Seed Users
            User alice = new User();
            alice.setName("Alice");
            alice.setEmail("alice@mail.com");
            alice.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=1&size=512");
            alice.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            alice.setActive(true);
            alice = userRepository.save(alice);

            User bob = new User();
            bob.setName("Bob");
            bob.setEmail("bob@mail.com");
            bob.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=8&size=512");
            bob.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            bob.setActive(true);
            bob = userRepository.save(bob);

            User charlie = new User();
            charlie.setName("Charlie");
            charlie.setEmail("charlie@mail.com");
            charlie.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=3&size=512");
            charlie.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            charlie.setActive(true);
            charlie = userRepository.save(charlie);

            User diana = new User();
            diana.setName("Diana");
            diana.setEmail("diana@mail.com");
            diana.setPhone("+43 660 111 2222");
            diana.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=4&size=512");
            diana.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            diana.setActive(true);
            diana = userRepository.save(diana);

            User ethan = new User();
            ethan.setName("Ethan");
            ethan.setEmail("ethan@mail.com");
            ethan.setPhone("+43 660 222 3333");
            ethan.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=12&size=512");
            ethan.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            ethan.setActive(true);
            ethan = userRepository.save(ethan);

            User fiona = new User();
            fiona.setName("Fiona");
            fiona.setEmail("fiona@mail.com");
            fiona.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=6&size=512");
            fiona.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            fiona.setActive(false);
            fiona = userRepository.save(fiona);

            User george = new User();
            george.setName("George");
            george.setEmail("george@mail.com");
            george.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=13&size=512");
            george.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            george.setActive(true);
            george = userRepository.save(george);

            // Seed Organisations
            Organisation techAid = new Organisation();
            techAid.setOrgName("Tech Aid Association");
            techAid.setLocation(new Location(48.2082, 16.3738));
            techAid.setProfilepicture("https://logotypes.dev/Protopie?variant=glyph&version=color");
            techAid.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            techAid.setBody("Helping underprivileged communities learn coding skills.");
            techAid.setCategory(OrganisationCategory.Technology);
            techAid.setTags(Arrays.asList("coding", "programming", "mentorship", "youth", "digital skills"));
            techAid.setOrgContacts(Arrays.asList(alice, bob));
            techAid = organisationRepository.save(techAid);

            Organisation greenFuture = new Organisation();
            greenFuture.setOrgName("Green Future Org");
            greenFuture.setLocation(new Location(48.3069, 14.2858));
            greenFuture.setProfilepicture("https://logotypes.dev/Clearscope?variant=glyph&version=color");
            greenFuture.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            greenFuture.setBody("Dedicated to sustainability and green innovation.");
            greenFuture.setCategory(OrganisationCategory.Environment);
            greenFuture.setTags(Arrays.asList("sustainability", "climate", "renewable energy", "eco projects"));
            greenFuture.setOrgContacts(Arrays.asList(charlie));
            greenFuture = organisationRepository.save(greenFuture);

            // Seed Activities
            Activity cleanup = new Activity();
            cleanup.setTitle("Community Park Cleanup");
            cleanup.setBody("Join our team to clean and maintain the park area. Gloves and tools provided.");
            cleanup.setDescription("A community-driven initiative to clean up the local park, remove litter, and improve green spaces.");
            cleanup.setProjectId(101);
            cleanup.setOrganisations(Arrays.asList(techAid));
            cleanup.setDate(new Timestamp(System.currentTimeMillis() + 86400000L * 30)); // 30 days later
            cleanup.setStartTime("09:00");
            cleanup.setEndTime("14:00");
            cleanup.setDuration("5 hours");
            cleanup.setLocation("Blue Mountain Park");
            cleanup.setCoordinates(new Coordinates(48.3069, 14.2858));
            cleanup.setFriends(Arrays.asList(alice, bob, charlie, diana));
            cleanup.setCreatedBy(alice);
            cleanup.setSkills(Arrays.asList("Environment", "Teamwork", "Physical Labor"));
            cleanup.setCapacity(25);
            cleanup.setSpotsTaken(8);
            cleanup.setStatus("open");
            cleanup.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            
            Appointment app1 = new Appointment();
            app1.setTitle("Park Cleanup");
            app1.setDescription("Help clean up Pasching Park and recycle waste.");
            app1.setLocation("Pasching Park");
            app1.setStartDateTime(new Timestamp(System.currentTimeMillis() + 86400000L * 30));
            app1.setEndDateTime(new Timestamp(System.currentTimeMillis() + 86400000L * 30 + 3600000L * 3));
            app1.setCreatedBy(alice.getId());
            app1.setActivity(cleanup);
            cleanup.setAppointments(Arrays.asList(app1));
            
            activityRepository.save(cleanup);

            Activity coding = new Activity();
            coding.setTitle("Coding Workshop for Kids");
            coding.setBody("Teach kids how to write their first lines of code. A fun and educational event!");
            coding.setDescription("Interactive workshop introducing children to programming basics using visual and simple coding tools.");
            coding.setProjectId(102);
            coding.setOrganisations(Arrays.asList(greenFuture));
            coding.setDate(new Timestamp(System.currentTimeMillis() + 86400000L * 40)); // 40 days later
            coding.setStartTime("09:00");
            coding.setEndTime("12:00");
            coding.setDuration("3 hours");
            coding.setLocation("Tech Learning Center");
            coding.setCoordinates(new Coordinates(48.3060, 14.2865));
            coding.setFriends(Arrays.asList(charlie, alice));
            coding.setCreatedBy(charlie);
            coding.setSkills(Arrays.asList("Coding", "Teaching", "Patience"));
            coding.setCapacity(15);
            coding.setSpotsTaken(5);
            coding.setStatus("upcoming");
            coding.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            
            Appointment app2 = new Appointment();
            app2.setTitle("Coding Workshop");
            app2.setDescription("Teach basic programming concepts to children aged 10–14.");
            app2.setLocation("Linz Tech Center");
            app2.setStartDateTime(new Timestamp(System.currentTimeMillis() + 86400000L * 40));
            app2.setEndDateTime(new Timestamp(System.currentTimeMillis() + 86400000L * 40 + 3600000L * 4));
            app2.setCreatedBy(charlie.getId());
            app2.setActivity(coding);
            coding.setAppointments(Arrays.asList(app2));
            
            activityRepository.save(coding);

            // Seed Relationships (simplified based on mock-users.ts)
            UserRelationship rel1 = new UserRelationship();
            rel1.setFromUser(alice);
            rel1.setToUser(bob);
            rel1.setType(RelationshipType.FRIEND);
            relationshipRepository.save(rel1);

            UserRelationship rel2 = new UserRelationship();
            rel2.setFromUser(bob);
            rel2.setToUser(charlie);
            rel2.setType(RelationshipType.SIBLING);
            relationshipRepository.save(rel2);
        };
    }
}
