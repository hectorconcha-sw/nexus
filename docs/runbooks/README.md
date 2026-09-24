# Runbooks

Operational runbooks for Nexus. Each runbook covers one failure mode or
operational procedure.

## Format

Each runbook must include:

- **Symptoms** — what an operator sees on the dashboard or in alerts
- **Impact** — user-visible effects and blast radius
- **Diagnosis** — dashboards, queries, and commands to confirm the issue
- **Mitigation** — steps to restore service, in order of preference
- **Root Cause** — likely underlying causes to investigate after mitigation
- **Prevention** — follow-up actions to prevent recurrence
- **Escalation** — who to page and when

## Index

_No runbooks yet. Each will be added as the corresponding service is built._

Planned:

- `checkout-latency-high.md`
- `payment-webhook-backlog.md`
- `kafka-consumer-lag.md`
- `postgres-connection-exhaustion.md`
- `inventory-drift.md`
