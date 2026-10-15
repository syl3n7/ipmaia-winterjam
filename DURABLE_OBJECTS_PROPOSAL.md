# Cloudflare Durable Objects Proposal

**Project:** IPMAIA WinterJam

**Plan assumption:** Cloudflare Workers Free

**Status:** Proposal, not an implementation

**Pricing checked:** 15 October 2026

## Recommendation

Use Durable Objects only if WinterJam needs a small real-time feature, such as a live event room that broadcasts admin announcements and an approximate participant-presence count. Keep PostgreSQL and the Express backend as the source of truth for users, game jams, submissions, schedules, forms, and other business records.

This project already deploys its Next.js frontend to Cloudflare Workers through OpenNext, while its API and PostgreSQL are deployed separately. A Durable Object would fit as a coordination layer for one event room, not as a replacement for either existing system. If there is no concrete real-time workflow planned, defer this work: the current site does not need Durable Objects just because it is hosted on Workers.

## Suitable First Feature

A live room keyed by a validated game-jam ID could provide:

- Broadcast delivery of event announcements that were first saved through the existing API.
- An approximate count of connected participants, without storing a permanent attendance record.
- A short-lived connection for each attendee, with clients reconnecting and fetching canonical event data from the existing API.

Avoid starting with public chat, votes, submissions, registration, or authoritative attendance. Those features introduce moderation, identity, retention, abuse, and write-volume requirements. They are better designed separately and should not rely on ephemeral room state.

## Proposed Architecture

```text
Browser
  | HTTPS / WebSocket, with a short-lived room ticket
  v
Next.js OpenNext Worker (existing Cloudflare deployment)
  | Durable Object binding, one object per validated jam room
  v
LiveRoom Durable Object + SQLite storage

Admin/browser -> existing Express API -> PostgreSQL
                         |
                         +-> canonical event data and authorization
```

- The existing Worker routes a room connection to a named `LiveRoom` object. Use a deterministic name derived from a validated jam ID so requests for that room reach the same object.
- The Durable Object owns live connection coordination and transient presence. Use the WebSocket Hibernation API so idle connections can hibernate; do not use timers, ordinary WebSocket APIs, or pending work that prevent hibernation.
- Persist only the small amount of state required to recover a room after a restart. Durable Objects can restart during deploys or inactivity; in-memory state alone is not durable.
- Save announcements and other canonical event changes in PostgreSQL first. Then publish an update to the live room. On reconnect, clients reload canonical state from the existing API, so a missed broadcast is recoverable.
- Issue short-lived, room-scoped tickets from the existing backend after checking access. Validate those tickets before accepting a WebSocket or privileged room action. Do not trust a room ID, role, or user ID supplied only by the client, and do not put backend credentials in browser code.
- If Worker plan limits are reached or the real-time path is unavailable, show the normal API-backed event page, disable live indicators, and retry with backoff. Do not make registration, submissions, or admin actions depend on a successful Durable Object call.

Presence is approximate: disconnects may not be observed immediately, and clients can reconnect to a different object instance after a restart. It must not be presented as a verified attendance count.

## Fit With This Repository

The root `wrangler.toml` deploys `.open-next/worker.js`; `.github/workflows/cloudflare.yml` builds and deploys that Worker, while the Express API and PostgreSQL run separately. OpenNext exposes Worker bindings to Next.js routes through `getCloudflareContext()`.

A small implementation spike should first prove that the deployed OpenNext Worker can expose the Durable Object class required by Wrangler and invoke its binding from a route handler. Add the SQLite-backed class and its `new_sqlite_classes` migration in the supported OpenNext/Cloudflare configuration, and use OpenNext's documented custom Worker mechanism if the generated entry point needs a wrapper. Do not patch generated `.open-next` files. Keep the existing Cloudflare workflow responsible for deploying the binding and migration, and verify its path filters include all added source and configuration files.

Local development should use Wrangler/OpenNext preview with a local Durable Object binding. Add tests for ticket validation, jam-to-object routing, message validation, and graceful fallback before enabling the feature for a real event.

## Workers Free Limits

The current Durable Objects pricing documentation lists these Workers Free allowances. Daily limits reset at **00:00 UTC**. Exceeding a free limit causes further operations of that type to fail; these are hard ceilings, not a promise that usage will be billed instead.

