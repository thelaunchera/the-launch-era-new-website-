/**
 * Pure, side-effect-free readiness evaluator for the INTERNAL TLE owner AI Projects specialist.
 * No database access, email delivery, AI calls, network calls, tenant fallback or mutations.
 * The authenticated server MUST fetch only rows scoped to its verified internal workspace.
 * Buyer AI agents MUST NOT import or call this owner-only module.
 */
const FIELDS = Object.freeze([
  ["services", "Services", "Servicios"],
  ["service_areas", "Service areas", "Zonas de servicio"],
  ["pricing_style|quote_estimate_rules|quote_pricing_factors|quote_estimate_examples", "Estimate and pricing rules", "Reglas de estimados y precios"],
  ["availability|business_hours_display|minimum_booking_notice", "Booking availability", "Disponibilidad de reservas"],
]);
const STR = (value) => typeof value === "string" ? value.trim() : "";
const isProvided = (value) => Array.isArray(value)
  ? value.some(item => typeof item === "string" ? item.trim() : item != null)
  : typeof value === "string" ? !!value.trim()
  : typeof value === "number" ? Number.isFinite(value)
  : typeof value === "boolean" ? true
  : value && typeof value === "object" ? Object.values(value).some(isProvided) : false;

export function evaluateOwnerBookingReadiness(rows, {workspaceId, language = "en", maxRows = 40} = {}) {
  if (!STR(workspaceId)) throw new Error("Verified owner workspace required");
  if (!Array.isArray(rows)) throw new TypeError("Workspace-scoped rows required");
  const es = language === "es";
  const projects = [];
  const seen = new Set();
  let excluded = 0;
  for (const row of rows.slice(0, Math.max(0, Math.min(40, maxRows)))) {
    if (!row || row.crm_workspace_id !== workspaceId || row.payment_status !== "paid"
        || row.product_code !== "booking_flow_setup" || !STR(row.id) || seen.has(row.id)) { excluded++; continue; }
    seen.add(row.id);
    const payload = row.intake_payload && typeof row.intake_payload === "object" && !Array.isArray(row.intake_payload)
      ? row.intake_payload : {};
    const missing = [];
    const delivered = Boolean(row.delivery_sent_at);
    if (!delivered) {
      if (!row.intake_completed_at) missing.push(es ? "Intake sin enviar" : "Intake not submitted");
      else for (const [key, en, spanish] of FIELDS) {
        if (!key.split("|").some(alias => isProvided(payload[alias]))) missing.push(es ? spanish : en);
      }
    }
    const status = delivered ? "delivered" : missing.length ? "needs_info"
      : row.build_started_at ? "production" : "owner_review";
    projects.push({
      id: row.id, name: STR(row.business_name).slice(0, 75) || (es ? "Proyecto Booking" : "Booking project"),
      service: "Booking Automation", status, missing,
      next_action: status === "needs_info" ? "draft_missing_information_request"
        : status === "owner_review" ? "request_owner_production_approval"
        : status === "production" ? "review_build_and_qa" : "none",
    });
  }
  const counts = Object.fromEntries(["needs_info","owner_review","production","delivered"].map(s =>
    [s, projects.filter(p => p.status === s).length]));
  return {
    read_only: true, source: "workspace_scoped_paid_booking_accounts",
    checked_workspace: true, coverage: ["legacy_and_unlinked_orders_excluded"],
    truncated: rows.length > Math.min(40, Math.max(0, maxRows)),
    excluded, counts, projects, external_actions: 0,
  };
}

/** Produces a reviewable message only. Never guesses recipient or sends. */
export function draftMissingInformationRequest(project, {language = "en"} = {}) {
  if (!project || project.status !== "needs_info" || !Array.isArray(project.missing) || !project.missing.length)
    throw new Error("Project has no verified missing fields");
  const es = language === "es";
  const fields = project.missing.join(", ");
  return {
    status: "draft", requires_owner_approval: true, recipient: null, sent: false,
    subject: es ? "Unos detalles para continuar con tu proyecto" : "A few details to keep your project moving",
    body: es
      ? `¡Hola! Estamos revisando la información de tu proyecto y nos faltan estos detalles: ${fields}. ¿Puedes enviárnoslos cuando tengas un momento? Así podremos continuar con la revisión. ¡Gracias! — The Launch Era`
      : `Hi! We're reviewing your project details and still need a little information: ${fields}. Could you send those over when you have a moment? That will help us continue the review. Thank you! — The Launch Era`,
  };
}
