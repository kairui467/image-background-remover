import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
secret: process.env.AUTH_SECRET || "736936d5c65f8426d5c65f8426d5c65f",
providers: [
Google({
clientId: process.env.AUTH_GOOGLE_ID,
clientSecret: process.env.AUTH_GOOGLE_SECRET,
}),
],
session: {
strategy: "jwt",
},
callbacks: {
async session({ session, token }) {
if (token.sub && session.user) {
session.user.id = token.sub;
}
return session;
},
},
})
