"use strict";

function validateProfiles(data) {
  const profiles = [];
  const errors = [];
  const ids = new Set();
  const colors = ["#1769aa", "#19a6a3", "#3a9d5d", "#d1a719", "#f28c28", "#d6452d"];
  if (!Array.isArray(data)) return { profiles, errors: ["profiles.js: PROFILE_DATA must be an array."] };
  data.forEach((entry, index) => {
    const fail = (message) => errors.push(`Profile ${index + 1}: ${message}`);
    if (!entry || ["id", "standard", "level"].some((key) => typeof entry[key] !== "string" || !entry[key].trim())) {
      fail("id, standard and level must be non-empty strings.");
      return;
    }
    const id = entry.id.trim();
    if (ids.has(id)) { fail(`duplicate id: ${id}`); return; }
    const unavailable = entry.available === false;
    if ((!unavailable && (!Array.isArray(entry.points) || entry.points.length < 2)) ||
        !Array.isArray(entry.points) || entry.points.some((point, i) =>
      !Array.isArray(point) || point.length !== 2 || point.some((value) => !Number.isFinite(value) || value <= 0) ||
      (i > 0 && point[0] <= entry.points[i - 1][0]))) {
      fail(`${id}: points need at least two positive [Hz, value] pairs with strictly increasing frequencies.`);
      return;
    }
    if ((entry.mode != null && !["random", "sine"].includes(entry.mode)) ||
        (entry.available != null && typeof entry.available !== "boolean") ||
        ["rms", "duration"].some((key) => entry[key] != null && (!Number.isFinite(entry[key]) || entry[key] <= 0)) ||
        (entry.source != null && typeof entry.source !== "string") ||
        (entry.color != null && (typeof entry.color !== "string" || !/^#[0-9a-f]{6}$/i.test(entry.color)))) {
      fail(`${id}: invalid rms, duration, source or #RRGGBB color.`);
      return;
    }
    ids.add(id);
    profiles.push({ ...entry, id, standard: entry.standard.trim(), level: entry.level.trim(),
      color: entry.color ?? colors[index % colors.length], rms: entry.rms ?? null,
      duration: entry.duration ?? null, source: entry.source ?? "" });
  });
  return { profiles, errors };
}

function limitSelection(ids, profiles, maxStandards, maxProfiles) {
  const byId = new Map(profiles.map((profile) => [profile.id, profile]));
  const selected = new Set();
  const standards = new Set();
  let limited = false;
  for (const id of ids) {
    const profile = byId.get(id);
    if (!profile || profile.available === false || selected.has(id)) continue;
    if (selected.size >= maxProfiles || (!standards.has(profile.standard) && standards.size >= maxStandards)) {
      limited = true;
      continue;
    }
    selected.add(id);
    standards.add(profile.standard);
  }
  return { selected, limited };
}
