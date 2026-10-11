export async function checkHytaleName(username, fetchRequest = fetch) {
  if (typeof username !== "string" || !/^[a-z0-9_]{3,16}$/i.test(username)) {
    return { status: "invalid" };
  }
  const name = encodeURIComponent(username);
  try {
    const response = await fetchRequest(`https://api.hytale.tools/internal/usernames/check?username=${name}`, {
      credentials: "omit",
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error("Hytale check failed");
    const result = await response.json();
    if (["available", "taken", "reserved", "reserved_by_hytale", "prohibited_word"].includes(result?.status)) {
      return { status: result.status };
    }
  } catch {
    // Try PlayerDB when the primary check fails.
  }
  try {
    const response = await fetchRequest(`https://playerdb.co/api/player/hytale/${name}`, {
      credentials: "omit",
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error("PlayerDB check failed");
    const result = await response.json();
    const player = result?.data?.player;
    if (result?.success === true && result.code === "player.found" &&
        typeof player?.username === "string" && player.username.toLowerCase() === username.toLowerCase()) {
      return { status: "taken" };
    }
    // A missing player does not rule out a reserved or prohibited name.
  } catch {
    // Neither API could confirm the name's availability.
  }
  return { status: "unknown" };
}
