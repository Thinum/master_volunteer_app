import http from 'node:http';

const users = [
  { id: 1, username: 'alice', name: 'Alice', email: 'alice@mail.com', phone: '+43 660 111 0001', profilePicture: 'https://api.dicebear.com/9.x/lorelei/svg/seed=1&size=512', skills: ['Teamwork', 'Communication', 'Mentoring'], interests: ['Education and tutoring', 'Environment and nature', 'Community and social events'], joinedAt: '2024-03-10T02:30:00Z', isActive: true },
  { id: 2, username: 'bob', name: 'Bob', email: 'bob@mail.com', profilePicture: 'https://api.dicebear.com/9.x/lorelei/svg/seed=8&size=512', skills: ['Organization', 'Physical activity'], interests: ['Fundraising', 'Event support'], joinedAt: '2024-03-10T02:30:00Z', isActive: true },
  { id: 3, username: 'charlie', name: 'Charlie', email: 'charlie@mail.com', profilePicture: 'https://api.dicebear.com/9.x/lorelei/svg/seed=3&size=512', skills: ['Programming', 'Problem-Solving'], interests: ['Teaching', 'Social media'], joinedAt: '2024-03-10T02:30:00Z', isActive: true },
  { id: 4, username: 'diana', name: 'Diana', email: 'diana@mail.com', phone: '+43 660 111 2222', profilePicture: 'https://api.dicebear.com/9.x/lorelei/svg/seed=4&size=512', skills: ['First Aid', 'Communication'], interests: ['Event support', 'Fundraising'], joinedAt: '2024-03-10T02:30:00Z', isActive: true },
  { id: 5, username: 'ethan', name: 'Ethan', email: 'ethan@mail.com', profilePicture: 'https://api.dicebear.com/9.x/lorelei/svg/seed=12&size=512', skills: ['Logistics'], interests: ['Community'], joinedAt: '2024-03-10T02:30:00Z', isActive: true },
  { id: 6, username: 'fiona', name: 'Fiona', email: 'fiona@mail.com', profilePicture: 'https://api.dicebear.com/9.x/lorelei/svg/seed=6&size=512', skills: ['First Aid'], interests: ['Health'], joinedAt: '2024-03-10T02:30:00Z', isActive: false },
  { id: 7, username: 'george', name: 'George', email: 'george@mail.com', profilePicture: 'https://api.dicebear.com/9.x/lorelei/svg/seed=13&size=512', skills: ['Planning'], interests: ['Culture'], joinedAt: '2024-03-10T02:30:00Z', isActive: true }
];

