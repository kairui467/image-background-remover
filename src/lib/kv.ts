const CF_ACCOUNT_ID = "4623de0514daccbbc581b6f4253b73e0"
const CF_API_TOKEN = "cfat_M3TEAx26V5xyx5c65VpUl7u4RniwGzHrzO0YsOjP584165f7"
const KV_NAMESPACE_ID = "e4d5268eb7ab43f49db94a1c7fac3768"

const KV_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}`

export interface UserCredits {
  credits: number
  totalCreditsUsed: number
  planType: string
  planExpiresAt: string | null
}

const DEFAULT_CREDITS: UserCredits = {
  credits: 1,
  totalCreditsUsed: 0,
  planType: "FREE",
  planExpiresAt: null,
}

export async function getUserCredits(userId: string): Promise<UserCredits> {
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
  try {
    console.log(`[KV] Setting credits for ${userId}:`, JSON.stringify(data))
    const res = await fetch(`${KV_BASE}/values/user:${userId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "text/plain" },
      body: JSON.stringify(data),
    })
    
    console.log(`[KV] Response status: ${res.status}`)
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error(`[KV] Failed to set credits for ${userId}:`, res.status, errorText)
      
      // 解析 Cloudflare 错误响应
      let errorDetails = errorText
      try {
        const errorJson = JSON.parse(errorText)
        errorDetails = errorJson.errors?.[0]?.message || errorJson.error || errorText
      } catch {}
      
      throw new Error(`KV write failed: ${res.status} - ${errorDetails}`)
    }
    console.log(`[KV] Successfully set credits for ${userId}`)
  } catch (error) {
    console.error(`[KV] Error setting credits for ${userId}:`, error)
    throw error
  }
}

export async function incrementUserCredits(userId: string, amount: number): Promise<UserCredits> {
  console.log(`[KV] Getting current credits for ${userId}`)
  const current = await getUserCredits(userId)
  console.log(`[KV] Current credits: ${current.credits}, amount to add: ${amount}`)
  
  const updated: UserCredits = {
    ...current,
    credits: current.credits + amount,
  }
  console.log(`[KV] Updated credits will be: ${updated.credits}`)
  
  await setUserCredits(userId, updated)
  return updated
}
