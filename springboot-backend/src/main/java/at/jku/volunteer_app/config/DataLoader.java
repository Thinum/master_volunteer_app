package at.jku.volunteer_app.config;

import at.jku.volunteer_app.model.*;
import at.jku.volunteer_app.repository.*;
import at.jku.volunteer_app.service.EngagementLevelService;
import at.jku.volunteer_app.service.OrganisationAdminService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository,
                                   OrganisationRepository organisationRepository,
                                   OrganisationAdminService organisationAdminService,
                                   EngagementLevelService engagementLevelService,
                                   ActivityRepository activityRepository,
                                   CommunityGoalRepository communityGoalRepository,
                                   InterestRepository interestRepository,
                                   UserRelationshipRepository relationshipRepository,
                                   ForumEntryRepository forumEntryRepository,
                                   ForumReplyRepository forumReplyRepository,
                                   ChatConversationRepository chatConversationRepository,
                                   ChatMessageRepository chatMessageRepository,
                                   AppointmentRepository appointmentRepository,
                                   JdbcTemplate jdbcTemplate,
                                   NotificationRepository notificationRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            ensureNotificationAutoIncrement(jdbcTemplate);
            updateLegacyOrganisationProfilePictures(organisationRepository);

            if (userRepository.count() > 0) {
                organisationAdminService.ensureDefaultAssignments();
                ensureDemoFriendships(userRepository, relationshipRepository);
                seedCommunityData(forumEntryRepository, forumReplyRepository, chatConversationRepository, chatMessageRepository);
                seedGoalDemoData(userRepository, organisationRepository, activityRepository, communityGoalRepository, interestRepository);
                enrichDemoActivityRecommendationProfiles(activityRepository);
                seedInterestCatalog(userRepository, organisationRepository, activityRepository, communityGoalRepository, interestRepository);
                seedCalendarSampleData(userRepository, organisationRepository, activityRepository, appointmentRepository, communityGoalRepository, interestRepository);
                seedMockEngagementLevels(organisationRepository, activityRepository,
                        engagementLevelService);
                return; // Data already loaded
            }

            // 1. Create Users (using Member and Org_Admin to match JOINED inheritance)
            Org_Admin alice = new Org_Admin();
            alice.setName("Alice");
            alice.setEmail("alice@mail.com");
            alice.setPassword(passwordEncoder.encode("password"));
            alice.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=1&size=512");
            alice.setPhone("+43 660 111 0001");
            setUserProfile(
                    alice,
                    List.of(
                            skill("Teamwork", SkillProficiency.INTERMEDIATE),
                            skill("Communication", SkillProficiency.INTERMEDIATE),
                            skill("Mentoring", SkillProficiency.ADVANCED)
                    ),
                    List.of(
                            InterestCategory.EDUCATION_AND_TUTORING,
                            InterestCategory.ENVIRONMENT_AND_NATURE,
                            InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS,
                            InterestCategory.ORGANISATION_AND_LEADERSHIP
                    )
            );
            alice.setActive(true);
            alice.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            alice.setUsername("alice");

            Member bob = new Member();
            bob.setName("Bob");
            bob.setEmail("bob@mail.com");
            bob.setPassword(passwordEncoder.encode("password"));
            bob.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=8&size=512");
            bob.setPhone("+43 660 111 0002");
            setUserProfile(
                    bob,
                    List.of(
                            skill("Organization", SkillProficiency.INTERMEDIATE),
                            skill("Physical activity", SkillProficiency.INTERMEDIATE),
                            skill("Teamwork", SkillProficiency.BEGINNER)
                    ),
                    List.of(
                            InterestCategory.HUMANITARIAN_AID,
                            InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS,
                            InterestCategory.OUTDOOR_ACTIVITIES,
                            InterestCategory.SPORTS_AND_FITNESS
                    )
            );
            bob.setActive(true);
            bob.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            bob.setUsername("bob");

            Member charlie = new Member();
            charlie.setName("Charlie");
            charlie.setEmail("charlie@mail.com");
            charlie.setPassword(passwordEncoder.encode("password"));
            charlie.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=3&size=512");
            charlie.setPhone("+43 660 111 0003");
            setUserProfile(
                    charlie,
                    List.of(
                            skill("Programming", SkillProficiency.ADVANCED),
                            skill("Problem-Solving", SkillProficiency.INTERMEDIATE),
                            skill("Teaching", SkillProficiency.INTERMEDIATE)
                    ),
                    List.of(
                            InterestCategory.TECHNOLOGY,
                            InterestCategory.EDUCATION_AND_TUTORING,
                            InterestCategory.CHILDREN_AND_YOUTH
                    )
            );
            charlie.setActive(true);
            charlie.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            charlie.setUsername("charlie");

            Member diana = new Member();
            diana.setName("Diana");
            diana.setEmail("diana@mail.com");
            diana.setPassword(passwordEncoder.encode("password"));
            diana.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=4&size=512");
            diana.setPhone("+43 660 111 2222");
            setUserProfile(
                    diana,
                    List.of(
                            skill("First Aid", SkillProficiency.ADVANCED),
                            skill("Communication", SkillProficiency.INTERMEDIATE),
                            skill("Community Outreach", SkillProficiency.INTERMEDIATE)
                    ),
                    List.of(
                            InterestCategory.HEALTH_AND_WELL_BEING,
                            InterestCategory.HUMANITARIAN_AID,
                            InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS
                    )
            );
            diana.setActive(true);
            diana.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            diana.setUsername("diana");

            Member ethan = new Member();
            ethan.setName("Ethan");
            ethan.setEmail("ethan@mail.com");
            ethan.setPassword(passwordEncoder.encode("password"));
            ethan.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=12&size=512");
            ethan.setPhone("+43 660 222 3333");
            setUserProfile(
                    ethan,
                    List.of(
                            skill("Food Distribution", SkillProficiency.BEGINNER),
                            skill("Teamwork", SkillProficiency.INTERMEDIATE),
                            skill("Organization", SkillProficiency.BEGINNER)
                    ),
                    List.of(
                            InterestCategory.FOOD_AND_COOKING,
                            InterestCategory.HUMANITARIAN_AID,
                            InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS
                    )
            );
            ethan.setActive(true);
            ethan.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            ethan.setUsername("ethan");

            Member fiona = new Member();
            fiona.setName("Fiona");
            fiona.setEmail("fiona@mail.com");
            fiona.setPassword(passwordEncoder.encode("password"));
            fiona.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=6&size=512");
            fiona.setPhone("+43 660 111 0006");
            setUserProfile(
                    fiona,
                    List.of(
                            skill("Cooking", SkillProficiency.INTERMEDIATE),
                            skill("Teamwork", SkillProficiency.BEGINNER)
                    ),
                    List.of(
                            InterestCategory.FOOD_AND_COOKING,
                            InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS
                    )
            );
            fiona.setActive(false);
            fiona.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            fiona.setUsername("fiona");

            Member george = new Member();
            george.setName("George");
            george.setEmail("george@mail.com");
            george.setPassword(passwordEncoder.encode("password"));
            george.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=13&size=512");
            george.setPhone("+43 660 111 0007");
            setUserProfile(
                    george,
                    List.of(
                            skill("Physical activity", SkillProficiency.ADVANCED),
                            skill("Teamwork", SkillProficiency.INTERMEDIATE),
                            skill("First Aid", SkillProficiency.BEGINNER)
                    ),
                    List.of(
                            InterestCategory.OUTDOOR_ACTIVITIES,
                            InterestCategory.SPORTS_AND_FITNESS,
                            InterestCategory.EMERGENCY_AND_RESCUE_SERVICES
                    )
            );
            george.setActive(true);
            george.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            george.setUsername("george");

            Member tom = new Member();
            tom.setName("Tom");
            tom.setEmail("tom@mail.com");
            tom.setPassword(passwordEncoder.encode("password"));
            tom.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=tom&size=512");
            tom.setPhone("+43 660 333 1001");
            setUserProfile(
                    tom,
                    List.of(
                            skill("Teamwork", SkillProficiency.INTERMEDIATE),
                            skill("Food Distribution", SkillProficiency.BEGINNER),
                            skill("Physical activity", SkillProficiency.BEGINNER)
                    ),
                    List.of(
                            InterestCategory.FOOD_AND_COOKING,
                            InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS,
                            InterestCategory.OUTDOOR_ACTIVITIES
                    )
            );
            tom.setActive(true);
            tom.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            tom.setUsername("tom");

            Member sandra = new Member();
            sandra.setName("Sandra");
            sandra.setEmail("sandra@mail.com");
            sandra.setPassword(passwordEncoder.encode("password"));
            sandra.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=sandra&size=512");
            sandra.setPhone("+43 660 333 1002");
            setUserProfile(
                    sandra,
                    List.of(
                            skill("Event Planning", SkillProficiency.ADVANCED),
                            skill("Fundraising", SkillProficiency.INTERMEDIATE),
                            skill("Organization", SkillProficiency.INTERMEDIATE)
                    ),
                    List.of(
                            InterestCategory.HUMANITARIAN_AID,
                            InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS,
                            InterestCategory.MUSIC,
                            InterestCategory.ORGANISATION_AND_LEADERSHIP
                    )
            );
            sandra.setActive(true);
            sandra.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            sandra.setUsername("sandra");

            Member mia = new Member();
            mia.setName("Mia");
            mia.setEmail("mia@mail.com");
            mia.setPassword(passwordEncoder.encode("password"));
            mia.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=mia&size=512");
            mia.setPhone("+43 660 333 1003");
            setUserProfile(
                    mia,
                    List.of(
                            skill("Teaching", SkillProficiency.ADVANCED),
                            skill("Mathematics", SkillProficiency.ADVANCED),
                            skill("Mentoring", SkillProficiency.INTERMEDIATE)
                    ),
                    List.of(
                            InterestCategory.EDUCATION_AND_TUTORING,
                            InterestCategory.CHILDREN_AND_YOUTH
                    )
            );
            mia.setActive(true);
            mia.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            mia.setUsername("mia");

            Member bella = new Member();
            bella.setName("Bella");
            bella.setEmail("bella@mail.com");
            bella.setPassword(passwordEncoder.encode("password"));
            bella.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=bella&size=512");
            bella.setPhone("+43 660 333 1004");
            setUserProfile(
                    bella,
                    List.of(
                            skill("Animal Care", SkillProficiency.INTERMEDIATE),
                            skill("Cleaning", SkillProficiency.BEGINNER),
                            skill("Teamwork", SkillProficiency.INTERMEDIATE)
                    ),
                    List.of(
                            InterestCategory.ANIMALS,
                            InterestCategory.OUTDOOR_ACTIVITIES,
                            InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS
                    )
            );
            bella.setActive(true);
            bella.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            bella.setUsername("bella");

            Member sophia = new Member();
            sophia.setName("Sophia");
            sophia.setEmail("sophia@mail.com");
            sophia.setPassword(passwordEncoder.encode("password"));
            sophia.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=sophia&size=512");
            sophia.setPhone("+43 660 333 1005");
            setUserProfile(
                    sophia,
                    List.of(
                            skill("Animal Care", SkillProficiency.BEGINNER),
                            skill("Teaching", SkillProficiency.INTERMEDIATE),
                            skill("Communication", SkillProficiency.INTERMEDIATE)
                    ),
                    List.of(
                            InterestCategory.ANIMALS,
                            InterestCategory.EDUCATION_AND_TUTORING,
                            InterestCategory.CHILDREN_AND_YOUTH
                    )
            );
            sophia.setActive(true);
            sophia.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            sophia.setUsername("sophia");

            Member lukas = new Member();
            lukas.setName("Lukas");
            lukas.setEmail("lukas@mail.com");
            lukas.setPassword(passwordEncoder.encode("password"));
            lukas.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=lukas&size=512");
            lukas.setPhone("+43 660 333 1006");
            setUserProfile(
                    lukas,
                    List.of(
                            skill("Emergency Response", SkillProficiency.ADVANCED),
                            skill("First Aid", SkillProficiency.INTERMEDIATE),
                            skill("Physical Fitness", SkillProficiency.ADVANCED)
                    ),
                    List.of(
                            InterestCategory.EMERGENCY_AND_RESCUE_SERVICES,
                            InterestCategory.HEALTH_AND_WELL_BEING,
                            InterestCategory.SPORTS_AND_FITNESS
                    )
            );
            lukas.setActive(true);
            lukas.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            lukas.setUsername("lukas");

            Member emma = new Member();
            emma.setName("Emma");
            emma.setEmail("emma@mail.com");
            emma.setPassword(passwordEncoder.encode("password"));
            emma.setProfilePicture("https://api.dicebear.com/9.x/lorelei/svg/seed=emma&size=512");
            emma.setPhone("+43 660 333 1007");
            setUserProfile(
                    emma,
                    List.of(
                            skill("Animal Care", SkillProficiency.ADVANCED),
                            skill("Responsibility", SkillProficiency.INTERMEDIATE),
                            skill("Cleaning", SkillProficiency.INTERMEDIATE)
                    ),
                    List.of(
                            InterestCategory.ANIMALS,
                            InterestCategory.ACCESSIBILITY_AND_INCLUSION,
                            InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS
                    )
            );
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
            setUserProfile(
                    admin,
                    List.of(
                            skill("Organization", SkillProficiency.ADVANCED),
                            skill("Event Planning", SkillProficiency.INTERMEDIATE),
                            skill("Community Outreach", SkillProficiency.INTERMEDIATE)
                    ),
                    List.of(
                            InterestCategory.ORGANISATION_AND_LEADERSHIP,
                            InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS,
                            InterestCategory.HUMANITARIAN_AID
                    )
            );
            admin.setActive(true);
            admin.setJoinedAt(new Timestamp(System.currentTimeMillis()));
            admin.setUsername("admin");
            admin.setPlatformAdmin(true);

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
            ensureDemoFriendships(userRepository, relationshipRepository);

            // 3. Create Organisations
            Organisation techAid = createOrganisation(
                    "Tech Aid Association",
                    new Location(48.2082, 16.3738),
                    "https://api.dicebear.com/10.x/shapes/svg?seed=Tech%20Aid%20Association",
                    "Helping underprivileged communities learn coding skills.",
                    OrganisationCategory.Technology,
                    Set.of("coding", "programming", "mentorship"),
                    Set.of(alice, bob)
            );

            Organisation greenFuture = createOrganisation(
                    "Green Future Org",
                    new Location(48.3069, 14.2858),
                    "https://api.dicebear.com/10.x/shapes/svg?seed=Green%20Future%20Org",
                    "Dedicated to sustainability and green innovation.",
                    OrganisationCategory.Environment,
                    Set.of("sustainability", "climate", "eco projects"),
                    Set.of(charlie)
            );

            Organisation communityConnect = createOrganisation(
                    "Community Connect",
                    new Location(47.0707, 15.4395),
                    "https://api.dicebear.com/10.x/shapes/svg?seed=Community%20Connect",
                    "Connecting volunteers with local social projects.",
                    OrganisationCategory.Community,
                    Set.of("volunteering", "local projects", "social impact"),
                    Set.of(diana)
            );

            Organisation eduForAll = createOrganisation(
                    "Education for All",
                    new Location(47.8095, 13.055),
                    "https://api.dicebear.com/10.x/shapes/svg?seed=Education%20for%20All",
                    "Providing access to quality education worldwide.",
                    OrganisationCategory.Education,
                    Set.of("schools", "learning", "children"),
                    Set.of(ethan)
            );

            Organisation herzFuerMenschen = createOrganisation(
                    "Herz für Menschen",
                    new Location(48.2100, 16.3700),
                    "https://api.dicebear.com/10.x/shapes/svg?seed=Herz%20f%C3%BCr%20Menschen",
                    "Supporting vulnerable people through community initiatives.",
                    OrganisationCategory.Community,
                    Set.of("charity", "community", "social support"),
                    Set.of(sandra)
            );

            Organisation localLearningSupport = createOrganisation(
                    "Local Learning Support",
                    new Location(48.3000, 14.2900),
                    "https://api.dicebear.com/10.x/shapes/svg?seed=Local%20Learning%20Support",
                    "Tutoring and mentoring for students.",
                    OrganisationCategory.Education,
                    Set.of("education", "tutoring", "mentoring"),
                    Set.of(mia)
            );

            Organisation pawsAndHearts = createOrganisation(
                    "Paws & Hearts",
                    new Location(48.3200, 14.3000),
                    "https://api.dicebear.com/10.x/shapes/svg?seed=Paws%20%26%20Hearts",
                    "Helping animals find safe homes.",
                    OrganisationCategory.Community,
                    Set.of("animals", "rescue", "shelter"),
                    Set.of(emma)
            );

            Organisation volunteerFire = createOrganisation(
                    "Volunteer Fire Service Linz",
                    new Location(48.3050, 14.2860),
                    "https://api.dicebear.com/10.x/shapes/svg?seed=Volunteer%20Fire%20Service%20Linz",
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
            organisationAdminService.ensureDefaultAssignments();

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
            setActivityProfile(
                    parkCleanup,
                    List.of(
                            InterestCategory.ENVIRONMENT_AND_NATURE,
                            InterestCategory.OUTDOOR_ACTIVITIES,
                            InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS
                    ),
                    List.of(
                            requiredSkill("Teamwork", SkillProficiency.BEGINNER),
                            requiredSkill("Physical activity", SkillProficiency.BEGINNER),
                            preferredSkill("Organization", SkillProficiency.BEGINNER)
                    ),
                    List.of("environment", "cleanup", "community", "outdoors", "beginner-friendly", "physical")
            );
            parkCleanup.setCapacity(25);
            parkCleanup.setSpotsTaken(8);
            parkCleanup.setDifficulty("easy");
            parkCleanup.setPublic(true);
            parkCleanup.setStatus(ActivityStatus.finished);
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
            setActivityProfile(
                    codingWorkshop,
                    List.of(
                            InterestCategory.EDUCATION_AND_TUTORING,
                            InterestCategory.CHILDREN_AND_YOUTH,
                            InterestCategory.TECHNOLOGY
                    ),
                    List.of(
                            requiredSkill("Teaching", SkillProficiency.INTERMEDIATE),
                            requiredSkill("Communication", SkillProficiency.BEGINNER),
                            preferredSkill("Programming", SkillProficiency.BEGINNER),
                            preferredSkill("Mentoring", SkillProficiency.BEGINNER)
                    ),
                    List.of("education", "coding", "kids", "beginner-friendly", "indoor")
            );
            codingWorkshop.setCapacity(15);
            codingWorkshop.setSpotsTaken(5);
            codingWorkshop.setDifficulty("medium");
            codingWorkshop.setPublic(true);
            codingWorkshop.setStatus(ActivityStatus.finished);
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
            setActivityProfile(
                    charityConcert,
                    List.of(
                            InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS,
                            InterestCategory.HUMANITARIAN_AID,
                            InterestCategory.ARTS_AND_CULTURE,
                            InterestCategory.MUSIC,
                            InterestCategory.ORGANISATION_AND_LEADERSHIP
                    ),
                    List.of(
                            requiredSkill("Event Planning", SkillProficiency.INTERMEDIATE),
                            preferredSkill("Communication", SkillProficiency.BEGINNER),
                            preferredSkill("Fundraising", SkillProficiency.BEGINNER),
                            preferredSkill("Teamwork", SkillProficiency.BEGINNER)
                    ),
                    List.of("fundraising", "event", "community", "music", "social", "weekend")
            );
            charityConcert.setCapacity(50);
            charityConcert.setSpotsTaken(18);
            charityConcert.setDifficulty("medium");
            charityConcert.setPublic(true);
            charityConcert.setStatus(ActivityStatus.open);
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
            setActivityProfile(
                    winterSupport,
                    List.of(
                            InterestCategory.FOOD_AND_COOKING,
                            InterestCategory.HUMANITARIAN_AID,
                            InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS
                    ),
                    List.of(
                            requiredSkill("Teamwork", SkillProficiency.BEGINNER),
                            preferredSkill("Community Outreach", SkillProficiency.BEGINNER),
                            preferredSkill("Organization", SkillProficiency.BEGINNER)
                    ),
                    List.of("food", "winter", "community", "families", "beginner-friendly", "social")
            );
            winterSupport.setCapacity(30);
            winterSupport.setSpotsTaken(12);
            winterSupport.setDifficulty("easy");
            winterSupport.setPublic(true);
            winterSupport.setStatus(ActivityStatus.finished);
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
            setActivityProfile(
                    tutoringSession,
                    List.of(
                            InterestCategory.EDUCATION_AND_TUTORING,
                            InterestCategory.CHILDREN_AND_YOUTH
                    ),
                    List.of(
                            requiredSkill("Teaching", SkillProficiency.INTERMEDIATE),
                            requiredSkill("Mathematics", SkillProficiency.INTERMEDIATE),
                            preferredSkill("Communication", SkillProficiency.BEGINNER),
                            preferredSkill("Mentoring", SkillProficiency.BEGINNER)
                    ),
                    List.of("education", "tutoring", "students", "indoor", "after-school")
            );
            tutoringSession.setCapacity(20);
            tutoringSession.setSpotsTaken(7);
            tutoringSession.setDifficulty("medium");
            tutoringSession.setPublic(true);
            tutoringSession.setStatus(ActivityStatus.open);
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
            setActivityProfile(
                    animalCare,
                    List.of(
                            InterestCategory.ANIMALS,
                            InterestCategory.OUTDOOR_ACTIVITIES,
                            InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS
                    ),
                    List.of(
                            requiredSkill("Animal Care", SkillProficiency.BEGINNER),
                            preferredSkill("Teamwork", SkillProficiency.BEGINNER),
                            preferredSkill("Responsibility", SkillProficiency.BEGINNER),
                            preferredSkill("Cleaning", SkillProficiency.BEGINNER)
                    ),
                    List.of("animals", "shelter", "care", "outdoor", "beginner-friendly")
            );
            animalCare.setCapacity(20);
            animalCare.setSpotsTaken(6);
            animalCare.setDifficulty("easy");
            animalCare.setPublic(true);
            animalCare.setStatus(ActivityStatus.open);
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
            setActivityProfile(
                    fireTraining,
                    List.of(
                            InterestCategory.EMERGENCY_AND_RESCUE_SERVICES,
                            InterestCategory.HEALTH_AND_WELL_BEING,
                            InterestCategory.SPORTS_AND_FITNESS
                    ),
                    List.of(
                            requiredSkill("Emergency Response", SkillProficiency.INTERMEDIATE),
                            requiredSkill("First Aid", SkillProficiency.BEGINNER),
                            preferredSkill("Teamwork", SkillProficiency.BEGINNER),
                            preferredSkill("Physical Fitness", SkillProficiency.INTERMEDIATE)
                    ),
                    List.of("emergency", "training", "rescue", "physical", "advanced")
            );
            fireTraining.setCapacity(25);
            fireTraining.setSpotsTaken(8);
            fireTraining.setDifficulty("hard");
            fireTraining.setPublic(true);
            fireTraining.setStatus(ActivityStatus.open);
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
            setActivityProfile(
                    foodBank,
                    List.of(
                            InterestCategory.FOOD_AND_COOKING,
                            InterestCategory.HUMANITARIAN_AID,
                            InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS
                    ),
                    List.of(
                            requiredSkill("Organization", SkillProficiency.BEGINNER),
                            requiredSkill("Teamwork", SkillProficiency.BEGINNER)
                    ),
                    List.of("food", "families", "community", "indoor", "beginner-friendly")
            );
            foodBank.setCapacity(10);
            foodBank.setSpotsTaken(2);
            foodBank.setDifficulty("easy");
            foodBank.setPublic(true);
            foodBank.setStatus(ActivityStatus.finished);
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
            setActivityProfile(
                    reforestation,
                    List.of(
                            InterestCategory.ENVIRONMENT_AND_NATURE,
                            InterestCategory.OUTDOOR_ACTIVITIES,
                            InterestCategory.SPORTS_AND_FITNESS
                    ),
                    List.of(
                            requiredSkill("Physical activity", SkillProficiency.INTERMEDIATE),
                            requiredSkill("Teamwork", SkillProficiency.BEGINNER)
                    ),
                    List.of("environment", "trees", "outdoors", "physical", "weekend")
            );
            reforestation.setCapacity(50);
            reforestation.setSpotsTaken(12);
            reforestation.setDifficulty("hard");
            reforestation.setPublic(true);
            reforestation.setStatus(ActivityStatus.finished);
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
            enrichDemoActivityRecommendationProfiles(activityRepository);

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
            seedGoalDemoData(userRepository, organisationRepository, activityRepository, communityGoalRepository, interestRepository);
            seedInterestCatalog(userRepository, organisationRepository, activityRepository, communityGoalRepository, interestRepository);
            seedCalendarSampleData(userRepository, organisationRepository, activityRepository, appointmentRepository, communityGoalRepository, interestRepository);
            seedMockEngagementLevels(organisationRepository, activityRepository,
                    engagementLevelService);

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

    private void seedMockEngagementLevels(OrganisationRepository organisationRepository,
                                          ActivityRepository activityRepository,
                                          EngagementLevelService engagementLevelService) {
        List<Organisation> organisations = organisationRepository.findAll().stream()
                .map(item -> organisationRepository.findById(item.getId()).orElse(item))
                .toList();
        organisations.forEach(engagementLevelService::ensureDefaults);

        Map<String, Activity> historyByTitle = new HashMap<>();
        activityRepository.findAll().stream()
                .filter(activity -> activity.getTitle() != null
                        && activity.getTitle().startsWith("Mock engagement history - "))
                .forEach(activity -> historyByTitle.put(activity.getTitle(), activity));

        Timestamp now = new Timestamp(System.currentTimeMillis());
        for (Organisation organisation : organisations) {
            Set<Integer> adminIds = organisation.getOrgAdmins() == null
                    ? Set.of()
                    : organisation.getOrgAdmins().stream().map(User::getId).collect(java.util.stream.Collectors.toSet());

            if (organisation.getOrgMembers() == null) {
                continue;
            }
            for (OrganisationMember membership : organisation.getOrgMembers()) {
                User user = membership.getUser();
                if (user == null) {
                    continue;
                }

                int targetLevel = adminIds.contains(user.getId())
                        ? EngagementLevelService.DEDICATED_LEVEL
                        : mockEngagementLevel(user.getUsername());
                if (targetLevel == EngagementLevelService.DEDICATED_LEVEL) {
                    membership.setEngagementLevel(EngagementLevelService.DEDICATED_LEVEL);
                    continue;
                }

                membership.setEngagementLevel(0);
                int historyCount = targetLevel == 2 ? 4 : targetLevel == 1 ? 1 : 0;
                for (int sequence = 0; sequence < historyCount; sequence++) {
                    String title = "Mock engagement history - " + organisation.getId()
                            + " - " + user.getUsername() + " - " + (sequence + 1);
                    Activity activity = historyByTitle.getOrDefault(title, new Activity());
                    configureMockEngagementActivity(activity, title, organisation, user, sequence, now);
                    Activity saved = activityRepository.save(activity);
                    historyByTitle.put(title, saved);
                }
            }
            organisationRepository.save(organisation);
        }

        organisations.forEach(organisation -> {
            if (organisation.getOrgMembers() != null) {
                organisation.getOrgMembers().stream()
                        .filter(member -> member.getUser() != null)
                        .forEach(member -> engagementLevelService.getCurrentLevel(
                                organisation.getId(), member.getUser().getId()));
            }
        });
    }

    private int mockEngagementLevel(String username) {
        return switch (username == null ? "" : username.toLowerCase(Locale.ROOT)) {
            case "charlie", "fiona", "sandra", "sophia", "emma" -> 1;
            case "diana", "george", "mia", "lukas" -> 2;
            default -> 0;
        };
    }

    private void configureMockEngagementActivity(Activity activity,
                                                 String title,
                                                 Organisation organisation,
                                                 User user,
                                                 int sequence,
                                                 Timestamp now) {
        Timestamp completedAt = new Timestamp(now.getTime() - Duration.ofDays(sequence + 1L).toMillis());
        activity.setTitle(title);
        activity.setBody("Demo activity used to establish a predictable engagement level.");
        activity.setDescription("Completed mock engagement activity for " + user.getName() + ".");
        activity.setProjectId(0);
        activity.setOrganisations(List.of(organisation));
        activity.setDate(completedAt);
        activity.setStartTime("10:00");
        activity.setEndTime("12:00");
        activity.setDuration("2 hours");
        activity.setExpiresAt(completedAt);
        activity.setLocation("Demo location");
        activity.setCoordinates(new Coordinates(48.3069, 14.2858));
        activity.setParticipants(List.of(user));
        activity.setCreatedBy(user);
        setActivityProfile(activity,
                List.of(InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS),
                List.of(requiredSkill("Teamwork", SkillProficiency.BEGINNER)),
                List.of("mock-data", "engagement-history"));
        activity.setQualifications(List.of());
        activity.setPrerequisites(List.of());
        activity.setCapacity(1);
        activity.setSpotsTaken(1);
        activity.setEquipmentProvided(List.of());
        activity.setDifficulty("easy");
        activity.setPublic(false);
        activity.setStatus(ActivityStatus.finished);
        if (activity.getCreatedAt() == null) {
            activity.setCreatedAt(completedAt);
        }
        activity.setUpdatedAt(now);
    }

    private void updateLegacyOrganisationProfilePictures(OrganisationRepository organisationRepository) {
        Map<String, String> replacements = Map.of(
                "https://logotypes.dev/Protopie?variant=glyph&version=color",
                "https://api.dicebear.com/10.x/shapes/svg?seed=Tech%20Aid%20Association",
                "https://logotypes.dev/Clearscope?variant=glyph&version=color",
                "https://api.dicebear.com/10.x/shapes/svg?seed=Green%20Future%20Org",
                "https://logotypes.dev/Contentful?variant=glyph&version=color",
                "https://api.dicebear.com/10.x/shapes/svg?seed=Community%20Connect",
                "https://logotypes.dev/Feedly?variant=glyph&version=color",
                "https://api.dicebear.com/10.x/shapes/svg?seed=Education%20for%20All",
                "https://logotypes.dev/Notion?variant=glyph&version=color",
                "https://api.dicebear.com/10.x/shapes/svg?seed=Herz%20f%C3%BCr%20Menschen",
                "https://logotypes.dev/Linear?variant=glyph&version=color",
                "https://api.dicebear.com/10.x/shapes/svg?seed=Local%20Learning%20Support",
                "https://logotypes.dev/Figma?variant=glyph&version=color",
                "https://api.dicebear.com/10.x/shapes/svg?seed=Paws%20%26%20Hearts",
                "https://logotypes.dev/Firefox?variant=glyph&version=color",
                "https://api.dicebear.com/10.x/shapes/svg?seed=Volunteer%20Fire%20Service%20Linz"
        );

        List<Organisation> updatedOrganisations = organisationRepository.findAll().stream()
                .filter(organisation -> replacements.containsKey(organisation.getProfilePicture()))
                .peek(organisation -> organisation.setProfilePicture(replacements.get(organisation.getProfilePicture())))
                .toList();

        if (!updatedOrganisations.isEmpty()) {
            organisationRepository.saveAll(updatedOrganisations);
        }
    }

    private void seedGoalDemoData(UserRepository userRepository,
                                  OrganisationRepository organisationRepository,
                                  ActivityRepository activityRepository,
                                  CommunityGoalRepository communityGoalRepository,
                                  InterestRepository interestRepository) {
        List<Activity> activities = activityRepository.findAll();

        updateActivityForGoalDemo(
                activities,
                activityRepository,
                "Community Park Cleanup",
                Arrays.asList("environment", "cleanup", "community", "outdoors", "beginner-friendly", "physical"),
                ActivityStatus.finished
        );
        updateActivityForGoalDemo(
                activities,
                activityRepository,
                "Mountain Reforestation Project",
                Arrays.asList("environment", "trees", "outdoors", "physical", "weekend"),
                ActivityStatus.finished
        );
        updateActivityForGoalDemo(
                activities,
                activityRepository,
                "Coding Workshop for Kids",
                Arrays.asList("education", "coding", "kids", "beginner-friendly", "indoor"),
                ActivityStatus.finished
        );
        updateActivityForGoalDemo(
                activities,
                activityRepository,
                "Local Food Bank Assistance",
                Arrays.asList("food", "families", "community", "indoor", "beginner-friendly"),
                ActivityStatus.finished
        );
        updateActivityForGoalDemo(
                activities,
                activityRepository,
                "Winter Support Initiative - Food Distribution",
                Arrays.asList("food", "winter", "community", "families", "beginner-friendly", "social"),
                ActivityStatus.finished
        );
        updateActivityForGoalDemo(
                activities,
                activityRepository,
                "Setting up a Charity Concert for Trauma Recovery",
                Arrays.asList("fundraising", "event", "community", "music", "social", "weekend"),
                ActivityStatus.open
        );
        updateActivityForGoalDemo(
                activities,
                activityRepository,
                "Math Tutoring Session",
                Arrays.asList("education", "tutoring", "students", "indoor", "after-school"),
                ActivityStatus.open
        );
        updateActivityForGoalDemo(
                activities,
                activityRepository,
                "Animal Shelter Care Day",
                Arrays.asList("animals", "shelter", "care", "outdoor", "beginner-friendly"),
                ActivityStatus.open
        );
        updateActivityForGoalDemo(
                activities,
                activityRepository,
                "Volunteer Firefighter Training",
                Arrays.asList("emergency", "training", "rescue", "physical", "advanced"),
                ActivityStatus.open
        );

        List<Organisation> organisations = organisationRepository.findAll();
        Organisation greenFuture = findOrganisationByName(organisations, "Green Future Org");
        ensureGreenFutureGoalActivities(userRepository, activityRepository, greenFuture);

        List<CommunityGoal> existingGoals = communityGoalRepository.findAll();

        createGoalIfMissing(
                existingGoals,
                communityGoalRepository,
                greenFuture,
                "Complete 7 environmental activities",
                "Counts finished activities with the environment interest for Green Future Org.",
                7,
                7,
                Arrays.asList("environment"),
                interestRepository,
                Timestamp.valueOf("2025-01-01 00:00:00"),
                Timestamp.valueOf("2025-12-31 23:59:59")
        );
        createGoalIfMissing(
                existingGoals,
                communityGoalRepository,
                findOrganisationByName(organisations, "Tech Aid Association"),
                "Run a coding activity",
                "Counts finished activities with the coding interest for Tech Aid Association.",
                1,
                1,
                Arrays.asList("coding"),
                interestRepository,
                Timestamp.valueOf("2025-01-01 00:00:00"),
                Timestamp.valueOf("2025-12-31 23:59:59")
        );
        createGoalIfMissing(
                existingGoals,
                communityGoalRepository,
                findOrganisationByName(organisations, "Community Connect"),
                "Support families with food",
                "Counts finished activities with the food or families interest for Community Connect.",
                2,
                1,
                Arrays.asList("food", "families"),
                interestRepository,
                Timestamp.valueOf("2025-01-01 00:00:00"),
                Timestamp.valueOf("2025-12-31 23:59:59")
        );
        createGoalIfMissing(
                existingGoals,
                communityGoalRepository,
                findOrganisationByName(organisations, "Herz für Menschen"),
                "Winter community support",
                "Counts finished activities with the winter or food interest for Herz für Menschen.",
                2,
                1,
                Arrays.asList("winter", "food"),
                interestRepository,
                Timestamp.valueOf("2025-01-01 00:00:00"),
                Timestamp.valueOf("2025-12-31 23:59:59")
        );
    }

    private void ensureDemoFriendships(UserRepository userRepository,
                                       UserRelationshipRepository relationshipRepository) {
        userRepository.findByUsername("admin").ifPresent(admin -> {
            List.of("alice", "bob", "charlie", "diana").forEach(username ->
                    userRepository.findByUsername(username).ifPresent(friend -> {
                        if (!relationshipRepository.existsFriendship(admin, friend, RelationshipType.FRIEND)) {
                            relationshipRepository.save(new UserRelationship(null, admin, friend, RelationshipType.FRIEND, 90));
                            relationshipRepository.save(new UserRelationship(null, friend, admin, RelationshipType.FRIEND, 90));
                        }
                    })
            );
        });
    }

    private void ensureOpenFriendRequests(UserRepository userRepository,
                                          UserRelationshipRepository relationshipRepository,
                                          NotificationRepository notificationRepository) {
        List<User> activeUsers = userRepository.findAll().stream()
                .filter(User::isActive)
                .toList();

        activeUsers.forEach(recipient -> {
            if (notificationRepository.existsByUser_IdAndTypeAndHasBeenReadFalse(
                    recipient.getId(), NotificationType.FRIEND_REQUEST)) {
                return;
            }

            activeUsers.stream()
                    .filter(sender -> sender.getId() != recipient.getId())
                    .filter(sender -> !relationshipRepository.existsFriendship(
                            recipient, sender, RelationshipType.FRIEND))
                    .findFirst()
                    .ifPresent(sender -> {
                NotificationPayload payload = new NotificationPayload();
                payload.setPayloadType("USER_ID");
                payload.setPayload(String.valueOf(sender.getId()));

                Notification request = new Notification();
                request.setTitle("Friend request");
                request.setText(sender.getName() + " wants to connect with you.");
                request.setType(NotificationType.FRIEND_REQUEST);
                request.setHasBeenRead(false);
                request.setCreatedAt(new Timestamp(System.currentTimeMillis()));
                request.setUser(recipient);
                request.setNotificationPayloadList(List.of(payload));
                notificationRepository.save(request);
            });
        });
    }

    private void ensureNotificationAutoIncrement(JdbcTemplate jdbcTemplate) {
        jdbcTemplate.execute("ALTER TABLE notification MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT");
        jdbcTemplate.execute("ALTER TABLE notification_payload MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT");
    }


    private void ensureGreenFutureGoalActivities(UserRepository userRepository,
                                                 ActivityRepository activityRepository,
                                                 Organisation greenFuture) {
        if (greenFuture == null) {
            return;
        }

        List<Activity> greenFutureActivities = activityRepository.findAllByOrganisations_Id(greenFuture.getId());
        List<User> contributors = List.of(
                findUserByUsername(userRepository, "alice"),
                findUserByUsername(userRepository, "bob"),
                findUserByUsername(userRepository, "charlie"),
                findUserByUsername(userRepository, "diana"),
                findUserByUsername(userRepository, "george")
        ).stream()
                .filter(java.util.Objects::nonNull)
                .toList();

        createActivityIfMissing(
                greenFutureActivities,
                activityRepository,
                greenFuture,
                "Riverbank Waste Audit",
                "Document and clear waste along the riverbank.",
                Timestamp.valueOf("2025-06-07 09:00:00"),
                pickContributor(contributors, 0)
        );
        createActivityIfMissing(
                greenFutureActivities,
                activityRepository,
                greenFuture,
                "Community Compost Build",
                "Build compost stations for local garden projects.",
                Timestamp.valueOf("2025-07-03 10:00:00"),
                pickContributor(contributors, 1)
        );
        createActivityIfMissing(
                greenFutureActivities,
                activityRepository,
                greenFuture,
                "Native Flower Planting",
                "Plant native flowers to support pollinators.",
                Timestamp.valueOf("2025-08-11 08:30:00"),
                pickContributor(contributors, 2)
        );
        createActivityIfMissing(
                greenFutureActivities,
                activityRepository,
                greenFuture,
                "Trail Litter Survey",
                "Survey and remove litter along the public trail.",
                Timestamp.valueOf("2025-09-06 09:30:00"),
                pickContributor(contributors, 3)
        );
        createActivityIfMissing(
                greenFutureActivities,
                activityRepository,
                greenFuture,
                "School Sustainability Booth",
                "Run an information booth about everyday climate actions.",
                Timestamp.valueOf("2025-11-04 13:00:00"),
                pickContributor(contributors, 4)
        );
    }

    private User pickContributor(List<User> contributors, int index) {
        if (contributors.isEmpty()) {
            return null;
        }
        return contributors.get(index % contributors.size());
    }

    private User findUserByUsername(UserRepository userRepository, String username) {
        return userRepository.findByUsername(username)
                .orElse(null);
    }

    private void createActivityIfMissing(List<Activity> existingActivities,
                                         ActivityRepository activityRepository,
                                         Organisation organisation,
                                         String title,
                                         String description,
                                         Timestamp date,
                                         User contributor) {
        if (existingActivities.stream().anyMatch(activity -> title.equals(activity.getTitle()))) {
            return;
        }

        Activity activity = new Activity();
        activity.setTitle(title);
        activity.setBody(description);
        activity.setDescription(description);
        activity.setOrganisations(List.of(organisation));
        activity.setDate(date);
        activity.setStartTime("09:00");
        activity.setEndTime("12:00");
        activity.setDuration("3 hours");
        activity.setExpiresAt(Timestamp.valueOf("2025-12-31 23:59:59"));
        activity.setLocation("Green Future Community Site");
        activity.setCoordinates(new Coordinates(48.3069, 14.2858));
        activity.setCreatedBy(contributor);
        setActivityProfile(
                activity,
                List.of(
                        InterestCategory.ENVIRONMENT_AND_NATURE,
                        InterestCategory.OUTDOOR_ACTIVITIES,
                        InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS
                ),
                List.of(
                        requiredSkill("Teamwork", SkillProficiency.BEGINNER),
                        requiredSkill("Physical activity", SkillProficiency.BEGINNER),
                        preferredSkill("Organization", SkillProficiency.BEGINNER)
                ),
                List.of("environment", "community", "outdoors", "beginner-friendly", "physical")
        );
        activity.setCapacity(20);
        activity.setSpotsTaken(contributor == null ? 0 : 1);
        activity.setDifficulty("easy");
        activity.setPublic(true);
        activity.setStatus(ActivityStatus.finished);
        activity.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        activity.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        activity.setParticipants(contributor == null ? List.of() : List.of(contributor));

        activityRepository.save(activity);
        existingActivities.add(activity);
    }

    private void updateActivityForGoalDemo(List<Activity> activities,
                                           ActivityRepository activityRepository,
                                           String title,
                                           List<String> tags,
                                           ActivityStatus status) {
        activities.stream()
                .filter(activity -> title.equals(activity.getTitle()))
                .findFirst()
                .ifPresent(activity -> {
                    activity.setTags(tags);
                    activity.setCategories(InterestCategory.fromNames(tags));
                    activity.setStatus(status);
                    activity.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
                    activityRepository.save(activity);
                });
    }

    private void enrichDemoActivityRecommendationProfiles(ActivityRepository activityRepository) {
        activityRepository.findAll().forEach(activity -> {
            String title = activity.getTitle();
            if (title == null) {
                return;
            }

            boolean updated = switch (title) {
                case "Community Park Cleanup" -> {
                    setActivityProfile(
                            activity,
                            List.of(
                                    InterestCategory.ENVIRONMENT_AND_NATURE,
                                    InterestCategory.OUTDOOR_ACTIVITIES,
                                    InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS
                            ),
                            List.of(
                                    requiredSkill("Teamwork", SkillProficiency.BEGINNER),
                                    requiredSkill("Physical activity", SkillProficiency.BEGINNER),
                                    preferredSkill("Organization", SkillProficiency.BEGINNER)
                            ),
                            List.of("environment", "cleanup", "community", "outdoors", "beginner-friendly", "physical")
                    );
                    yield true;
                }
                case "Coding Workshop for Kids" -> {
                    setActivityProfile(
                            activity,
                            List.of(
                                    InterestCategory.EDUCATION_AND_TUTORING,
                                    InterestCategory.CHILDREN_AND_YOUTH,
                                    InterestCategory.TECHNOLOGY
                            ),
                            List.of(
                                    requiredSkill("Teaching", SkillProficiency.INTERMEDIATE),
                                    requiredSkill("Communication", SkillProficiency.BEGINNER),
                                    preferredSkill("Programming", SkillProficiency.BEGINNER),
                                    preferredSkill("Mentoring", SkillProficiency.BEGINNER)
                            ),
                            List.of("education", "coding", "kids", "beginner-friendly", "indoor")
                    );
                    yield true;
                }
                case "Setting up a Charity Concert for Trauma Recovery" -> {
                    setActivityProfile(
                            activity,
                            List.of(
                                    InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS,
                                    InterestCategory.HUMANITARIAN_AID,
                                    InterestCategory.ARTS_AND_CULTURE,
                                    InterestCategory.MUSIC,
                                    InterestCategory.ORGANISATION_AND_LEADERSHIP
                            ),
                            List.of(
                                    requiredSkill("Event Planning", SkillProficiency.INTERMEDIATE),
                                    preferredSkill("Communication", SkillProficiency.BEGINNER),
                                    preferredSkill("Fundraising", SkillProficiency.BEGINNER),
                                    preferredSkill("Teamwork", SkillProficiency.BEGINNER)
                            ),
                            List.of("fundraising", "event", "community", "music", "social", "weekend")
                    );
                    yield true;
                }
                case "Winter Support Initiative - Food Distribution" -> {
                    setActivityProfile(
                            activity,
                            List.of(
                                    InterestCategory.FOOD_AND_COOKING,
                                    InterestCategory.HUMANITARIAN_AID,
                                    InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS
                            ),
                            List.of(
                                    requiredSkill("Teamwork", SkillProficiency.BEGINNER),
                                    preferredSkill("Community Outreach", SkillProficiency.BEGINNER),
                                    preferredSkill("Organization", SkillProficiency.BEGINNER)
                            ),
                            List.of("food", "winter", "community", "families", "beginner-friendly", "social")
                    );
                    yield true;
                }
                case "Math Tutoring Session" -> {
                    setActivityProfile(
                            activity,
                            List.of(
                                    InterestCategory.EDUCATION_AND_TUTORING,
                                    InterestCategory.CHILDREN_AND_YOUTH
                            ),
                            List.of(
                                    requiredSkill("Teaching", SkillProficiency.INTERMEDIATE),
                                    requiredSkill("Mathematics", SkillProficiency.INTERMEDIATE),
                                    preferredSkill("Communication", SkillProficiency.BEGINNER),
                                    preferredSkill("Mentoring", SkillProficiency.BEGINNER)
                            ),
                            List.of("education", "tutoring", "students", "indoor", "after-school")
                    );
                    yield true;
                }
                case "Animal Shelter Care Day" -> {
                    setActivityProfile(
                            activity,
                            List.of(
                                    InterestCategory.ANIMALS,
                                    InterestCategory.OUTDOOR_ACTIVITIES,
                                    InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS
                            ),
                            List.of(
                                    requiredSkill("Animal Care", SkillProficiency.BEGINNER),
                                    preferredSkill("Teamwork", SkillProficiency.BEGINNER),
                                    preferredSkill("Responsibility", SkillProficiency.BEGINNER),
                                    preferredSkill("Cleaning", SkillProficiency.BEGINNER)
                            ),
                            List.of("animals", "shelter", "care", "outdoor", "beginner-friendly")
                    );
                    yield true;
                }
                case "Volunteer Firefighter Training" -> {
                    setActivityProfile(
                            activity,
                            List.of(
                                    InterestCategory.EMERGENCY_AND_RESCUE_SERVICES,
                                    InterestCategory.HEALTH_AND_WELL_BEING,
                                    InterestCategory.SPORTS_AND_FITNESS
                            ),
                            List.of(
                                    requiredSkill("Emergency Response", SkillProficiency.INTERMEDIATE),
                                    requiredSkill("First Aid", SkillProficiency.BEGINNER),
                                    preferredSkill("Teamwork", SkillProficiency.BEGINNER),
                                    preferredSkill("Physical Fitness", SkillProficiency.INTERMEDIATE)
                            ),
                            List.of("emergency", "training", "rescue", "physical", "advanced")
                    );
                    yield true;
                }
                case "Local Food Bank Assistance" -> {
                    setActivityProfile(
                            activity,
                            List.of(
                                    InterestCategory.FOOD_AND_COOKING,
                                    InterestCategory.HUMANITARIAN_AID,
                                    InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS
                            ),
                            List.of(
                                    requiredSkill("Organization", SkillProficiency.BEGINNER),
                                    requiredSkill("Teamwork", SkillProficiency.BEGINNER)
                            ),
                            List.of("food", "families", "community", "indoor", "beginner-friendly")
                    );
                    yield true;
                }
                case "Mountain Reforestation Project" -> {
                    setActivityProfile(
                            activity,
                            List.of(
                                    InterestCategory.ENVIRONMENT_AND_NATURE,
                                    InterestCategory.OUTDOOR_ACTIVITIES,
                                    InterestCategory.SPORTS_AND_FITNESS
                            ),
                            List.of(
                                    requiredSkill("Physical activity", SkillProficiency.INTERMEDIATE),
                                    requiredSkill("Teamwork", SkillProficiency.BEGINNER)
                            ),
                            List.of("environment", "trees", "outdoors", "physical", "weekend")
                    );
                    yield true;
                }
                case "Riverbank Waste Audit",
                     "Community Compost Build",
                     "Native Flower Planting",
                     "Trail Litter Survey",
                     "School Sustainability Booth" -> {
                    setActivityProfile(
                            activity,
                            List.of(
                                    InterestCategory.ENVIRONMENT_AND_NATURE,
                                    InterestCategory.OUTDOOR_ACTIVITIES,
                                    InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS
                            ),
                            List.of(
                                    requiredSkill("Teamwork", SkillProficiency.BEGINNER),
                                    requiredSkill("Physical activity", SkillProficiency.BEGINNER),
                                    preferredSkill("Organization", SkillProficiency.BEGINNER)
                            ),
                            List.of("environment", "community", "outdoors", "beginner-friendly", "physical")
                    );
                    yield true;
                }
                default -> false;
            };

            if (updated) {
                activity.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
                activityRepository.save(activity);
            }
        });
    }

    private Organisation findOrganisationByName(List<Organisation> organisations, String name) {
        return organisations.stream()
                .filter(organisation -> name.equals(organisation.getOrgName()))
                .findFirst()
                .orElse(null);
    }

    private void createGoalIfMissing(List<CommunityGoal> existingGoals,
                                     CommunityGoalRepository communityGoalRepository,
                                     Organisation organisation,
                                     String title,
                                     String description,
                                     int targetValue,
                                     int currentValue,
                                     List<String> activityTags,
                                     InterestRepository interestRepository,
                                     Timestamp startDate,
                                     Timestamp endDate) {
        if (organisation == null) {
            return;
        }

        CommunityGoal existingGoal = existingGoals.stream()
                .filter(goal -> title.equals(goal.getTitle()) || isSameGoalSeed(goal, organisation, activityTags))
                .findFirst()
                .orElse(null);

        if (existingGoal != null) {
            existingGoal.setTitle(title);
            existingGoal.setDescription(description);
            existingGoal.setTargetValue(targetValue);
            existingGoal.setCurrentValue(currentValue);
            existingGoal.setActivityInterests(resolveSeedInterests(interestRepository, activityTags));
            existingGoal.setStartDate(startDate);
            existingGoal.setEndDate(endDate);
            existingGoal.setStatus("ACTIVE");
            existingGoal.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            communityGoalRepository.save(existingGoal);
            return;
        }

        CommunityGoal goal = new CommunityGoal();
        goal.setTitle(title);
        goal.setDescription(description);
        goal.setTargetValue(targetValue);
        goal.setCurrentValue(currentValue);
        goal.setActivityInterests(resolveSeedInterests(interestRepository, activityTags));
        goal.setStartDate(startDate);
        goal.setEndDate(endDate);
        goal.setStatus("ACTIVE");
        goal.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        goal.setOrganisation(organisation);
        communityGoalRepository.save(goal);
        existingGoals.add(goal);
    }

    private List<Interest> resolveSeedInterests(InterestRepository interestRepository, List<String> interestNames) {
        List<Interest> existingInterests = interestRepository.findAll();
        List<Interest> resolvedInterests = new java.util.ArrayList<>();

        safeInterestNames(interestNames).forEach(name -> {
            Interest existingInterest = existingInterests.stream()
                    .filter(interest -> sameInterestName(interest.getName(), name))
                    .findFirst()
                    .orElse(null);

            if (existingInterest != null) {
                if (!name.equals(existingInterest.getName())) {
                    existingInterest.setName(name);
                    interestRepository.save(existingInterest);
                }
                resolvedInterests.add(existingInterest);
                return;
            }

            Interest interest = new Interest();
            interest.setName(name);
            Interest savedInterest = interestRepository.save(interest);
            existingInterests.add(savedInterest);
            resolvedInterests.add(savedInterest);
        });

        return resolvedInterests;
    }

    private List<String> safeInterestNames(List<String> interestNames) {
        if (interestNames == null) {
            return List.of();
        }
        return interestNames.stream()
                .map(this::normalizeInterestName)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();
    }

    private boolean isSameGoalSeed(CommunityGoal goal, Organisation organisation, List<String> activityTags) {
        return goal.getOrganisation() != null
                && goal.getOrganisation().getId() == organisation.getId()
                && (
                "Complete 2 environmental activities".equals(goal.getTitle())
                        || "Complete 7 environmental activities".equals(goal.getTitle())
        );
    }

    private void setUserProfile(User user, List<UserSkill> skills, List<InterestCategory> interests) {
        user.setSkillProfiles(skills);
        user.setInterestCategories(interests);
    }

    private UserSkill skill(String name, SkillProficiency proficiency) {
        return new UserSkill(name, null, proficiency);
    }

    private void setActivityProfile(Activity activity,
                                    List<InterestCategory> categories,
                                    List<ActivitySkillRequirement> skillRequirements,
                                    List<String> tags) {
        activity.setCategories(categories);
        activity.setSkillRequirements(skillRequirements);
        activity.setTags(tags);
    }

    private ActivitySkillRequirement requiredSkill(String name, SkillProficiency minimumProficiency) {
        return ActivitySkillRequirement.required(name, minimumProficiency);
    }

    private ActivitySkillRequirement preferredSkill(String name, SkillProficiency minimumProficiency) {
        return ActivitySkillRequirement.preferred(name, minimumProficiency);
    }

    private void seedCalendarSampleData(UserRepository userRepository,
                                        OrganisationRepository organisationRepository,
                                        ActivityRepository activityRepository,
                                        AppointmentRepository appointmentRepository,
                                        CommunityGoalRepository communityGoalRepository,
                                        InterestRepository interestRepository) {
        List<User> users = userRepository.findAll();
        List<Organisation> organisations = organisationRepository.findAll().stream()
                .map(item -> organisationRepository.findById(item.getId()).orElse(item))
                .toList();
        if (users.isEmpty() || organisations.isEmpty()) {
            return;
        }

        User organiser = findUserByUsername(userRepository, "alice");
        if (organiser == null) {
            organiser = users.get(0);
        }
        Organisation organisation = findOrganisationByName(organisations, "Green Future Org");
        if (organisation == null) {
            organisation = organisations.get(0);
        }

        YearMonth month = YearMonth.now();
        Timestamp now = new Timestamp(System.currentTimeMillis());
        ensureEveryUserHasOrganisation(users, organisations, organisationRepository, now);

        Activity meetup = activityRepository.findAll().stream()
                .filter(activity -> "Community Welcome Meetup".equals(activity.getTitle()))
                .findFirst()
                .orElseGet(Activity::new);
        configureCalendarActivity(
                meetup,
                "Community Welcome Meetup",
                "Meet volunteers, discover current projects and plan how to get involved.",
                organisation,
                organiser,
                timestamp(month, 8, 17, 0),
                "17:00",
                "19:00",
                "Community Center Linz",
                timestamp(month, 7, 23, 59),
                now
        );
        activityRepository.save(meetup);

        Activity workshop = activityRepository.findAll().stream()
                .filter(activity -> "Weekend Volunteer Workshop".equals(activity.getTitle()))
                .findFirst()
                .orElseGet(Activity::new);
        configureCalendarActivity(
                workshop,
                "Weekend Volunteer Workshop",
                "A practical workshop covering project planning and field preparation.",
                organisation,
                organiser,
                timestamp(month, 16, 9, 0),
                "09:00",
                "13:00",
                "Green Future Community Site",
                timestamp(month, 14, 23, 59),
                now
        );
        workshop = activityRepository.save(workshop);

        upsertCalendarAppointment(
                appointmentRepository,
                "Workshop: Project Planning",
                "Turn a volunteer idea into an actionable project plan.",
                "Green Future Community Site",
                timestamp(month, 16, 9, 0),
                timestamp(month, 16, 11, 0),
                organiser.getId(),
                workshop
        );
        upsertCalendarAppointment(
                appointmentRepository,
                "Workshop: Field Preparation",
                "Prepare equipment, roles and safety checklists for field work.",
                "Green Future Community Site",
                timestamp(month, 16, 11, 30),
                timestamp(month, 16, 13, 0),
                organiser.getId(),
                workshop
        );

        for (User user : users) {
            upsertCalendarAppointment(
                    appointmentRepository,
                    "Personal planning time",
                    "Review upcoming volunteer activities and set priorities.",
                    "Home",
                    timestamp(month, 5, 10, 0),
                    timestamp(month, 5, 11, 0),
                    user.getId(),
                    null
            );
            upsertCalendarAppointment(
                    appointmentRepository,
                    "Volunteer orientation call",
                    "Short personal onboarding call with the volunteer team.",
                    "Online",
                    timestamp(month, 12, 16, 30),
                    timestamp(month, 12, 17, 0),
                    user.getId(),
                    null
            );
        }

        organisation.setReactivationTime(timestamp(month, 25, 9, 0));
        organisationRepository.save(organisation);

        refreshExistingCalendarEntityDates(
                activityRepository,
                appointmentRepository,
                communityGoalRepository,
                month,
                now
        );
        ensureEveryUserHasJoinedActivity(users, activityRepository, month);
        ensureMonthlyGoalsForEveryOrganisation(
                organisations,
                communityGoalRepository,
                interestRepository,
                month,
                now
        );
        verifyCalendarSampleCoverage(users, organisations, activityRepository, appointmentRepository, communityGoalRepository, month);
    }

    private void ensureEveryUserHasOrganisation(List<User> users,
                                                List<Organisation> organisations,
                                                OrganisationRepository organisationRepository,
                                                Timestamp now) {
        Set<Integer> memberUserIds = new HashSet<>();
        organisations.forEach(organisation -> {
            if (organisation.getOrgMembers() != null) {
                organisation.getOrgMembers().stream()
                        .filter(member -> member.getUser() != null)
                        .forEach(member -> memberUserIds.add(member.getUser().getId()));
            }
        });

        int organisationIndex = 0;
        for (User user : users) {
            if (memberUserIds.contains(user.getId())) {
                continue;
            }

            Organisation organisation = organisations.get(organisationIndex % organisations.size());
            organisationIndex++;

            Set<OrganisationMember> members = organisation.getOrgMembers() == null
                    ? new HashSet<>()
                    : new HashSet<>(organisation.getOrgMembers());
            OrganisationMember membership = new OrganisationMember();
            membership.setOrganisation(organisation);
            membership.setUser(user);
            membership.setEngagementLevel(0);
            membership.setJoinedAt(now);
            members.add(membership);
            organisation.setOrgMembers(members);

            organisationRepository.save(organisation);
            memberUserIds.add(user.getId());
        }
    }

    private void ensureEveryUserHasJoinedActivity(List<User> users,
                                                  ActivityRepository activityRepository,
                                                  YearMonth month) {
        List<Activity> datedActivities = activityRepository.findAll().stream()
                .filter(activity -> isActivityInMonth(activity, month))
                .sorted(Comparator.comparingInt(Activity::getId))
                .toList();
        if (datedActivities.isEmpty()) {
            return;
        }

        int assignmentIndex = 0;
        for (User user : users) {
            boolean alreadyHasCurrentMonthActivity = activityRepository.findAllByParticipantsContains(user).stream()
                    .anyMatch(activity -> isActivityInMonth(activity, month));
            if (alreadyHasCurrentMonthActivity) {
                continue;
            }

            Activity candidate = datedActivities.get(assignmentIndex % datedActivities.size());
            assignmentIndex++;
            Activity activity = activityRepository.findById(candidate.getId()).orElse(candidate);
            List<User> participants = activity.getParticipants() == null
                    ? new java.util.ArrayList<>()
                    : new java.util.ArrayList<>(activity.getParticipants());
            participants.add(user);
            activity.setParticipants(participants);
            activity.setSpotsTaken(participants.size());
            if (activity.getCapacity() > 0 && activity.getCapacity() < participants.size()) {
                activity.setCapacity(participants.size());
            }
            activityRepository.save(activity);
        }
    }

    private boolean isActivityInMonth(Activity activity, YearMonth month) {
        return activity.getDate() != null
                && YearMonth.from(activity.getDate().toLocalDateTime()).equals(month);
    }

    private void ensureMonthlyGoalsForEveryOrganisation(List<Organisation> organisations,
                                                         CommunityGoalRepository communityGoalRepository,
                                                         InterestRepository interestRepository,
                                                         YearMonth month,
                                                         Timestamp now) {
        List<CommunityGoal> goals = communityGoalRepository.findAll();
        for (int index = 0; index < organisations.size(); index++) {
            Organisation organisation = organisations.get(index);
            String title = "Monthly volunteer goal: " + organisation.getOrgName();
            CommunityGoal goal = goals.stream()
                    .filter(existing -> title.equals(existing.getTitle()))
                    .filter(existing -> existing.getOrganisation() != null
                            && existing.getOrganisation().getId() == organisation.getId())
                    .findFirst()
                    .orElseGet(CommunityGoal::new);

            goal.setTitle(title);
            goal.setDescription("A current-month sample goal for every member of "
                    + organisation.getOrgName() + ".");
            goal.setTargetValue(4 + index % 3);
            goal.setCurrentValue(1 + index % 3);
            goal.setActivityInterests(resolveSeedInterests(interestRepository, List.of("community")));
            goal.setStartDate(timestamp(month, 1, 0, 0));
            goal.setEndDate(timestamp(month, month.lengthOfMonth(), 23, 59));
            goal.setStatus("ACTIVE");
            goal.setOrganisation(organisation);
            if (goal.getCreatedAt() == null) {
                goal.setCreatedAt(now);
            }
            goal.setUpdatedAt(now);
            communityGoalRepository.save(goal);
        }
    }

    private void verifyCalendarSampleCoverage(List<User> users,
                                              List<Organisation> organisations,
                                              ActivityRepository activityRepository,
                                              AppointmentRepository appointmentRepository,
                                              CommunityGoalRepository communityGoalRepository,
                                              YearMonth month) {
        Set<Integer> usersWithPersonalAppointments = new HashSet<>();
        appointmentRepository.findAll().stream()
                .filter(appointment -> appointment.getActivity() == null)
                .forEach(appointment -> usersWithPersonalAppointments.add(appointment.getCreatedBy()));

        Set<Integer> organisationIdsWithGoals = new HashSet<>();
        communityGoalRepository.findAll().stream()
                .filter(goal -> goal.getOrganisation() != null)
                .forEach(goal -> organisationIdsWithGoals.add(goal.getOrganisation().getId()));

        List<String> missingUsers = new java.util.ArrayList<>();
        for (User user : users) {
            boolean hasJoinedCurrentMonthActivity = activityRepository.findAllByParticipantsContains(user).stream()
                    .anyMatch(activity -> isActivityInMonth(activity, month));
            boolean hasVisibleGoal = organisations.stream()
                    .filter(organisation -> organisationIdsWithGoals.contains(organisation.getId()))
                    .anyMatch(organisation -> organisation.getOrgMembers() != null
                            && organisation.getOrgMembers().stream()
                            .anyMatch(member -> member.getUser() != null
                                    && member.getUser().getId() == user.getId()));
            if (!hasJoinedCurrentMonthActivity || !usersWithPersonalAppointments.contains(user.getId()) || !hasVisibleGoal) {
                missingUsers.add(user.getUsername());
            }
        }

        if (!missingUsers.isEmpty()) {
            throw new IllegalStateException("Calendar sample coverage is incomplete for users: "
                    + String.join(", ", missingUsers));
        }
    }

    private void refreshExistingCalendarEntityDates(ActivityRepository activityRepository,
                                                    AppointmentRepository appointmentRepository,
                                                    CommunityGoalRepository communityGoalRepository,
                                                    YearMonth currentMonth,
                                                    Timestamp now) {
        Map<Integer, LocalDateTime> activityDates = new HashMap<>();
        List<Activity> existingActivities = activityRepository.findAll().stream()
                .filter(activity -> !"Community Welcome Meetup".equals(activity.getTitle()))
                .filter(activity -> !"Weekend Volunteer Workshop".equals(activity.getTitle()))
                .sorted(Comparator.comparingInt(Activity::getId))
                .toList();

        for (int index = 0; index < existingActivities.size(); index++) {
            Activity activity = existingActivities.get(index);
            YearMonth scheduledMonth = currentMonth.plusMonths((index % 3) - 1L);
            int day = 3 + (index * 3) % Math.min(22, scheduledMonth.lengthOfMonth() - 2);
            LocalTime time = calendarTime(activity.getStartTime(), activity.getDate(), LocalTime.of(9, 0));
            LocalDateTime scheduled = scheduledMonth.atDay(day).atTime(time);

            activity.setDate(Timestamp.valueOf(scheduled));
            activity.setExpiresAt(Timestamp.valueOf(scheduled.minusDays(2).withHour(18).withMinute(0)));
            activity.setUpdatedAt(now);
            activityRepository.save(activity);
            activityDates.put(activity.getId(), scheduled);
        }

        Map<Integer, Integer> sessionIndexes = new HashMap<>();
        appointmentRepository.findAll().stream()
                .filter(appointment -> appointment.getActivity() != null)
                .filter(appointment -> !appointment.getTitle().startsWith("Workshop:"))
                .sorted(Comparator.comparingInt(Appointment::getId))
                .forEach(appointment -> {
                    Activity activity = appointment.getActivity();
                    LocalDateTime base = activityDates.get(activity.getId());
                    if (base == null) {
                        return;
                    }

                    int sessionIndex = sessionIndexes.getOrDefault(activity.getId(), 0);
                    sessionIndexes.put(activity.getId(), sessionIndex + 1);
                    LocalTime startTime = appointment.getStartDateTime() == null
                            ? base.toLocalTime()
                            : appointment.getStartDateTime().toLocalDateTime().toLocalTime();
                    long durationMinutes = appointment.getStartDateTime() != null && appointment.getEndDateTime() != null
                            ? Duration.between(
                                    appointment.getStartDateTime().toLocalDateTime(),
                                    appointment.getEndDateTime().toLocalDateTime()
                            ).toMinutes()
                            : 120;
                    durationMinutes = Math.max(30, durationMinutes);
                    LocalDateTime sessionStart = base.toLocalDate().plusDays(sessionIndex * 4L).atTime(startTime);

                    appointment.setStartDateTime(Timestamp.valueOf(sessionStart));
                    appointment.setEndDateTime(Timestamp.valueOf(sessionStart.plusMinutes(durationMinutes)));
                    appointmentRepository.save(appointment);
                });

        List<CommunityGoal> existingGoals = communityGoalRepository.findAll().stream()
                .filter(goal -> !"Monthly community challenge".equals(goal.getTitle()))
                .sorted(Comparator.comparingInt(CommunityGoal::getId))
                .toList();
        for (int index = 0; index < existingGoals.size(); index++) {
            CommunityGoal goal = existingGoals.get(index);
            YearMonth goalMonth = currentMonth.plusMonths((index % 4) - 1L);
            goal.setStartDate(timestamp(goalMonth, 1, 0, 0));
            goal.setEndDate(timestamp(goalMonth, goalMonth.lengthOfMonth(), 23, 59));
            goal.setUpdatedAt(now);
            communityGoalRepository.save(goal);
        }
    }

    private LocalTime calendarTime(String storedTime, Timestamp fallback, LocalTime defaultTime) {
        if (storedTime != null && !storedTime.isBlank()) {
            try {
                return LocalTime.parse(storedTime);
            } catch (java.time.format.DateTimeParseException ignored) {
                // Fall through to the timestamp or default time.
            }
        }
        return fallback == null ? defaultTime : fallback.toLocalDateTime().toLocalTime();
    }
    private void configureCalendarActivity(Activity activity,
                                           String title,
                                           String description,
                                           Organisation organisation,
                                           User organiser,
                                           Timestamp date,
                                           String startTime,
                                           String endTime,
                                           String location,
                                           Timestamp expiresAt,
                                           Timestamp now) {
        activity.setTitle(title);
        activity.setBody(description);
        activity.setDescription(description);
        activity.setProjectId(0);
        activity.setOrganisations(List.of(organisation));
        activity.setDate(date);
        activity.setStartTime(startTime);
        activity.setEndTime(endTime);
        activity.setDuration("2 hours");
        activity.setExpiresAt(expiresAt);
        activity.setLocation(location);
        activity.setCoordinates(new Coordinates(48.3069, 14.2858));
        activity.setParticipants(List.of(organiser));
        activity.setCreatedBy(organiser);
        setActivityProfile(
                activity,
                List.of(InterestCategory.COMMUNITY_AND_SOCIAL_EVENTS),
                List.of(requiredSkill("Teamwork", SkillProficiency.BEGINNER)),
                List.of("community", "social", "beginner-friendly")
        );
        activity.setQualifications(List.of());
        activity.setPrerequisites(List.of());
        activity.setCapacity(20);
        activity.setSpotsTaken(1);
        activity.setEquipmentProvided(List.of());
        activity.setDifficulty("easy");
        activity.setPublic(true);
        activity.setStatus(ActivityStatus.upcoming);
        if (activity.getCreatedAt() == null) {
            activity.setCreatedAt(now);
        }
        activity.setUpdatedAt(now);
    }

    private void upsertCalendarAppointment(AppointmentRepository appointmentRepository,
                                           String title,
                                           String description,
                                           String location,
                                           Timestamp start,
                                           Timestamp end,
                                           int createdBy,
                                           Activity activity) {
        Appointment appointment = appointmentRepository.findAll().stream()
                .filter(item -> title.equals(item.getTitle()))
                .filter(item -> item.getCreatedBy() == createdBy)
                .filter(item -> activity == null
                        ? item.getActivity() == null
                        : item.getActivity() != null && item.getActivity().getId() == activity.getId())
                .findFirst()
                .orElseGet(Appointment::new);
        appointment.setTitle(title);
        appointment.setDescription(description);
        appointment.setLocation(location);
        appointment.setStartDateTime(start);
        appointment.setEndDateTime(end);
        appointment.setCreatedBy(createdBy);
        appointment.setActivity(activity);
        appointmentRepository.save(appointment);
    }

    private Timestamp timestamp(YearMonth month, int day, int hour, int minute) {
        LocalDateTime dateTime = month.atDay(Math.min(day, month.lengthOfMonth())).atTime(hour, minute);
        return Timestamp.valueOf(dateTime);
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

    private void seedInterestCatalog(UserRepository userRepository,
                                     OrganisationRepository organisationRepository,
                                     ActivityRepository activityRepository,
                                     CommunityGoalRepository communityGoalRepository,
                                     InterestRepository interestRepository) {
        Set<String> interestNames = new HashSet<>();

        addAllInterestNames(
                interestNames,
                Arrays.stream(InterestCategory.values())
                        .map(InterestCategory::getLabel)
                        .toList()
        );

        addAllInterestNames(interestNames, Arrays.asList(
                "Teamwork",
                "Organization",
                "Physical activity",
                "Programming",
                "Communication",
                "Teaching",
                "Problem-Solving",
                "Mentoring",
                "Event Support",
                "Fundraising",
                "First Aid",
                "Environmental Work",
                "Social Media"
        ));

        userRepository.findAll().forEach(user -> addAllInterestNames(interestNames, user.getInterests()));
        organisationRepository.findAll().forEach(organisation -> addAllInterestNames(interestNames, organisation.getTags()));
        activityRepository.findAll().forEach(activity -> addAllInterestNames(interestNames, activity.getTags()));
        communityGoalRepository.findAll().forEach(goal ->
                addAllInterestNames(
                        interestNames,
                        goal.getActivityInterests() == null
                                ? List.of()
                                : goal.getActivityInterests().stream().map(Interest::getName).toList()
                )
        );

        List<Interest> existingInterests = interestRepository.findAll();

        interestNames.forEach(name -> {
            String normalizedName = normalizeInterestName(name);
            if (normalizedName == null) {
                return;
            }

            Interest existingInterest = existingInterests.stream()
                    .filter(interest -> sameInterestName(interest.getName(), normalizedName))
                    .findFirst()
                    .orElse(null);

            if (existingInterest != null) {
                if (!normalizedName.equals(existingInterest.getName())) {
                    existingInterest.setName(normalizedName);
                    interestRepository.save(existingInterest);
                }
                return;
            }

            Interest interest = new Interest();
            interest.setName(normalizedName);
            interestRepository.save(interest);
            existingInterests.add(interest);
        });
    }

    private void addAllInterestNames(Set<String> target, Iterable<String> values) {
        if (values == null) {
            return;
        }

        for (String value : values) {
            String normalizedName = normalizeInterestName(value);
            if (normalizedName != null) {
                target.add(normalizedName);
            }
        }
    }

    private String normalizeInterestName(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim().replaceAll("\\s+", " ");
        return trimmed.substring(0, 1).toUpperCase(Locale.ROOT)
                + trimmed.substring(1).toLowerCase(Locale.ROOT);
    }

    private boolean sameInterestName(String first, String second) {
        return normalizeInterestName(first) != null
                && normalizeInterestName(first).equals(normalizeInterestName(second));
    }

}
