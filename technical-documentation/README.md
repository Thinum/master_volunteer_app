# Technical documentation screenshots

This folder contains full-page screenshots of every distinct application route and the additional community tab states that are useful in technical documentation. The captures use the seeded Alice demo profile and representative populated data.

## Screenshot index

| File | Route or UI state |
| --- | --- |
| `01-login.jpg` | `/` — login and public organisation browser |
| `02-register.jpg` | `/register` — account registration |
| `03-home.jpg` | `/home` — authenticated dashboard |
| `04-organisations.jpg` | `/organisations` — organisation overview |
| `05-organisation-detail.jpg` | `/organisations/1` — organisation detail |
| `06a-community-friends.jpg` | `/community` — friends and relationship graph |
| `06b-community-forum.jpg` | `/community` — forum tab |
| `06c-community-chat-list.jpg` | `/community` — chat tab |
| `06d-community-activity-graph.jpg` | `/community` — activity graph tab |
| `07-forum-detail.jpg` | `/community/forum/1` — forum topic |
| `08-chat-detail.jpg` | `/community/chat/1` — conversation detail |
| `09-profile.jpg` | `/profile` — user profile |
| `10-profile-edit.jpg` | `/profile/edit` — profile editor |
| `11-activities.jpg` | `/activities` — activity overview |
| `12-activity-detail.jpg` | `/activities/1` — activity detail |
| `13-project-detail.jpg` | `/projects/1` — project detail |
| `14-create-activity.jpg` | `/createActivity` — activity creation form |
| `15-create-organisation.jpg` | `/createOrganisation` — organisation creation form |
| `16-notifications.jpg` | `/notifications` — notification list |
| `17-reports.jpg` | `/reports` — reports dashboard |
| `18-community-goals.jpg` | `/community-goals?organisationId=2` — organisation goals |

The local `mock-api-server.mjs` file provides a deterministic documentation dataset when the MySQL-backed API is not running. It is intended only for screenshot generation, not production use.