const organisations = [
  { id: 1, orgName: 'Tech Aid Association', location: { lat: 48.2082, lon: 16.3738 }, profilePicture: 'https://api.dicebear.com/10.x/shapes/svg?seed=Tech%20Aid%20Association', createdAt: '2023-06-15T00:00:00Z', body: 'Helping underprivileged communities learn coding skills.', deactivated: false, orgContacts: [users[0], users[1]], members: [users[0], users[1], users[2]], category: 'Technology', tags: ['coding', 'programming', 'mentorship', 'youth', 'digital skills'] },
  { id: 2, orgName: 'Green Future Org', location: { lat: 48.3069, lon: 14.2858 }, profilePicture: 'https://api.dicebear.com/10.x/shapes/svg?seed=Green%20Future%20Org', createdAt: '2023-09-20T00:00:00Z', body: 'Dedicated to sustainability and green innovation.', deactivated: false, orgContacts: [users[2]], members: [users[0], users[2], users[3]], category: 'Environment', tags: ['sustainability', 'climate', 'renewable energy', 'eco projects'] },
  { id: 3, orgName: 'Community Connect', location: { lat: 47.0707, lon: 15.4395 }, profilePicture: 'https://api.dicebear.com/10.x/shapes/svg?seed=Community%20Connect', createdAt: '2023-10-01T00:00:00Z', body: 'Connecting volunteers with local social projects.', deactivated: false, orgContacts: [users[3]], members: [users[0], users[1], users[3], users[4]], category: 'Community', tags: ['volunteering', 'local projects', 'non-profit', 'social impact'] },
  { id: 4, orgName: 'Education for All', location: { lat: 47.8095, lon: 13.055 }, profilePicture: 'https://api.dicebear.com/10.x/shapes/svg?seed=Education%20for%20All', createdAt: '2024-02-10T00:00:00Z', body: 'Providing access to quality education worldwide.', deactivated: false, orgContacts: [users[4]], members: [users[0], users[4], users[5]], category: 'Education', tags: ['schools', 'learning', 'scholarships', 'children', 'global'] },
  { id: 5, orgName: 'HealthFirst Initiative', location: { lat: 48.1486, lon: 17.1077 }, profilePicture: 'https://api.dicebear.com/10.x/shapes/svg?seed=HealthFirst%20Initiative', createdAt: '2023-05-11T00:00:00Z', body: 'Promoting healthy lifestyles and preventive medicine.', deactivated: false, orgContacts: [users[5]], members: [users[3], users[5]], category: 'Health', tags: ['wellness', 'fitness', 'nutrition', 'mental health', 'prevention'] },
  { id: 6, orgName: 'Cultural Bridges Foundation', location: { lat: 46.0569, lon: 14.5058 }, profilePicture: 'https://api.dicebear.com/10.x/shapes/svg?seed=Cultural%20Bridges%20Foundation', createdAt: '2023-07-22T00:00:00Z', body: 'Encouraging cultural exchange and diversity awareness.', deactivated: false, orgContacts: [users[6]], members: [users[1], users[6]], category: 'Culture', tags: ['diversity', 'exchange programs', 'international', 'inclusion'] }
];

const baseActivities = [
  [1, 'Community Park Cleanup', 'A community-driven initiative to clean up the local park, remove litter, and improve green spaces.', 1, '2026-08-12T09:00:00Z', 'Blue Mountain Park', 'open', ['environment', 'community', 'volunteering'], [users[0], users[1], users[2], users[3]]],
  [2, 'Coding Workshop for Kids', 'Interactive workshop introducing children to programming basics using visual and simple coding tools.', 1, '2026-08-20T09:00:00Z', 'Tech Learning Center', 'upcoming', ['education', 'coding', 'kids'], [users[0], users[2], users[6]]],
  [3, 'Food Bank Evening Shift', 'Sort donations and prepare food packages for local families.', 3, '2026-07-18T16:00:00Z', 'Community Connect Warehouse', 'open', ['community', 'food', 'families'], [users[1], users[3], users[4]]],
  [4, 'River Trail Tree Planting', 'Plant native trees and restore shade along the river trail.', 2, '2026-09-04T08:30:00Z', 'Danube River Trail', 'open', ['environment', 'trees', 'outdoors'], [users[0], users[2], users[4], users[6]]],
  [5, 'Senior Digital Help Desk', 'Help seniors use phones, email, video calls, and public service apps.', 4, '2026-09-08T10:00:00Z', 'Education for All Center', 'upcoming', ['education', 'technology', 'seniors'], [users[0], users[1], users[5]]],
  [6, 'Community Health Day', 'Support a wellness day with check-in, guidance, and booth logistics.', 5, '2026-10-12T09:00:00Z', 'HealthFirst Initiative Hall', 'open', ['health', 'wellness', 'community'], [users[2], users[3], users[4], users[6]]]
];
const activities = baseActivities.map(([id, title, description, orgId, date, location, status, tags, participants]) => ({ id, title, body: description, description, projectId: 100 + id, organisations: [organisations[orgId - 1]], appointments: [], date, startTime: date.slice(11, 16), endTime: '14:00', duration: '5 hours', expiresAt: '2026-12-31T23:59:59Z', location, coordinates: { lat: 48.3069, lng: 14.2858 }, participants, contacts: [{ name: 'Emily Carter', role: 'Event Coordinator', phone: '123-456-789', email: 'emily@example.com' }], orgContacts: [{ name: 'John Doe', role: 'Coordinator', phone: '987-654-321', email: 'org@example.com' }], createdBy: users[0], skills: ['Teamwork', 'Communication'], qualifications: ['None required'], prerequisites: ['Positive attitude'], capacity: 25, spotsTaken: participants.length, equipmentProvided: ['Gloves', 'Information pack'], tags, difficulty: 'easy', isPublic: true, status, createdAt: '2026-06-01T12:00:00Z', updatedAt: '2026-07-01T12:00:00Z' }));

