const CF_ACCOUNT_ID = "4623de0514daccbbc581b6f4253b73e0"
const CF_API_TOKEN = "cfut_oMl3xRNdvbl94XQ1WPPZ6H18N2VgdXYfVEA1UnhD59c44367"
const KV_NAMESPACE_ID = "e4d5268eb7ab43f49db94a1c7fac3768"

const KV_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}`

export interface UserCredits {
  credits: number
  totalCreditsUsed: number
  planType: string
  planExpiresAt: string | null
}

export interface ImageRecord {
  id: string
  fileName: string
  status: string
  cost: number
  date: string
}

export interface Bill {
  id: string
  date: string
  item: string
  amount: string
  status: string
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
    totalCreditsUsed: amount < 0 ? current.totalCreditsUsed - amount : current.totalCreditsUsed,
  }
  console.log(`[KV] Updated credits will be: ${updated.credits}, totalCreditsUsed: ${updated.totalCreditsUsed}`)
  
  await setUserCredits(userId, updated)
  return updated
}

export async function addImageRecord(userId: string, record: ImageRecord): Promise<void> {
  try {
    const key = `records:${userId}:${record.id}`
    console.log(`[KV] Adding record for ${userId}:`, key)
    const res = await fetch(`${KV_BASE}/values/${key}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "text/plain" },
      body: JSON.stringify(record),
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error(`[KV] Failed to add record:`, res.status, errorText)
      throw new Error(`KV write failed: ${res.status}`)
    }
    console.log(`[KV] Successfully added record for ${userId}`)
  } catch (error) {
    console.error(`[KV] Error adding record for ${userId}:`, error)
    throw error
  }
}

export async function getUserRecords(userId: string, limit: number = 10): Promise<ImageRecord[]> {
  try {
    console.log(`[KV] Getting records for ${userId}`)
    // 由于 KV 没有列表 API，我们存储一个索引
    const indexKey = `records:${userId}:index`
    const res = await fetch(`${KV_BASE}/values/${indexKey}`, {
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    })
    
    if (!res.ok) {
      console.log(`[KV] No records index found for ${userId}`)
      return []
    }
    
    const indexText = await res.text()
    const recordIds: string[] = JSON.parse(indexText)
    
    // 获取最近的 limit 条记录
    const recentIds = recordIds.slice(-limit).reverse()
    const records: ImageRecord[] = []
    
    for (const id of recentIds) {
      const recordRes = await fetch(`${KV_BASE}/values/records:${userId}:${id}`, {
        headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
      })
      if (recordRes.ok) {
        const recordText = await recordRes.text()
        records.push(JSON.parse(recordText))
      }
    }
    
    return records
  } catch (error) {
    console.error(`[KV] Error getting records for ${userId}:`, error)
    return []
  }
}

export async function addRecordToIndex(userId: string, recordId: string): Promise<void> {
  try {
    const indexKey = `records:${userId}:index`
    const res = await fetch(`${KV_BASE}/values/${indexKey}`, {
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    })
    
    let recordIds: string[] = []
    if (res.ok) {
      const indexText = await res.text()
      recordIds = JSON.parse(indexText)
    }
    
    recordIds.push(recordId)
    
    const updateRes = await fetch(`${KV_BASE}/values/${indexKey}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "text/plain" },
      body: JSON.stringify(recordIds),
    })
    
    if (!updateRes.ok) {
      console.error(`[KV] Failed to update records index`)
      throw new Error(`KV write failed: ${updateRes.status}`)
    }
  } catch (error) {
    console.error(`[KV] Error updating records index:`, error)
    throw error
  }
}

export async function addBill(userId: string, bill: Bill): Promise<void> {
  try {
    const key = `bills:${userId}:${bill.id}`
    console.log(`[KV] Adding bill for ${userId}:`, key)
    const res = await fetch(`${KV_BASE}/values/${key}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "text/plain" },
      body: JSON.stringify(bill),
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error(`[KV] Failed to add bill:`, res.status, errorText)
      throw new Error(`KV write failed: ${res.status}`)
    }
    console.log(`[KV] Successfully added bill for ${userId}`)
  } catch (error) {
    console.error(`[KV] Error adding bill for ${userId}:`, error)
    throw error
  }
}

export async function addBillToIndex(userId: string, billId: string): Promise<void> {
  try {
    const indexKey = `bills:${userId}:index`
    const res = await fetch(`${KV_BASE}/values/${indexKey}`, {
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    })
    
    let billIds: string[] = []
    if (res.ok) {
      const indexText = await res.text()
      billIds = JSON.parse(indexText)
    }
    
    billIds.push(billId)
    
    const updateRes = await fetch(`${KV_BASE}/values/${indexKey}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "text/plain" },
      body: JSON.stringify(billIds),
    })
    
    if (!updateRes.ok) {
      console.error(`[KV] Failed to update bills index`)
      throw new Error(`KV write failed: ${updateRes.status}`)
    }
  } catch (error) {
    console.error(`[KV] Error updating bills index:`, error)
    throw error
  }
}

export async function getUserBills(userId: string, limit: number = 10): Promise<Bill[]> {
  try {
    console.log(`[KV] Getting bills for ${userId}`)
    const indexKey = `bills:${userId}:index`
    const res = await fetch(`${KV_BASE}/values/${indexKey}`, {
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    })
    
    if (!res.ok) {
      console.log(`[KV] No bills index found for ${userId}`)
      return []
    }
    
    const indexText = await res.text()
    const billIds: string[] = JSON.parse(indexText)
    
    const recentIds = billIds.slice(-limit).reverse()
    const bills: Bill[] = []
    
    for (const id of recentIds) {
      const billRes = await fetch(`${KV_BASE}/values/bills:${userId}:${id}`, {
        headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
      })
      if (billRes.ok) {
        const billText = await billRes.text()
        bills.push(JSON.parse(billText))
      }
    }
    
    return bills
  } catch (error) {
    console.error(`[KV] Error getting bills for ${userId}:`, error)
    return []
  }
}
