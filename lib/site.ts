// Central site settings. Override any of these with environment variables (see .env.example).

const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "YOUR_CLIENT_ID";

// Send Messages (2048) + Embed Links (16384) + Manage Webhooks (536870912) + Use Application Commands (2147483648)
const BOT_PERMISSIONS = "2684372992";

export const site = {
  name: "DiscoNotify",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://disconotify.com",
  description:
    "DiscoNotify posts Discord alerts the moment your creators upload, post or go live on YouTube, Twitch, Kick, Instagram, X and TikTok, with checks as often as every 30 seconds.",
  // A full invite link in NEXT_PUBLIC_DISCORD_INVITE_URL wins; otherwise it is built from the client ID.
  inviteUrl:
    process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ||
    `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot%20applications.commands&permissions=${BOT_PERMISSIONS}`,
  // Your payment provider needs your exact legal name (company, or your full name as a sole proprietor) in the legal pages.
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME || "Muhammad Nadeem",
  legalAddress: process.env.NEXT_PUBLIC_LEGAL_ADDRESS || "Lahore, Pakistan",
  discordClientId: clientId,
  // Optional: your Polar customer portal link, shown on the Manage page.
  polarPortalUrl: process.env.NEXT_PUBLIC_POLAR_PORTAL_URL || "",
  // Supabase Edge Function that starts card and crypto checkouts (supabase/functions/billing).
  billingApi: process.env.NEXT_PUBLIC_BILLING_API_URL || "",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@yourdomain.com",
  supportServer: process.env.NEXT_PUBLIC_SUPPORT_SERVER || "https://discord.gg/nwSDAtjNZD",
  price: {
    amount: 1.99,
    currency: "$",
    period: "month",
    trialDays: 7,
  },
  legalUpdated: "October 13, 2026",
} as const;
