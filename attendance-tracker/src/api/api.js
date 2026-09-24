const FLOW_URLS = {
  login:            "https://defaultf0c7195f1d784e7c90f99261d41389.68.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/aebf63b6c2c2459886c4036e389bb122/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=7tt7srdLh-diswFq0cAQgQs7vQEzqzyuULJWoxuQcxA",
  listEmployees:    "https://defaultf0c7195f1d784e7c90f99261d41389.68.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/45fb4a74fc734a468dd6c56199b51db6/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=VmExCHaxy3IH-pHprjeTCSK818r8c2T1OuU3PBaKZbc",
  submitEntry:      "https://defaultf0c7195f1d784e7c90f99261d41389.68.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/f45dfc7b7855474a9d232652feb7ebce/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=CpCGmQSOtKsUKKTHGsQYs4A-8QQQXF7Z0aTiB-dQdik",
  uploadPhoto:      "https://defaultf0c7195f1d784e7c90f99261d41389.68.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/6e8a378d4d7e4dd898a833c60f1f94d7/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=TWetJaaWiRcMaqV0qPzSqZkCU3R7XuUaBsKowIOp0iw",
  getMyEntries:     "https://defaultf0c7195f1d784e7c90f99261d41389.68.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/6bd31e2b89954b7895eb913864b3db6a/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=b0MW0E2-8en4IgTFVp-r1CZHyBcH6TtAh_Fqbzme-EI",
  adminGetEntries:  "https://defaultf0c7195f1d784e7c90f99261d41389.68.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/64e7a0ea08e9484fa2e6fb74776c17c8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=alXidX9ajmFDYmsLePAu1wrcXY-b8SEaYajWZYpyzWs",
  reviewEntry:      "https://defaultf0c7195f1d784e7c90f99261d41389.68.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/a8a5eaf1a2ee472f8f88a596f34a383f/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=zmL6e6JDUr0YZJHTxgWTH3-IMKmBth3oGr7I5oUvUvQ",
  getPhotos:        "https://defaultf0c7195f1d784e7c90f99261d41389.68.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/8f6fb22c21714b7590339787bd854b96/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=q1KgS8I1d3qDeQzhSuTZcKQpmBe6nqqiHT2ESAbrMyA",
  monthlyReport:    "https://defaultf0c7195f1d784e7c90f99261d41389.68.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/6f04563f001b4bd6a24d015e8842274e/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=vZQtrmSlGGfVhelZA0uRFERuqDiHWFgz9DaTp7J85wo",
  generateOtp:      "https://defaultf0c7195f1d784e7c90f99261d41389.68.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4e699a5de7014763ab50497a17982072/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Z5yYVHHeM28QzFHDoglOuH5Ui5K0RXAQV66-Qj1JBoo",
  submitWorkwearRequest: "https://defaultf0c7195f1d784e7c90f99261d41389.68.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/d16f3170745d4dd4a166291840102618/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mgKR3kUTjEo1CypnxHI44KsRvIyLs277OmaGTucE_LA",
  updatePIN: "https://defaultf0c7195f1d784e7c90f99261d41389.68.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/06/workflows/e48673372a344807ba2b6a7dfaccfb50/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZNJ9hFcJaOJBBZPeiwVXIKgvDyGArG3JqfVWdc_55mE"
};

async function callFlow(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Flow error: ${response.status}`);
  return response.json();
}

export const Api = {
  login: (employeeId, pin) => callFlow(FLOW_URLS.login, { employeeId, pin }),
  listEmployees: () => callFlow(FLOW_URLS.listEmployees, {}),
  submitEntry: (payload) => callFlow(FLOW_URLS.submitEntry, payload),
  uploadPhoto: (payload) => callFlow(FLOW_URLS.uploadPhoto, payload),
  getMyEntries: (employeeId, monthKey) => callFlow(FLOW_URLS.getMyEntries, { employeeId, monthKey: monthKey || "" }),
  adminGetEntries: (status, dateKey) => callFlow(FLOW_URLS.adminGetEntries, { status: status || "", dateKey: dateKey || "" }),
  reviewEntry: (entryId, status, adminNotes, reviewedBy) => callFlow(FLOW_URLS.reviewEntry, { entryId, status, adminNotes, reviewedBy }),
  getPhotos: (entryId) => callFlow(FLOW_URLS.getPhotos, { entryId }),
  monthlyReport: (monthKey, employeeId) => callFlow(FLOW_URLS.monthlyReport, { monthKey, employeeId: employeeId || "" }),
  generateOtp: () => callFlow(FLOW_URLS.generateOtp, {}),
  submitWorkwearRequest: (employeeId, requestItems) =>
    callFlow(FLOW_URLS.submitWorkwearRequest, {
      employeeId,
      requestItems
    }),
  updatePIN: (employeeSpId, accessPIN) =>
    callFlow(FLOW_URLS.updatePIN, {
      employeeSpId: Number(employeeSpId),
      accessPIN: String(accessPIN)
    })
};
