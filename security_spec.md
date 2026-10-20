# Firestore Security Specification

## 1. Data Invariants
- **Users**: A user document must have `uid == request.auth.uid` on create. Users cannot self-escalate their `role` to 'admin' or 'moderator' without admin privilege. Suspended users cannot create or update content.
- **Resources**: Any member can create a resource where `authorId == request.auth.uid`. An author can edit their own resource fields. Only moderators/admins can toggle `isHidden` or force delete/modify other users' resources.
- **Favorites**: Stored at `/favorites/{favoriteId}` where `favoriteId == userId + '_' + resourceId`. User can only create or delete favorites where `incoming().userId == request.auth.uid`.
- **Reports**: Any authenticated user can submit a report where `reporterId == request.auth.uid`. Only moderators/admins can read, update status, or resolve reports.
- **Moderation Logs**: Can only be created and read by moderators/admins. Cannot be modified or deleted.
- **Settings**: Read allowed by public (so all visitors can view site name, announcements, and categories). Update/create strictly limited to admins.
- **Admins**: Pre-seeded with superuser email `s6710380107@pkru.ac.th` and `/admins/{uid}` docs. Only existing admins can add new admins.

## 2. The "Dirty Dozen" Threat Payloads
1. **Privilege Escalation on User Profile**: Guest/Member attempts `create /users/{uid}` with `role: "admin"`. -> REJECT.
2. **Ghost Field Injection**: Member attempts `update /resources/{id}` with `{ malicious_flag: true }`. -> REJECT.
3. **Author Spoofing**: User A creates `/resources/{id}` with `authorId: "user-B-uid"`. -> REJECT.
4. **Unauthenticated Resource Write**: Unauthenticated client attempts `create /resources/{id}`. -> REJECT.
5. **ID Poisoning Attack**: Writing with an excessively long path ID (> 128 characters or special illegal symbols). -> REJECT.
6. **Report Tampering by Member**: Regular member attempts to change a report status to "resolved". -> REJECT.
7. **Report Snooping**: Regular user attempts to `get /reports/{id}` submitted by someone else. -> REJECT.
8. **Settings Vandalism**: Regular user attempts to update `/settings/siteConfig`. -> REJECT.
9. **Log Deletion**: An attacker attempts to delete `/moderationLogs/{id}` to cover tracks. -> REJECT.
10. **Favorite Hijacking**: User A attempts to delete or write a favorite for User B. -> REJECT.
11. **Immoral Field Modification**: Updating an existing resource and trying to change the immutable `authorId`. -> REJECT.
12. **Blanket Query Scraping**: Attempting to query private reports or sensitive user data without permission. -> REJECT.
