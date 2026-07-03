package at.jku.volunteer_app.config;

import at.jku.volunteer_app.model.*;
import at.jku.volunteer_app.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.sql.Timestamp;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository,
                                   OrganisationRepository organisationRepository,
                                   ActivityRepository activityRepository,
                                   UserRelationshipRepository relationshipRepository,
                                   ForumEntryRepository forumEntryRepository,
                                   ForumReplyRepository forumReplyRepository,
                                   ChatConversationRepository chatConversationRepository,
                                   ChatMessageRepository chatMessageRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() > 0) {
                seedCommunityData(forumEntryRepository, forumReplyRepository, chatConversationRepository, chatMessageRepository);
                return; // Data already loaded
            }

            // 1. Create Users (using Member and Org_Admin to match JOINED inheritance)
            Org_Admin alice = new Org_Admin();
            alice.setName("Alice");
            alice.setEmail("alice@mail.com");
            alice.setPassword(passwordEncoder.encode("password"));
            alice.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=1&size=512");
            alice.setPhone("+43 660 111 0001");
            alice.setSkills(Arrays.asList("Teamwork", "Communication", "Mentoring"));
            alice.setInterests(Arrays.asList("Teaching", "Environmental Work", "Event Support"));
            alice.setActive(true);
            alice.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            alice.setUsername("alice");

            Member bob = new Member();
            bob.setName("Bob");
            bob.setEmail("bob@mail.com");
            bob.setPassword(passwordEncoder.encode("password"));
            bob.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=8&size=512");
            bob.setPhone("+43 660 111 0002");
            bob.setSkills(Arrays.asList("Organization", "Physical activity"));
            bob.setInterests(Arrays.asList("Fundraising", "Event Support"));
            bob.setActive(true);
            bob.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            bob.setUsername("bob");

            Member charlie = new Member();
            charlie.setName("Charlie");
            charlie.setEmail("charlie@mail.com");
            charlie.setPassword(passwordEncoder.encode("password"));
            charlie.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=3&size=512");
            charlie.setPhone("+43 660 111 0003");
            charlie.setSkills(Arrays.asList("Programming", "Problem-Solving"));
            charlie.setInterests(Arrays.asList("Teaching", "Social Media"));
            charlie.setActive(true);
            charlie.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            charlie.setUsername("charlie");

            Member diana = new Member();
            diana.setName("Diana");
            diana.setEmail("diana@mail.com");
            diana.setPassword(passwordEncoder.encode("password"));
            diana.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=4&size=512");
            diana.setPhone("+43 660 111 2222");
            diana.setSkills(Arrays.asList("First Aid", "Communication"));
            diana.setInterests(Arrays.asList("Event Support", "Fundraising"));
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

            Member tom = new Member();
            tom.setName("Tom");
            tom.setEmail("tom@mail.com");
            tom.setPassword(passwordEncoder.encode("password"));
            tom.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=tom&size=512");
            tom.setPhone("+43 660 333 1001");
            tom.setActive(true);
            tom.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            tom.setUsername("tom");

            Member sandra = new Member();
            sandra.setName("Sandra");
            sandra.setEmail("sandra@mail.com");
            sandra.setPassword(passwordEncoder.encode("password"));
            sandra.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=sandra&size=512");
            sandra.setPhone("+43 660 333 1002");
            sandra.setActive(true);
            sandra.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            sandra.setUsername("sandra");

            Member mia = new Member();
            mia.setName("Mia");
            mia.setEmail("mia@mail.com");
            mia.setPassword(passwordEncoder.encode("password"));
            mia.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=mia&size=512");
            mia.setPhone("+43 660 333 1003");
            mia.setActive(true);
            mia.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            mia.setUsername("mia");

            Member bella = new Member();
            bella.setName("Bella");
            bella.setEmail("bella@mail.com");
            bella.setPassword(passwordEncoder.encode("password"));
            bella.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=bella&size=512");
            bella.setPhone("+43 660 333 1004");
            bella.setActive(true);
            bella.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            bella.setUsername("bella");

            Member sophia = new Member();
            sophia.setName("Sophia");
            sophia.setEmail("sophia@mail.com");
            sophia.setPassword(passwordEncoder.encode("password"));
            sophia.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=sophia&size=512");
            sophia.setPhone("+43 660 333 1005");
            sophia.setActive(true);
            sophia.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            sophia.setUsername("sophia");

            Member lukas = new Member();
            lukas.setName("Lukas");
            lukas.setEmail("lukas@mail.com");
            lukas.setPassword(passwordEncoder.encode("password"));
            lukas.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=lukas&size=512");
            lukas.setPhone("+43 660 333 1006");
            lukas.setActive(true);
            lukas.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            lukas.setUsername("lukas");

            Member emma = new Member();
            emma.setName("Emma");
            emma.setEmail("emma@mail.com");
            emma.setPassword(passwordEncoder.encode("password"));
            emma.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=emma&size=512");
            emma.setPhone("+43 660 333 1007");
            emma.setActive(true);
            emma.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            emma.setUsername("emma");

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

            userRepository.saveAll(Arrays.asList(alice, bob, charlie,
                    diana, ethan, fiona, george, tom, sandra, mia,
                    bella, sophia, lukas, emma, admin));


            // 2. Create User Relationships
            // FRIEND
            relationshipRepository.save(new UserRelationship(null, alice, bob, RelationshipType.FRIEND, 85));
            relationshipRepository.save(new UserRelationship(null, tom, sandra, RelationshipType.FRIEND, 75));
            relationshipRepository.save(new UserRelationship(null, tom, bella, RelationshipType.FRIEND, 80));
            relationshipRepository.save(new UserRelationship(null, sandra, mia, RelationshipType.FRIEND, 70));
            relationshipRepository.save(new UserRelationship(null, lukas, tom, RelationshipType.FRIEND, 65));
            relationshipRepository.save(new UserRelationship(null, emma, bella, RelationshipType.FRIEND, 88));
            // PARTNER
            relationshipRepository.save(new UserRelationship(null, ethan, george, RelationshipType.PARTNER, 78));
            // ACQUAINTANT
            relationshipRepository.save(new UserRelationship(null, alice, charlie, RelationshipType.ACQUAINTANT, 60));
            relationshipRepository.save(new UserRelationship(null, mia, sophia, RelationshipType.ACQUAINTANT, 55));
            relationshipRepository.save(new UserRelationship(null, george, tom, RelationshipType.ACQUAINTANT, 50));
            // RELATIVE
            relationshipRepository.save(new UserRelationship(null, alice, diana, RelationshipType.RELATIVE, 92));
            // SIBLING
            relationshipRepository.save(new UserRelationship(null, bob, charlie, RelationshipType.SIBLING, 70));
            relationshipRepository.save(new UserRelationship(null, bella, sophia, RelationshipType.SIBLING, 95));
            // PARENT
            relationshipRepository.save(new UserRelationship(null, diana, alice, RelationshipType.PARENT, 90));
            // CHILD
            relationshipRepository.save(new UserRelationship(null, alice, diana, RelationshipType.CHILD, 90));

            // 3. Create Organisations
            Organisation techAid = createOrganisation(
                    "Tech Aid Association",
                    new Location(48.2082, 16.3738),
                    "https://logotypes.dev/Protopie?variant=glyph&version=color",
                    "Helping underprivileged communities learn coding skills.",
                    OrganisationCategory.Technology,
                    Set.of("coding", "programming", "mentorship"),
                    Set.of(alice, bob)
            );

            Organisation greenFuture = createOrganisation(
                    "Green Future Org",
                    new Location(48.3069, 14.2858),
                    "https://logotypes.dev/Clearscope?variant=glyph&version=color",
                    "Dedicated to sustainability and green innovation.",
                    OrganisationCategory.Environment,
                    Set.of("sustainability", "climate", "eco projects"),
                    Set.of(charlie)
            );

            Organisation communityConnect = createOrganisation(
                    "Community Connect",
                    new Location(47.0707, 15.4395),
                    "https://logotypes.dev/Contentful?variant=glyph&version=color",
                    "Connecting volunteers with local social projects.",
                    OrganisationCategory.Community,
                    Set.of("volunteering", "local projects", "social impact"),
                    Set.of(diana)
            );

            Organisation eduForAll = createOrganisation(
                    "Education for All",
                    new Location(47.8095, 13.055),
                    "https://logotypes.dev/Feedly?variant=glyph&version=color",
                    "Providing access to quality education worldwide.",
                    OrganisationCategory.Education,
                    Set.of("schools", "learning", "children"),
                    Set.of(ethan)
            );

            Organisation herzFuerMenschen = createOrganisation(
                    "Herz für Menschen",
                    new Location(48.2100, 16.3700),
                    "https://logotypes.dev/Notion?variant=glyph&version=color",
                    "Supporting vulnerable people through community initiatives.",
                    OrganisationCategory.Community,
                    Set.of("charity", "community", "social support"),
                    Set.of(sandra)
            );

            Organisation localLearningSupport = createOrganisation(
                    "Local Learning Support",
                    new Location(48.3000, 14.2900),
                    "https://logotypes.dev/Linear?variant=glyph&version=color",
                    "Tutoring and mentoring for students.",
                    OrganisationCategory.Education,
                    Set.of("education", "tutoring", "mentoring"),
                    Set.of(mia)
            );

            Organisation pawsAndHearts = createOrganisation(
                    "Paws & Hearts",
                    new Location(48.3200, 14.3000),
                    "https://logotypes.dev/Figma?variant=glyph&version=color",
                    "Helping animals find safe homes.",
                    OrganisationCategory.Community,
                    Set.of("animals", "rescue", "shelter"),
                    Set.of(emma)
            );

            Organisation volunteerFire = createOrganisation(
                    "Volunteer Fire Service Linz",
                    new Location(48.3050, 14.2860),
                    "https://logotypes.dev/Firefox?variant=glyph&version=color",
                    "Volunteer fire and emergency support.",
                    OrganisationCategory.Community,
                    Set.of("fire service", "emergency", "rescue"),
                    Set.of(lukas)
            );

            List<Organisation> organisations = Arrays.asList(
                    techAid,
                    greenFuture,
                    communityConnect,
                    eduForAll,
                    herzFuerMenschen,
                    localLearningSupport,
                    pawsAndHearts,
                    volunteerFire
            );
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
            parkCleanup.setParticipants(Arrays.asList(alice, bob, charlie, diana));

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
            codingWorkshop.setParticipants(Arrays.asList(charlie, alice));

            Activity charityConcert = new Activity();
            charityConcert.setTitle("Setting up a Charity Concert for Trauma Recovery");
            charityConcert.setBody("Help organize a charity concert supporting trauma recovery programs.");
            charityConcert.setDescription("Volunteers assist with planning, logistics, fundraising and coordination.");
            charityConcert.setOrganisations(List.of(herzFuerMenschen));
            charityConcert.setDate(Timestamp.valueOf("2025-12-10 15:00:00"));
            charityConcert.setStartTime("15:00");
            charityConcert.setEndTime("20:00");
            charityConcert.setDuration("5 hours");
            charityConcert.setExpiresAt(Timestamp.valueOf("2025-12-31 23:59:59"));
            charityConcert.setLocation("Linz Community Hall");
            charityConcert.setCoordinates(new Coordinates(48.3069, 14.2858));
            charityConcert.setCreatedBy(sandra);
            charityConcert.setSkills(Arrays.asList(
                    "Event Planning",
                    "Communication",
                    "Fundraising",
                    "Teamwork"
            ));
            charityConcert.setCapacity(50);
            charityConcert.setSpotsTaken(18);
            charityConcert.setDifficulty("medium");
            charityConcert.setPublic(true);
            charityConcert.setStatus("open");
            charityConcert.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            charityConcert.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            charityConcert.setParticipants(Arrays.asList(
                    sandra,
                    tom,
                    bella,
                    mia,
                    sophia
            ));

            Activity winterSupport = new Activity();
            winterSupport.setTitle("Winter Support Initiative - Food Distribution");
            winterSupport.setBody("Distribute food and winter supplies.");
            winterSupport.setDescription("Community goal activity supporting vulnerable people during winter.");
            winterSupport.setOrganisations(List.of(herzFuerMenschen));
            winterSupport.setDate(Timestamp.valueOf("2025-12-18 09:00:00"));
            winterSupport.setStartTime("09:00");
            winterSupport.setEndTime("15:00");
            winterSupport.setDuration("6 hours");
            winterSupport.setExpiresAt(Timestamp.valueOf("2025-12-31 23:59:59"));
            winterSupport.setLocation("Community Center Linz");
            winterSupport.setCoordinates(new Coordinates(48.3069, 14.2858));
            winterSupport.setCreatedBy(sandra);
            winterSupport.setSkills(Arrays.asList(
                    "Teamwork",
                    "Community Outreach",
                    "Organization"
            ));
            winterSupport.setCapacity(30);
            winterSupport.setSpotsTaken(12);
            winterSupport.setDifficulty("easy");
            winterSupport.setPublic(true);
            winterSupport.setStatus("open");
            winterSupport.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            winterSupport.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            winterSupport.setParticipants(Arrays.asList(
                    tom,
                    sandra,
                    bella,
                    emma
            ));

            Activity tutoringSession = new Activity();
            tutoringSession.setTitle("Math Tutoring Session");
            tutoringSession.setBody("Support students preparing for exams.");
            tutoringSession.setDescription("One-on-one tutoring and learning support.");
            tutoringSession.setOrganisations(List.of(localLearningSupport));
            tutoringSession.setDate(Timestamp.valueOf("2025-11-08 16:00:00"));
            tutoringSession.setStartTime("16:00");
            tutoringSession.setEndTime("19:00");
            tutoringSession.setDuration("3 hours");
            tutoringSession.setExpiresAt(Timestamp.valueOf("2025-12-01 23:59:59"));
            tutoringSession.setLocation("Learning Center Linz");
            tutoringSession.setCoordinates(new Coordinates(48.3010, 14.2880));
            tutoringSession.setCreatedBy(mia);
            tutoringSession.setSkills(Arrays.asList(
                    "Teaching",
                    "Communication",
                    "Mentoring",
                    "Mathematics"
            ));
            tutoringSession.setCapacity(20);
            tutoringSession.setSpotsTaken(7);
            tutoringSession.setDifficulty("medium");
            tutoringSession.setPublic(true);
            tutoringSession.setStatus("open");
            tutoringSession.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            tutoringSession.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            tutoringSession.setParticipants(Arrays.asList(
                    mia,
                    sophia,
                    emma
            ));

            Activity animalCare = new Activity();
            animalCare.setTitle("Animal Shelter Care Day");
            animalCare.setBody("Help care for animals awaiting adoption.");
            animalCare.setDescription("Volunteers assist with feeding, cleaning and socializing shelter animals.");
            animalCare.setOrganisations(List.of(pawsAndHearts));
            animalCare.setDate(Timestamp.valueOf("2025-11-09 09:00:00"));
            animalCare.setStartTime("09:00");
            animalCare.setEndTime("13:00");
            animalCare.setDuration("4 hours");
            animalCare.setExpiresAt(Timestamp.valueOf("2025-12-01 23:59:59"));
            animalCare.setLocation("Paws & Hearts Shelter");
            animalCare.setCoordinates(new Coordinates(48.3200, 14.3000));
            animalCare.setCreatedBy(emma);
            animalCare.setSkills(Arrays.asList(
                    "Animal Care",
                    "Teamwork",
                    "Responsibility",
                    "Cleaning"
            ));
            animalCare.setCapacity(20);
            animalCare.setSpotsTaken(6);
            animalCare.setDifficulty("easy");
            animalCare.setPublic(true);
            animalCare.setStatus("open");
            animalCare.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            animalCare.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            animalCare.setParticipants(Arrays.asList(
                    emma,
                    bella,
                    sophia
            ));

            Activity fireTraining = new Activity();
            fireTraining.setTitle("Volunteer Firefighter Training");
            fireTraining.setBody("Learn emergency response and rescue procedures.");
            fireTraining.setDescription("Practical training for volunteer firefighters.");
            fireTraining.setOrganisations(List.of(volunteerFire));
            fireTraining.setDate(Timestamp.valueOf("2025-11-20 18:00:00"));
            fireTraining.setStartTime("18:00");
            fireTraining.setEndTime("21:00");
            fireTraining.setDuration("3 hours");
            fireTraining.setExpiresAt(Timestamp.valueOf("2025-12-31 23:59:59"));
            fireTraining.setLocation("Volunteer Fire Station Linz");
            fireTraining.setCoordinates(new Coordinates(48.3050, 14.2860));
            fireTraining.setCreatedBy(lukas);
            fireTraining.setSkills(Arrays.asList(
                    "Emergency Response",
                    "First Aid",
                    "Teamwork",
                    "Physical Fitness"
            ));
            fireTraining.setCapacity(25);
            fireTraining.setSpotsTaken(8);
            fireTraining.setDifficulty("hard");
            fireTraining.setPublic(true);
            fireTraining.setStatus("open");
            fireTraining.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            fireTraining.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            fireTraining.setParticipants(Arrays.asList(
                    lukas,
                    tom,
                    george
            ));

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
            foodBank.setParticipants(Arrays.asList(ethan, fiona));

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
            reforestation.setParticipants(Arrays.asList(alice, george, bob));

            activityRepository.saveAll(Arrays.asList(
                    parkCleanup,
                    codingWorkshop,
                    foodBank,
                    reforestation,
                    charityConcert,
                    winterSupport,
                    tutoringSession,
                    animalCare,
                    fireTraining
            ));

            // 5. Create Appointments
            Appointment appt1 = new Appointment(0, "Park Cleanup Session 1", "Initial clearing", "Pasching Park", Timestamp.valueOf("2025-11-20 09:00:00"), Timestamp.valueOf("2025-11-20 12:00:00"), alice.getId(), parkCleanup);
            Appointment appt2 = new Appointment(0, "Coding Workshop Intro", "First session for beginners", "Linz Tech Center", Timestamp.valueOf("2025-12-05 14:00:00"), Timestamp.valueOf("2025-12-05 18:00:00"), charlie.getId(), codingWorkshop);
            Appointment appt3 = new Appointment(0, "Concert Planning Meeting", "Initial planning and task assignment", "Linz Community Hall", Timestamp.valueOf("2025-11-15 18:00:00"), Timestamp.valueOf("2025-11-15 20:00:00"), sandra.getId(), charityConcert);
            Appointment appt4 = new Appointment(0, "Fundraising Coordination", "Coordinate sponsors and donations", "Linz Community Hall", Timestamp.valueOf("2025-11-22 17:00:00"), Timestamp.valueOf("2025-11-22 19:00:00"), sandra.getId(), charityConcert);
            Appointment appt5 = new Appointment(0, "Final Concert Setup", "Prepare stage, seating and logistics", "Linz Community Hall", Timestamp.valueOf("2025-12-09 14:00:00"), Timestamp.valueOf("2025-12-09 19:00:00"), sandra.getId(), charityConcert);
            Appointment appt6 = new Appointment(0, "Food Package Assembly", "Prepare food packages for distribution", "Community Center Linz", Timestamp.valueOf("2025-12-12 10:00:00"), Timestamp.valueOf("2025-12-12 15:00:00"), sandra.getId(), winterSupport);
            Appointment appt7 = new Appointment(0, "Winter Clothing Sorting", "Sort donated clothing items", "Community Center Linz", Timestamp.valueOf("2025-12-15 09:00:00"), Timestamp.valueOf("2025-12-15 13:00:00"), sandra.getId(), winterSupport);
            Appointment appt8 = new Appointment(0, "Food Distribution Day", "Distribute packages to families", "Community Center Linz", Timestamp.valueOf("2025-12-18 09:00:00"), Timestamp.valueOf("2025-12-18 15:00:00"), sandra.getId(), winterSupport);
            Appointment appt9 = new Appointment(0, "Math Tutoring Group A", "Support students with mathematics", "Learning Center Linz", Timestamp.valueOf("2025-11-08 16:00:00"), Timestamp.valueOf("2025-11-08 19:00:00"), mia.getId(), tutoringSession);
            Appointment appt10 = new Appointment(0, "Exam Preparation Workshop", "Exam preparation and mentoring", "Learning Center Linz", Timestamp.valueOf("2025-11-15 16:00:00"), Timestamp.valueOf("2025-11-15 19:00:00"), mia.getId(), tutoringSession);
            Appointment appt11 = new Appointment(0, "Homework Support Evening", "Individual learning support", "Learning Center Linz", Timestamp.valueOf("2025-11-22 17:00:00"), Timestamp.valueOf("2025-11-22 20:00:00"), mia.getId(), tutoringSession);
            Appointment appt12 = new Appointment(0, "Shelter Cleaning Day", "Cleaning and maintenance", "Paws & Hearts Shelter", Timestamp.valueOf("2025-11-09 09:00:00"), Timestamp.valueOf("2025-11-09 13:00:00"), emma.getId(), animalCare);
            Appointment appt13 = new Appointment(0, "Dog Walking Session", "Exercise and socialization", "Paws & Hearts Shelter", Timestamp.valueOf("2025-11-16 10:00:00"), Timestamp.valueOf("2025-11-16 12:00:00"), emma.getId(), animalCare);
            Appointment appt14 = new Appointment(0, "Basic Firefighter Training", "Emergency response exercises", "Volunteer Fire Station Linz", Timestamp.valueOf("2025-11-20 18:00:00"), Timestamp.valueOf("2025-11-20 21:00:00"), lukas.getId(), fireTraining);
            Appointment appt15 = new Appointment(0, "Rescue Simulation Exercise", "Practical rescue scenario", "Volunteer Fire Station Linz", Timestamp.valueOf("2025-11-27 18:00:00"), Timestamp.valueOf("2025-11-27 21:00:00"), lukas.getId(), fireTraining);

            // Add appointments to activities
            parkCleanup.setAppointments(List.of(appt1));
            codingWorkshop.setAppointments(List.of(appt2));
            charityConcert.setAppointments(List.of(appt3, appt4, appt5));
            winterSupport.setAppointments(List.of(appt6, appt7, appt8));
            tutoringSession.setAppointments(List.of(appt9, appt10, appt11));
            animalCare.setAppointments(List.of(appt12, appt13));
            fireTraining.setAppointments(List.of(appt14, appt15));

            activityRepository.save(parkCleanup);
            activityRepository.save(codingWorkshop);
            activityRepository.save(charityConcert);
            activityRepository.save(winterSupport);
            activityRepository.save(tutoringSession);
            activityRepository.save(animalCare);
            activityRepository.save(fireTraining);

            seedCommunityData(forumEntryRepository, forumReplyRepository, chatConversationRepository, chatMessageRepository);

            System.out.println("Database seeded successfully!");
        };
    }

    private Organisation createOrganisation(String orgName,
                                            Location location,
                                            String profilePicture,
                                            String body,
                                            OrganisationCategory category,
                                            Set<String> tags,
                                            Set<? extends User> members) {
        Organisation organisation = new Organisation();
        organisation.setOrgName(orgName);
        organisation.setLocation(location);
        organisation.setProfilePicture(profilePicture);
        organisation.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        organisation.setBody(body);
        organisation.setDeactivated(false);
        organisation.setReactivationTime(null);
        organisation.setCategory(category);
        organisation.setTags(new HashSet<>(tags));
        organisation.setOrgContacts(new HashSet<>(members));

        Set<OrganisationMember> organisationMembers = new HashSet<>();
        for (User member : members) {
            OrganisationMember organisationMember = new OrganisationMember();
            organisationMember.setOrganisation(organisation);
            organisationMember.setUser(member);
            organisationMember.setEngagementLevel(0);
            organisationMember.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            organisationMembers.add(organisationMember);
        }
        organisation.setOrgMembers(organisationMembers);
        return organisation;
    }

    private void seedCommunityData(ForumEntryRepository forumEntryRepository,
                                   ForumReplyRepository forumReplyRepository,
                                   ChatConversationRepository chatConversationRepository,
                                   ChatMessageRepository chatMessageRepository) {
        if (forumEntryRepository.count() == 0) {
            ForumEntry garden = new ForumEntry(
                    0,
                    "Community Garden Project",
                    "Looking for volunteers to help plant native flowers this weekend!",
                    Timestamp.valueOf("2025-10-01 10:00:00"),
                    "https://api.dicebear.com/9.x/lorelei/svg/seed=4",
                    5
            );
            ForumEntry library = new ForumEntry(
                    0,
                    "Local Library Reading Program",
                    "Does anyone have experience organizing story time for kids aged 6-10?",
                    Timestamp.valueOf("2025-09-28 12:00:00"),
                    "https://api.dicebear.com/9.x/lorelei/svg/seed=5",
                    0
            );
            ForumEntry beach = new ForumEntry(
                    0,
                    "Beach Cleanup Initiative",
                    "We collected 200kg of waste last month! Next meetup: Saturday at 9 AM.",
                    Timestamp.valueOf("2025-10-03 09:00:00"),
                    "https://api.dicebear.com/9.x/lorelei/svg/seed=6",
                    2
            );

            forumEntryRepository.saveAll(List.of(garden, library, beach));
            forumReplyRepository.saveAll(List.of(
                    new ForumReply(0, "Community Team", garden.getIcon(), garden.getLastMessage(), garden.getLastEdited(), garden),
                    new ForumReply(0, "Mia", "https://api.dicebear.com/9.x/lorelei/svg/seed=mia", "I can help coordinate volunteers and keep the checklist updated.", Timestamp.valueOf("2025-10-01 10:35:00"), garden),
                    new ForumReply(0, "Lukas", "https://api.dicebear.com/9.x/lorelei/svg/seed=lukas", "Please share the meeting point and any equipment people should bring.", Timestamp.valueOf("2025-10-01 11:20:00"), garden),
                    new ForumReply(0, "Community Team", library.getIcon(), library.getLastMessage(), library.getLastEdited(), library),
                    new ForumReply(0, "Community Team", beach.getIcon(), beach.getLastMessage(), beach.getLastEdited(), beach)
            ));
        }

        if (chatConversationRepository.findByOwnerUserIdOrderByTimestampDesc(1).isEmpty()) {
            ChatConversation alice = new ChatConversation(
                    0,
                    1,
                    2,
                    "Bob",
                    "https://api.dicebear.com/9.x/lorelei/svg/seed=8&size=512",
                    "Let us catch up later-free this weekend?",
                    Timestamp.valueOf("2025-10-04 14:00:00"),
                    2,
                    true
            );
            ChatConversation bob = new ChatConversation(
                    0,
                    1,
                    3,
                    "Charlie",
                    "https://api.dicebear.com/9.x/lorelei/svg/seed=3&size=512",
                    "Thanks for the code review tips!",
                    Timestamp.valueOf("2025-10-04 12:30:00"),
                    0,
                    true
            );
            ChatConversation charlie = new ChatConversation(
                    0,
                    2,
                    1,
                    "Alice",
                    "https://api.dicebear.com/9.x/lorelei/svg/seed=1&size=512",
                    "Thanks for the update. I will check the details and get back to you.",
                    Timestamp.valueOf("2025-10-03 16:45:00"),
                    1,
                    true
            );

            chatConversationRepository.saveAll(List.of(alice, bob, charlie));
            chatMessageRepository.saveAll(List.of(
                    new ChatMessage(0, "contact", 2, "Bob", alice.getAvatar(), false, alice.getLastMessage(), alice.getTimestamp(), alice),
                    new ChatMessage(0, "me", 1, "Alice", "https://api.dicebear.com/9.x/lorelei/svg/seed=1&size=512", true, "Thanks for the update. I will check the details and get back to you.", Timestamp.valueOf("2025-10-04 14:12:00"), alice),
                    new ChatMessage(0, "contact", 2, "Bob", alice.getAvatar(), false, "Perfect, that helps a lot.", Timestamp.valueOf("2025-10-04 14:24:00"), alice),
                    new ChatMessage(0, "contact", 3, "Charlie", bob.getAvatar(), false, bob.getLastMessage(), bob.getTimestamp(), bob),
                    new ChatMessage(0, "contact", 1, "Alice", charlie.getAvatar(), false, charlie.getLastMessage(), charlie.getTimestamp(), charlie)
            ));
        }
    }
}
