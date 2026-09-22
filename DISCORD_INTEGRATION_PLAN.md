# Discord integration plan for Winterjam admins

This is a design document for a Discord-based invite and login flow that fits the current app structure.

The current app already has:
- a local user model in the backend
- admin-only invite creation in the admin users page
- role-based access (`user`, `admin`, `super_admin`)
- email/password login for local accounts

The goal is to make it easy for super admins to create new super admins, admins, or other user accounts through a streamlined invite flow, without requiring an email + password setup. Account creation and linking must work even when public registration is closed. That means the app should support a unique, single-use invite link whose validity expires after a limited time window such as 1 hour, 3 days, or 7 days, and should allow the invited Discord user to be assigned a role as part of that invite.

---

## 1. Goals

1. Super admins can invite someone from the Winterjam Discord server and assign them a role such as `user`, `admin`, or `super_admin`.
2. A Discord user can be turned into a local app account without needing an email address or a password.
3. The app can create the account automatically when the invite is accepted, even when public registration is disabled.
4. The user can log in with Discord instead of a password.
5. Admins and super admins can still manage roles and access from the admin panel.
6. The flow should stay safe, auditable, and easy for moderators to operate.

---

## 2. Product direction

The best approach for this project is a hybrid model:

- keep the existing local account system
- add Discord as an auth provider
- allow Discord-linked users to log in without password
- support admin invites that create a local user and then link that user to a Discord identity

This is cleaner than replacing the current app auth completely because the rest of the app already depends on local user records, roles, audit logs, and admin permissions.

---

## 3. Current app fit

At the moment, the project already supports:
- admin user management at `src/app/admin/users/page.js`
- invite creation through the backend route `POST /api/admin/users/invite`
- role enforcement in backend auth middleware
- account creation using local DB rows and a password hash

This means the Discord feature should extend the existing invite flow rather than invent a separate identity system.

---

## 4. Proposed user stories

### Admin story

As a moderator or admin, I want to:
- open the admin users page
- click a “Invite via Discord” action
- choose a Discord user from the server or paste a Discord username/user ID
- assign a role (user/admin)
- create the invite
- have the app prepare a sign-in link or invite flow that works without email/password

### New user story

As a Discord user invited to Winterjam, I want to:
- click an invite link from Discord or the admin panel
- authenticate with Discord
- have the app detect that I was invited
- automatically create or link my local Winterjam account
- log into the app without entering a password

### Returning user story

As a user already linked to Discord, I want to:
- click “Login with Discord” on the site
- land back in the app with my account immediately available
- not be asked for email/password again

---

## 5. Recommended architecture

### 5.1 Identity model

Add Discord identity data to the existing local user record.

Suggested fields on `users`:
- `discord_user_id` — nullable, unique string
- `discord_username` — nullable string
- `discord_avatar_url` — nullable string
- `auth_provider` — enum or string, e.g. `local`, `discord`
- `discord_linked_at` — nullable timestamp
- `last_discord_login_at` — nullable timestamp

If we want a cleaner model later, we can add a separate table:
- `user_auth_providers`
  - `id`
  - `user_id`
  - `provider` (`discord`)
  - `provider_user_id`
  - `provider_username`
  - `access_token_encrypted` (optional, only if needed)
  - `created_at`
  - `updated_at`

For the first version, adding fields directly to `users` is simpler and matches the current app’s single-user table design.

### 5.2 Invite model

The current invite system is already close to the right design. Extend it with a Discord-aware invite record.

Recommended additions to the `invites` table:
- `invite_type` — `email`, `discord`, `manual`
- `discord_user_id` — nullable
- `discord_username` — nullable
- `claimed_by_user_id` — nullable
- `claimed_at` — nullable
- `source` — `admin_panel`, `discord_bot`, `manual`

This lets the app know whether a user was invited via Discord or via an email invite link.

---

## 6. Admin-side UX proposal

Add a new section in the admin users page, near the current invitation area.

### Suggested admin actions

1. “Invite via Discord”
   - open a modal
   - inputs:
     - Discord username or user ID
     - role: User/Admin
     - expiry: 1h / 3d / 7d
     - require Discord server membership check
   - action:
     - validate the Discord user against the Winterjam guild
     - create or update local user record
     - generate invite token
     - return a link that opens the site and signs the user in with Discord

