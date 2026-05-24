import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email / User ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email/User ID and password are required.");
        }

        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, "")}/api/auth/authenticate`
            : "http://127.0.0.1:8000/api/auth/authenticate";

          const res = await fetch(backendUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData?.detail || "Authentication failed.");
          }

          const user = await res.json();
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error: any) {
          throw new Error(error.message || "Invalid credentials or authentication error.");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user?.email && process.env.WELCOME_APPS_SCRIPT_URL) {
        try {
          const payload = {
            action: "welcome",
            email: user.email,
            name: user.name || user.email.split("@")[0],
            supportEmail: "rj910@snu.edu.in",
            supportUrl: "https://snugpt.rishabhj.in/contact",
          };

          // Trigger the Apps Script Web App in a fire-and-forget server-side fetch
          fetch(process.env.WELCOME_APPS_SCRIPT_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }).catch((err) => {
            console.error("Failed to dispatch welcome email webhook:", err);
          });
        } catch (error) {
          console.error("Welcome email trigger error:", error);
        }
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