const goals = [
  { id: 1, title: '100 volunteer hours for greener neighborhoods', description: 'Complete 100 hours of environmental volunteering together.', targetValue: 100, currentValue: 75, startDate: '2026-01-01T00:00:00Z', endDate: '2026-12-31T00:00:00Z', status: 'ACTIVE', organisation: organisations[1], activityTags: ['environment', 'community'], contributions: [{ member: users[0], activities: [activities[0], activities[3]] }, { member: users[2], activities: [activities[3]] }] },
  { id: 2, title: 'Teach digital skills to 50 learners', description: 'Help learners gain practical confidence with digital tools.', targetValue: 50, currentValue: 31, startDate: '2026-02-01T00:00:00Z', endDate: '2026-11-30T00:00:00Z', status: 'ACTIVE', organisation: organisations[3], activityTags: ['education', 'technology'], contributions: [{ member: users[1], activities: [activities[1]] }] }
];

const forumEntries = [
  { id: 1, title: 'Community Garden Project', lastMessage: 'Looking for volunteers to help plant native flowers this weekend!', lastEdited: '2026-07-01T10:00:00Z', icon: 'https://api.dicebear.com/9.x/lorelei/svg/seed=4', newPosts: 5 },
  { id: 2, title: 'Local Library Reading Program', lastMessage: 'Does anyone have experience organizing story time for kids aged 6-10?', lastEdited: '2026-06-28T10:00:00Z', icon: 'https://api.dicebear.com/9.x/lorelei/svg/seed=5', newPosts: 0 },
  { id: 3, title: 'River Cleanup Initiative', lastMessage: 'Next meetup: Saturday at 9 AM.', lastEdited: '2026-07-03T10:00:00Z', icon: 'https://api.dicebear.com/9.x/lorelei/svg/seed=6', newPosts: 2 }
];
const conversations = [
  { id: 1, ownerUserId: 1, contactUserId: 2, contact: 'Bob', avatar: users[1].profilePicture, lastMessage: 'I can bring extra gloves to the cleanup.', timestamp: '2026-07-04T14:00:00Z', unreadCount: 2, isActive: true },
  { id: 2, ownerUserId: 1, contactUserId: 3, contact: 'Charlie', avatar: users[2].profilePicture, lastMessage: 'See you at the coding workshop!', timestamp: '2026-07-04T12:30:00Z', unreadCount: 0, isActive: true }
];

const notifications = [{ id: 1, type: 'COMMUNITY_GOAL_PROGRESS', text: 'Your organisation’s community goal is 75% complete.', hasBeenRead: false, title: 'Community goal update', createdAt: new Date().toISOString(), communityGoalTitle: '100 volunteer hours', organisationName: 'Green Future Org', notificationPayloadList: [{ payloadType: 'progress', payload: '75' }] }];
const relationships = [
  { user: users[0], friend: users[1], type: 'Friend', likeScore: 85 },
  { user: users[0], friend: users[2], type: 'Acquaintant', likeScore: 60 },
  { user: users[0], friend: users[3], type: 'Relative', likeScore: 92 }
];

