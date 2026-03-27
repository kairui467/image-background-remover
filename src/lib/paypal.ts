const PAYPAL_CLIENT_ID = "AT1JcO8LsbeX6OzMwZCFrXsTj-L_A3aHGLHsoCwf1z2Z550mzW7C_W4OxqoIz1SmP55ldtsM4eCNh7iI"
const PAYPAL_SECRET = "EA_JxYGpxn5OLl-pebCnk1CNVS70s3TG_JaHxq33rBGwi5huuL8YHoPfVHJo8c07RLueNmjyEi_MmwP2"
const PAYPAL_API = "https://api-m.paypal.com"

function btoa_safe(str: string) {
  return btoa(str)
}

export async function getPayPalAccessToken() {
  const auth = btoa_safe(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`)

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
  description: string,
  origin: string,
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
        return_url: `${origin}/api/payment/capture`,
        cancel_url: `${origin}/pricing`,
        brand_name: "Image Background Remover",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
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

  const data = await res.json() as {
    id: string
    status: string
    purchase_units: Array<{
      payments: { captures: Array<{ id: string; status: string }> }
    }>
  }
  return data
}
