const PAYPAL_CLIENT_ID = "AR7hj9ZyE8RiR6-wX_1wweuJUT_R_rdvdAmv-iEyiqy3AzsTMRESSzdOOm-kl4sZOjxOnv-3vWi8v4BO"
const PAYPAL_SECRET = "EGpJ_YaCGdRvBBQ9XWuU8e52ODbF3H1N1SENuZ8kdwTf9FgVBDmrziHU7RfoaeAN8dQo8aawzrrHoB3O"
const PAYPAL_API = "https://api-m.sandbox.paypal.com"

export async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64")
  
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  const data = await res.json() as { access_token: string }
  return data.access_token
}

export async function createPayPalOrder(
  amount: string,
  planType: string,
  description: string
) {
  const token = await getPayPalAccessToken()

  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount,
          },
          description,
        },
      ],
      application_context: {
        return_url: `${process.env.NEXTAUTH_URL}/api/payment/capture`,
        cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
      },
    }),
  })

  const data = await res.json() as { id: string; links: Array<{ rel: string; href: string }> }
  return data
}

export async function capturePayPalOrder(orderId: string) {
  const token = await getPayPalAccessToken()

  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  const data = await res.json() as { id: string; status: string; purchase_units: Array<{ payments: { captures: Array<{ id: string; status: string }> } }> }
  return data
}

export async function verifyPayPalWebhook(body: string, signature: string) {
  const token = await getPayPalAccessToken()

  const res = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transmission_id: signature,
      transmission_time: new Date().toISOString(),
      cert_url: "",
      auth_algo: "SHA256withRSA",
      transmission_sig: signature,
      webhook_id: "",
      webhook_event: JSON.parse(body),
    }),
  })

  const data = await res.json() as { verification_status: string }
  return data.verification_status === "SUCCESS"
}
