# AI Developer · Private Booking Studio build packet

**Status:** internal source-only build preparation. This is **not** a functional booking website, live demo, client deployment, or a customer-facing URL.

After paid-order verification, completed intake, owner start approval, Creative design, and licensed images, a developer may generate an isolated local packet:

```bash
node scripts/build-booking-studio-private-packet.mjs \
  /secure/input/verified-job.json \
  /secure/output/private-builds \
  <verified-customer-workspace-id>
```

The script rejects mismatched tenant IDs and invalid jobs, uses a hash for the private output directory, creates owner-only files (0700 directory, 0600 files), refuses to overwrite existing packets, and writes:
- `private-preview.html`: static design review, booking explicitly disabled
- `developer-plan.json`: verified design/tenant inputs plus seven integration blockers
- `manifest.json`: preview checksum and explicit non-published, non-notified flags

**Privacy:** The output contains client business information. Keep it in a restricted local directory, never upload it to public Pages artifacts or GitHub issues. The CI fixture uses fictional customer data only.

**Still required before a real client build:** isolated client source/branch, tenant-scoped auth and API, booking/quote persistence, pricing/ZIP/add-ons logic, consent and notification tests, actual phone/tablet/desktop QA, verified image licenses, owner review, and separate explicit publishing approval. A static visual preview or checklist does not establish functional readiness.

No public demo, existing client page, DNS, payment system, owner agent, or customer agent is modified by this builder.