function json(res, value, status = 200) {
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': 'http://127.0.0.1:4200',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET,POST,PUT,OPTIONS'
  });
  res.end(JSON.stringify(value));
}

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return json(res, {});
  const url = new URL(req.url, 'http://127.0.0.1:8080');
  const path = url.pathname;
  if (path === '/auth/login') return json(res, { token: 'documentation-session', expiryDate: '2099-12-31T23:59:59Z' });
  if (path === '/users/me') return json(res, users[0]);
  if (path === '/users' || path === '/users/active') return json(res, users.filter(user => path !== '/users/active' || user.isActive));
  if (/^\/users\/\d+$/.test(path)) return json(res, users.find(user => user.id === Number(path.split('/')[2])) ?? users[0]);
  if (/^\/users\/\d+\/friends$/.test(path)) return json(res, users.slice(1, 4));
  if (/^\/users\/\d+\/relationships$/.test(path)) return json(res, relationships);
  if (/^\/users\/\d+\/organisations$/.test(path)) return json(res, organisations.slice(0, 3));
  if (/^\/users\/\d+\/activities$/.test(path) || /^\/activities\/user\/\d+$/.test(path)) return json(res, [activities[0], activities[3], activities[4]]);
  if (path === '/activities') return json(res, activities);
  if (path === '/activities/recommendations') return json(res, activities.slice(1, 4).map((activity, index) => ({ activity, score: 0.92 - index * 0.08, reasons: [{ type: 'INTEREST', label: activity.tags[0], detail: 'Matches your interests' }] })));
  if (path === '/activities/tags/catalog') return json(res, ['community', 'education', 'environment', 'health', 'technology', 'volunteering']);
  if (/^\/activities\/\d+$/.test(path)) return json(res, activities.find(activity => activity.id === Number(path.split('/')[2])) ?? activities[0]);
  if (path === '/organisations') return json(res, organisations);
  if (/^\/organisations\/\d+\/exampleActivities$/.test(path)) return json(res, activities.filter(activity => activity.organisations[0].id === Number(path.split('/')[2])));
  if (/^\/organisations\/\d+$/.test(path)) return json(res, organisations.find(org => org.id === Number(path.split('/')[2])) ?? organisations[0]);
  if (path === '/notifications/notifications') return json(res, notifications);
  if (path === '/community-goals') return json(res, goals);
  if (/^\/community-goals\/\d+$/.test(path)) return json(res, goals.find(goal => goal.id === Number(path.split('/')[2])) ?? goals[0]);
  if (path === '/community-goals/activity-tags') return json(res, ['community', 'education', 'environment', 'health']);
  if (path === '/community-goals/activity-interests') return json(res, ['Education and tutoring', 'Environment and nature', 'Community and social events']);
  if (path === '/interests') return json(res, ['Education and tutoring', 'Environment and nature']);
  if (path === '/interests/catalog') return json(res, ['EDUCATION_AND_TUTORING', 'ENVIRONMENT_AND_NATURE', 'COMMUNITY_AND_SOCIAL_EVENTS', 'HEALTH_AND_WELLBEING']);
  if (path === '/forum-entries') return json(res, forumEntries);
  if (/^\/forum-entries\/\d+\/replies$/.test(path)) {
    const forumEntryId = Number(path.split('/')[2]);
    const forum = forumEntries.find(entry => entry.id === forumEntryId) ?? forumEntries[0];
    return json(res, [{ id: 1, author: 'Community Team', avatar: forum.icon, message: forum.lastMessage, createdAt: forum.lastEdited, forumEntryId }]);
  }
  if (/^\/forum-entries\/\d+$/.test(path)) return json(res, forumEntries.find(entry => entry.id === Number(path.split('/')[2])) ?? forumEntries[0]);
  if (path === '/chat-conversations') return json(res, conversations);
  if (/^\/chat-conversations\/\d+\/messages$/.test(path)) {
    const conversationId = Number(path.split('/')[2]);
    const conversation = conversations.find(item => item.id === conversationId) ?? conversations[0];
    return json(res, [
      { id: 1, author: 'contact', authorUserId: conversation.contactUserId, authorName: conversation.contact, avatar: conversation.avatar, ownMessage: false, text: conversation.lastMessage, createdAt: conversation.timestamp, conversationId },
      { id: 2, author: 'me', authorUserId: 1, authorName: 'Alice', avatar: users[0].profilePicture, ownMessage: true, text: 'Perfect, thank you! See you there.', createdAt: '2026-07-04T14:12:00Z', conversationId }
    ]);
  }
  if (/^\/chat-conversations\/\d+$/.test(path)) return json(res, conversations.find(item => item.id === Number(path.split('/')[2])) ?? conversations[0]);
  return json(res, { message: 'Not found' }, 404);
}).listen(8080, '127.0.0.1', () => console.log('Documentation mock API listening on http://127.0.0.1:8080'));