| Meter | Workers Free allowance | Design consequence |
|---|---:|---|
| Compute requests | 100,000 per day | Includes HTTP requests, RPC sessions, WebSocket connection requests, and alarm invocations. Each RPC method call can count as a separate request. |
| Compute duration | 13,000 GB-s per day | Active time and idle time when the object cannot hibernate count. Objects eligible for hibernation are not charged duration while hibernated. |
| SQLite rows read | 5 million per day | Avoid repeatedly scanning room history or reading all presence rows for each connection. |
| SQLite rows written | 100,000 per day | Do not write heartbeats, typing indicators, or every live message to storage. Index changes, deletes, and alarm scheduling also contribute writes. |
| SQLite stored data | 5 GB total | Expire temporary room data and remove storage when a room is permanently retired. |
| Storage backend | SQLite only | New Free-plan Durable Objects must use SQLite-backed classes; do not configure a legacy key-value-backed namespace. |

For compute requests, Cloudflare applies a **20:1 billing ratio** to incoming WebSocket messages: 100 incoming messages count as 5 requests for billing purposes. Establishing a WebSocket still needs a request. Outgoing WebSocket messages and protocol ping messages are not charged as requests, but handler execution still contributes to duration. Check the pricing page for the current detailed definitions and any rule changes.

### Illustrative Workload

For one room with 50 connected participants, each sending one small event every minute for one hour, there are 3,000 incoming messages. At the documented 20:1 ratio, that is about 150 request units for those messages, plus connection requests and any other calls. If each message handler executes for 10 ms, the aggregate active execution is about 30 seconds, or roughly 3.75 GB-s at the 128 MB allocation. This is only an illustration: connection churn, handler time, SQL reads/writes, other Workers usage, and actual event traffic change the result.

The example is intentionally not a target budget. Measure a pilot in Cloudflare's usage analytics and reserve substantial headroom before using the feature during the event. A chat-like workload that stores every message or keeps objects continuously active can behave very differently.

## Free-Plan Guardrails

1. **Keep rooms and messages bounded.** Validate event IDs, cap message size and per-client send rate, and reject unsupported message types before storage or broadcast.
2. **Keep hot-path storage small.** Prefer in-memory connection metadata for live presence. Persist only state needed across restarts; use indexed, bounded queries and avoid history scans.
3. **Use WebSocket Hibernation.** Use the Hibernation API and restore required metadata from storage after wake-up. Avoid `setInterval`, long-running promises, and other conditions that keep an idle object active.
4. **Set a retention policy.** Expire temporary state after the event. Deleting individual keys or dropping a table may leave storage metadata; use `deleteAll()` (and remove any alarm) when permanently clearing a room's entire storage.
5. **Avoid retry storms.** On a limit or service error, stop frequent reconnects, back off, and leave the ordinary API workflow usable. Polling the Durable Object aggressively is not a free fallback because it creates more requests and reads.
6. **Observe usage before launch.** Review DO request, duration, row-read, row-write, and storage metrics during load tests and the event. Add application-level caps and an operational switch to turn off live updates. A switch helps conserve quota, but Cloudflare's plan limits remain account-level hard limits and may be reached by other workloads too.
7. **Recheck pricing before each event.** Quotas and metering behavior can change. The current documentation says daily quotas reset at 00:00 UTC; plan event-day capacity with that reset and the possibility of an exhausted quota in mind.

## Rollout

1. Confirm the live-room use case and expected peak participants, connection duration, and event rate. If the feature does not justify real-time behavior, stop here.
2. Build a minimal compatibility spike: one SQLite-backed room, one authenticated WebSocket, one broadcast, local Wrangler preview, and a successful CI deployment through the existing OpenNext workflow.
3. Load-test representative connection churn and message rates. Record request, duration, row-read, row-write, and stored-data usage; keep the feature disabled if projected event-day traffic approaches available headroom.
4. Pilot with one non-critical event announcement and presence count. Keep PostgreSQL-backed pages and admin workflows fully functional with the live feature switched off.
5. Review usage and operational behavior after the pilot before broadening the feature. Revisit the choice of plan before adding chat, durable event history, or higher-frequency updates.

## References

- [Durable Objects pricing and free-tier limits](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Durable Object storage and SQLite-backed classes](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/)
- [Durable Object lifecycle and hibernation](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/)
- [OpenNext Cloudflare bindings](https://opennext.js.org/cloudflare/bindings)
- [OpenNext Cloudflare custom Worker guide](https://opennext.js.org/cloudflare/howtos/custom-worker)