2. “Linked Discord users” list
   - show user name, Discord tag, linked status, last login, role
   - allow admins to unlink or re-sync a Discord account

3. “Discord settings” panel
   - guild ID
   - client ID
   - client secret
   - allowed roles
   - login enabled flag
   - callback URL

This should live under the existing admin user-management area so moderators do not need a separate admin section.

---

## 7. Backend flow design

### 7.1 Discord OAuth setup

The app should use Discord OAuth2 with:
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI`
- `DISCORD_GUILD_ID` (for server membership checks)

The app needs a route pair like:
- `GET /api/auth/discord/login`
- `GET /api/auth/discord/callback`

The login callback should:
1. exchange the auth code for a Discord access token
2. fetch the user profile from Discord
3. verify the user is in the configured Winterjam guild, if required
4. look up the user by `discord_user_id`
5. if not found, check for a pending invite token
6. create or link the account automatically
7. set the session and redirect to the app

### 7.2 Invite flow

For admin invite by Discord, the backend should:
- accept `discordUserId`, `username` (optional), `role`, `expiresOption`
- check the Discord user is in the guild and has the expected permission level if required
- find or create a local user
- set `auth_provider = 'discord'` when linked
- store `discord_user_id` and `discord_username`
- generate a token and return a “Continue with Discord” link

When the user clicks that link, the app routes through the Discord OAuth flow and confirms the invited identity matches the record.

### 7.3 Auto-create account flow

If the user has a valid Discord invite and no local account exists:
- create user row with `username` from Discord or a generated unique name
- email can be blank or set to `discord-<id>@local.invalid`
- password hash can be empty or a random generated value
- mark account active
- assign the role from the invite
- set `discord_user_id` and `discord_username`
- mark the invite as used
- log in the user automatically after callback

This preserves the current local database model while removing the need for a password in the Discord flow.

---

## 8. Login behavior

### Login page

Add a button:
- “Continue with Discord”

This calls the backend Discord OAuth endpoint and starts the standard OAuth redirect flow.

### Login decision tree

1. User clicks login with Discord.
2. Discord authenticates the user.
3. Backend fetches guild membership and profile.
4. If user has a valid linked local account:
   - log in directly
5. Else if a valid invite exists for this Discord user:
   - create the account and log in
6. Else:
   - show a friendly “This Discord account is not linked to a Winterjam account yet. Ask a moderator for an invite.”

This makes the flow easy for moderators and reduces friction for invited participants.

---

## 9. Security notes

This is important for the Winterjam app and should be handled carefully.

### Required protections
- validate `state` and `nonce` on OAuth callback
- verify the callback `state` was created for the same browser session
- restrict Discord auth to a configured guild or allowed roles
- reject duplicate `discord_user_id` values
- ensure users are not able to claim invites for another Discord account
- keep all tokens/redirect URLs in environment variables
- never trust raw Discord username input as a local username without validation

### Recommended role policy

Use a whitelist policy:
- only members of the official Winterjam Discord server can log in
- optionally only members with one of these roles can be granted admin access
- `super_admin` stays controlled through the admin panel and not by raw Discord role assignment unless a separate whitelist is intentionally designed

---

## 10. Data and migration plan

### Database changes

Add new columns to `users`:
- `discord_user_id` `VARCHAR(255)` nullable unique
- `discord_username` `VARCHAR(255)` nullable
- `discord_avatar_url` `TEXT` nullable
- `auth_provider` `VARCHAR(32)` default `'local'`
- `discord_linked_at` `TIMESTAMP` nullable
- `last_discord_login_at` `TIMESTAMP` nullable

Add new columns to `invites`:
- `invite_type` `VARCHAR(32)` default `'email'`
- `discord_user_id` `VARCHAR(255)` nullable
- `discord_username` `VARCHAR(255)` nullable
- `claimed_by_user_id` `INTEGER` nullable
- `claimed_at` `TIMESTAMP` nullable

Migration should be additive and backward-compatible.

---

## 11. Proposed API surface

### Admin endpoints

- `GET /api/admin/discord/config`
  - returns enabled/disabled state and server metadata
- `POST /api/admin/discord/invite`
  - create a Discord invite for a user
- `GET /api/admin/discord/users`
  - list Discord-linked accounts
- `PUT /api/admin/discord/users/:id/link`
  - manually link or relink a Discord account
- `DELETE /api/admin/discord/users/:id/unlink`
  - remove Discord link

### Auth endpoints

- `GET /api/auth/discord/login`
- `GET /api/auth/discord/callback`
- `POST /api/auth/discord/link`
  - optional if a user wants to connect Discord to an existing account
- `POST /api/auth/discord/unlink`

These should fit the same session pattern as the current app auth system.

---

## 12. UI flow mockup

### Admin user page additions

At the top of the admin user section:

- Invite User
- Invite via Email
- Invite via Discord

In the Discord modal:

- Search by Discord username
- Select from server members
- Assign role
- Expiry
- “Create invite”
- “Generate login link”

The resulting response can say:

> Discord invite created successfully. The user can click “Continue with Discord” to create or link their Winterjam account.

---

## 13. Edge cases to handle

- a Discord account is already linked to a different local account
- an invited user already has an email account but not a Discord link
- the Discord user is in the server but not in the right role
- the user has an old invite token that expired
- the app is in dev mode and the Discord secret is missing
- the user’s local account is inactive or disabled
- same Discord user is invited twice

The backend should return clear, user-friendly errors for each case.

---

## 14. Recommended rollout order

### Phase 1: admin-only prep
- add Discord config values to env
- add Discord settings to admin page
- add backend route for Discord auth start/callback
- add admin “invite via Discord” UI
- do not expose login-with-Discord to the public yet

### Phase 2: staff access
- enable Discord login for moderators/admins only
- require server membership and allowed roles
- test creation of linked accounts from invites

### Phase 3: public invited users
- allow invited users to authenticate with Discord
- auto-create local users when they are invited
- keep email/password as a fallback for legacy users

### Phase 4: cleanup and polish
- add disconnect/link flows
- add audit log entries for all Discord account changes
- add user management visibility for Discord-linked users

---

## 15. Acceptance criteria

This feature is done when the admin can:
- invite a Discord user from the Winterjam server
- create a local Winterjam account without using an email or password
- assign a role during the invite process
- see the Discord-linked account in admin user management

This feature is also done when a user can:
- click a Discord invite or login button
- authenticate with Discord
- land in the app with an account created or linked automatically
- access the app without manually entering an email and password

---

## 16. Recommendation

For this codebase, the best long-term approach is:
- keep the local user system as the source of truth
- add Discord as an identity provider on top
- make Discord login and Discord invites an extension of the existing admin user flow

This is the least risky option because it matches the current architecture, requires fewer disruptive changes, and still gives moderators exactly the streamlined experience they want.

---

## 17. Practical note for this repo

The current admin user page already has a clear place to plug this in. The admin-only invite flow in `src/app/admin/users/page.js` and the backend route in `backend/routes/admin.js` are the correct integration points.

The next implementation step would be:
1. add Discord config and admin settings
2. add OAuth callback routes in `backend/routes/auth.js`
3. extend the user table and invite table
4. implement the Discord invite flow in the admin users page
5. add a “Login with Discord” button to the public auth form

This keeps the work aligned with the existing app structure and avoids a rewrite of the current auth system.

---

## 18. Implementation status for today

Completed today:
1. Added the Discord-compatible schema fields for users and invites in `backend/migrations/20260910-add-discord-auth-fields.js`.
2. Extended the admin invite flow in `backend/routes/admin.js` so a Discord invite can be created without an email address and can store Discord identity metadata.
3. Added Discord OAuth entry and callback routes in `backend/routes/auth.js` using the project’s existing session-based session model.
4. Added regression tests for the Discord invite and Discord auth route behavior in the backend tests folder.

Current project direction:
- the app is now ready to accept Discord-based invite metadata and OAuth login flow
- the remaining practical next step is the frontend wiring for the admin invite modal and public “Continue with Discord” button
- the production setup still requires real Discord app credentials in environment variables (`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`)

This acts as the working checkpoint for the current implementation session and keeps the original goal clear: super admins can invite and assign roles for new users, admins, or super admins using a Discord-first single-use invite flow even when public registration is closed.
