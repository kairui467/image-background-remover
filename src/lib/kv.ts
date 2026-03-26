const CF_ACCOUNT_ID = "4623de0514daccbbc581b6f4253b73e0"
const CF_API_TOKEN = "cfat_M3TEAx26V5xyx5c65VpUl7u4RniwGzHrzO0YsOjP584165f7"
const KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID || ""

const KV_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}`

const KV_HEADERS = {
  Authorization: `Bearer ${CF_API_TOKEN}`,
  "Content-Type": "application/json",
}

export interface UserCredits {
  credits: number
  totalCreditsUsed: number
  planType: string
  planExpiresAt: string | null
}

const DEFAULT_CREDITS: UserCredits = {
  credits: 3,
  totalCreditsUsed: 0,
  planType: "FREE",
  planExpiresAt: null,
}

export async function getUserCredits(userId: string): Promise<UserCredits> {
  if (!KV_NAMESPACE_ID) return DEFAULT_CREDITS
  try {
    const res = await fetch(`${KV_BASE}/values/user:${userId}`, {
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    })
    if (!res.ok) return DEFAULT_CREDITS
    const text = await res.text()
    return JSON.parse(text) as UserCredits
  } catch {
    return DEFAULT_CREDITS
  }
}

export async function setUserCredits(userId: string, data: UserCredits): Promise<void> {
  if (!KV_NAMESPACE_ID) return
  await fetch(`${KV_BASE}/values/user:${userId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "text/plain" },
    body: JSON.stringify(data),
  })
}

export async function incrementUserCredits(userId: string, amount: number): Promise<UserCredits> {
  const current = await getUserCredits(userId)
  const updated: UserCredits = {
    ...current,
    credits: current.credits + amount,
  }
  await setUserCredits(userId, updated)
  return updated
}
