export const CAUSE_LABELS = new Set([
  "Currently unknown",
  "Human error",
  "Malicious or criminal attack",
  "Other",
  "System fault",
]);

export function text(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

export function number(value, context) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid numeric value for ${context}: ${value}`);
  }
  return Math.round(parsed);
}

export function sheetByName(workbook, name) {
  const sheet = workbook.find((candidate) => candidate.sheet === name);
  if (!sheet) throw new Error(`Required OAIC worksheet is missing: ${name}`);
  return sheet.data;
}

export function parsePeriod(rows) {
  const title = text(rows[0]?.[0]);
  const match = title.match(/(January|July)\s*-\s*(June|December)\s+(\d{4})/i);
  if (!match) throw new Error(`Could not determine reporting period from: ${title}`);

  const year = Number(match[3]);
  const firstHalf = match[1].toLowerCase() === "january";
  return {
    periodStart: `${year}-${firstHalf ? "01-01" : "07-01"}`,
    periodEnd: `${year}-${firstHalf ? "06-30" : "12-31"}`,
    label: `${match[1]}-${match[2]} ${year}`,
  };
}

export function parseMonthly(rows) {
  const causes = new Map([...CAUSE_LABELS].map((label) => [label, 0]));
  let totalNotifications = null;

  for (const row of rows) {
    const label = text(row[0]);
    if (CAUSE_LABELS.has(label)) {
      causes.set(label, causes.get(label) + number(row[1], label));
    } else if (label === "Grand Total") {
      totalNotifications = number(row[1], "Grand Total");
    }
  }

  if (totalNotifications === null) {
    throw new Error("Grand Total was not found in the NDB by month worksheet");
  }

  return {
    totalNotifications,
    causes: [...causes.entries()].map(([cause, notifications]) => ({
      cause,
      notifications,
      percentage: Number(((notifications / totalNotifications) * 100).toFixed(2)),
    })),
  };
}

export function parseSectors(rows, totalNotifications) {
  const sectors = [];
  let started = false;

  for (const row of rows) {
    const label = text(row[0]);
    if (label === "Top sectors by source of breaches") {
      started = true;
      continue;
    }
    if (!started || !label || CAUSE_LABELS.has(label)) continue;

    const notifications = number(row[1], label);
    sectors.push({
      sector: label,
      notifications,
      percentage: Number(((notifications / totalNotifications) * 100).toFixed(2)),
    });
  }

  if (sectors.length === 0) throw new Error("No sector statistics were recognised");
  return sectors;
}

export function parseInformationTypes(rows) {
  const headerIndex = rows.findIndex(
    (row) => text(row[0]) === "Kind of personal information",
  );
  if (headerIndex < 0) throw new Error("Personal information header was not found");

  return rows
    .slice(headerIndex + 1)
    .filter((row) => text(row[0]) && row[1] !== null && row[1] !== undefined)
    .map((row) => ({
      informationType: text(row[0]),
      notifications: number(row[1], text(row[0])),
    }));
}

export function parsePeopleAffected(rows) {
  const headerIndex = rows.findIndex((row) => text(row[0]) === "Range");
  if (headerIndex < 0) throw new Error("Individuals affected header was not found");

  const result = [];
  for (let index = headerIndex + 1; index < rows.length; index += 1) {
    const label = text(rows[index][0]);
    if (!label || label === "Grand Total") break;
    result.push({
      affectedRange: label,
      notifications: number(rows[index][1], label),
      sortOrder: result.length + 1,
    });
  }

  if (result.length === 0) throw new Error("No affected-person ranges were recognised");
  return result;
}
