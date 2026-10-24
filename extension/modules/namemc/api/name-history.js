export function readCraftyHistory(result, uuid) {
  const profile = result?.data;
  if (result?.success !== true || typeof profile?.uuid !== "string" ||
      profile.uuid.replace(/-/g, "").toLowerCase() !== uuid.replace(/-/g, "").toLowerCase() || !Array.isArray(profile.usernames)) {
    throw new Error("Invalid Crafty profile response");
  }
  return profile.usernames
    .filter(entry => entry && !entry.hidden && !entry.deleted && !entry.deleted_at && /^[a-z0-9_]{1,16}$/i.test(entry.username))
    .map(entry => ({ name: entry.username, changedAt: typeof entry.changed_at === "string" ? entry.changed_at : null }))
    .sort((a, b) => (Date.parse(b.changedAt) || 0) - (Date.parse(a.changedAt) || 0));
}

export async function loadCraftyHistory(username, uuid, fetchRequest = fetch) {
  if (typeof username !== "string" || !/^[a-z0-9_]{1,16}$/i.test(username) ||
      typeof uuid !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
    throw new Error("Invalid Minecraft profile");
  }
  const response = await fetchRequest(`https://api.crafty.gg/api/v2/players/${encodeURIComponent(username)}`, {
    credentials: "omit",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error("Crafty history request failed");
  return { entries: readCraftyHistory(await response.json(), uuid) };
}

export function readAmplitudesHistory(profile, uuid) {
  if (typeof profile?.uuid !== "string" ||
      profile.uuid.replace(/-/g, "").toLowerCase() !== uuid.replace(/-/g, "").toLowerCase() ||
      !Array.isArray(profile.username_history)) {
    throw new Error("Invalid Amplitudes profile response");
  }
  if (profile.hidden) return [];
  return profile.username_history
    .filter(entry => entry && !entry.hidden && /^[a-z0-9_]{1,16}$/i.test(entry.username))
    .map(entry => ({ name: entry.username, changedAt: typeof entry.changed_at === "string" ? entry.changed_at : null }))
    .reverse();
}

export async function loadAmplitudesHistory(username, uuid, fetchRequest = fetch) {
  if (typeof username !== "string" || !/^[a-z0-9_]{1,16}$/i.test(username) ||
      typeof uuid !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
    throw new Error("Invalid Minecraft profile");
  }
  const response = await fetchRequest(`https://names.amplitudes.me/api/history/${encodeURIComponent(username)}`, {
    credentials: "omit",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error("Amplitudes history request failed");
  return { entries: readAmplitudesHistory(await response.json(), uuid) };
}
