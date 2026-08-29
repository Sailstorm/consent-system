export function normaliseHeader(value) {
  return String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function pick(record, names) {
  for (const name of names) {
    const value = record[name];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return null;
}

export function parseDate(value) {
  if (!value) return null;
  const trimmed = String(value).trim();

  let match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  }

  match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  }

  return null;
}

export function toOrganisation(record) {
  const businessName = pick(record, ["BNNAME", "BUSINESSNAME", "NAME"]);
  if (!businessName) return null;

  const rawAbn = pick(record, ["BNABN", "ABN"]);
  const abn = rawAbn ? rawAbn.replace(/\D/g, "").slice(0, 11) || null : null;

  return {
    businessName,
    abn,
    registrationStatus: pick(record, ["BNSTATUS", "STATUS"]),
    registrationDate: parseDate(pick(record, ["BNREGDT", "REGISTRATIONDATE"])),
    cancellationDate: parseDate(pick(record, ["BNCANCELDT", "CANCELLATIONDATE"])),
  };
}
