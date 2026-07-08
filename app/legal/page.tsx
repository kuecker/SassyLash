import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy & SMS Terms — Sassy Lash & Skin',
  description: 'Privacy Policy and SMS messaging terms and conditions for Sassy Lash & Skin.',
}

// Placeholders — replace with real business contact details.
const BUSINESS_EMAIL = '[BUSINESS EMAIL]'
const BUSINESS_PHONE = '[BUSINESS PHONE]'
const BUSINESS_ADDRESS = '[BUSINESS ADDRESS]'
const LAST_UPDATED = 'July 7, 2026'

export default function LegalPage() {
  return (
    <main className="min-h-screen">
      <header className="bg-warm-white border-b border-chalk px-4 py-7 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-deep-walnut">Sassy Lash &amp; Skin</h1>
        <p className="font-body text-sm text-driftwood mt-2">Privacy Policy &amp; SMS Terms</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10 font-body text-deep-walnut">
        <p className="text-sm text-driftwood">Last updated: {LAST_UPDATED}</p>

        <nav className="mt-6 flex flex-wrap gap-4 text-sm">
          <a href="#privacy" className="text-warm-garnet hover:text-warm-garnet-deep underline underline-offset-2">Privacy Policy</a>
          <a href="#terms" className="text-warm-garnet hover:text-warm-garnet-deep underline underline-offset-2">SMS Terms &amp; Conditions</a>
        </nav>

        {/* ─── Privacy Policy ─────────────────────────────────────── */}
        <section id="privacy" className="mt-10 scroll-mt-6">
          <h2 className="font-display text-2xl font-bold text-deep-walnut">Privacy Policy</h2>

          <p className="mt-4 leading-relaxed">
            This Privacy Policy explains how Sassy Lash &amp; Skin (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
            collects, uses, and protects the information you provide when you book an appointment and opt in to receive
            text messages from us.
          </p>

          <h3 className="font-display text-lg font-semibold text-deep-walnut mt-6">Information We Collect</h3>
          <p className="mt-2 leading-relaxed">
            When you request an appointment, we collect your name, mobile phone number, and email address. We use this
            information solely to schedule appointments and to send you transactional messages about your bookings.
          </p>

          <h3 className="font-display text-lg font-semibold text-deep-walnut mt-6">SMS Messaging &amp; Your Mobile Number</h3>
          <p className="mt-2 leading-relaxed">
            <strong>
              No mobile information will be shared with third parties or affiliates for marketing or promotional
              purposes. We do not sell, rent, or share your mobile phone number or SMS opt-in data with anyone.
            </strong>{' '}
            Information you share with us is used only to provide the booking and appointment services you requested.
          </p>
          <ul className="mt-3 space-y-2 leading-relaxed list-disc pl-5">
            <li>
              <strong>Message frequency:</strong> Message frequency varies based on your booking activity (for example,
              appointment confirmations and updates).
            </li>
            <li>
              <strong>Message and data rates may apply.</strong> Rates are charged by your mobile carrier and are your
              responsibility.
            </li>
            <li>
              <strong>Opt out:</strong> Reply <strong>STOP</strong> to any message to unsubscribe at any time. You will
              receive one message confirming your opt-out.
            </li>
            <li>
              <strong>Help:</strong> Reply <strong>HELP</strong> for assistance, or contact us at {BUSINESS_EMAIL}.
            </li>
          </ul>

          <h3 className="font-display text-lg font-semibold text-deep-walnut mt-6">Data Retention &amp; Security</h3>
          <p className="mt-2 leading-relaxed">
            We retain your information for as long as needed to provide our services and meet our legal obligations, and
            we take reasonable measures to protect it from unauthorized access.
          </p>

          <h3 className="font-display text-lg font-semibold text-deep-walnut mt-6">Contact Us</h3>
          <p className="mt-2 leading-relaxed">
            Questions about this policy? Contact us at {BUSINESS_EMAIL}, {BUSINESS_PHONE}, or {BUSINESS_ADDRESS}.
          </p>
        </section>

        {/* ─── SMS Terms & Conditions ─────────────────────────────── */}
        <section id="terms" className="mt-12 scroll-mt-6">
          <h2 className="font-display text-2xl font-bold text-deep-walnut">SMS Terms &amp; Conditions</h2>

          <p className="mt-4 leading-relaxed">
            By providing your mobile phone number and requesting an appointment, you agree to receive transactional text
            messages from Sassy Lash &amp; Skin related to your bookings. These terms govern that messaging program.
          </p>

          <h3 className="font-display text-lg font-semibold text-deep-walnut mt-6">Program Description</h3>
          <p className="mt-2 leading-relaxed">
            We send transactional SMS messages such as appointment requests, confirmations, denials, and scheduling
            updates. We do not send marketing or promotional text messages.
          </p>

          <h3 className="font-display text-lg font-semibold text-deep-walnut mt-6">Message Frequency</h3>
          <p className="mt-2 leading-relaxed">
            Message frequency varies based on your booking activity.
          </p>

          <h3 className="font-display text-lg font-semibold text-deep-walnut mt-6">Costs</h3>
          <p className="mt-2 leading-relaxed">
            Message and data rates may apply. Such charges are billed by and payable to your mobile carrier.
          </p>

          <h3 className="font-display text-lg font-semibold text-deep-walnut mt-6">Opt Out &amp; Help</h3>
          <p className="mt-2 leading-relaxed">
            You can cancel the SMS service at any time by replying <strong>STOP</strong>. After you send STOP, we will
            send one confirmation message and then stop sending you text messages. For help, reply <strong>HELP</strong>{' '}
            or contact us at {BUSINESS_EMAIL}.
          </p>

          <h3 className="font-display text-lg font-semibold text-deep-walnut mt-6">Carrier Disclaimer</h3>
          <p className="mt-2 leading-relaxed">
            Carriers are not liable for delayed or undelivered messages.
          </p>

          <h3 className="font-display text-lg font-semibold text-deep-walnut mt-6">Contact</h3>
          <p className="mt-2 leading-relaxed">
            Sassy Lash &amp; Skin — {BUSINESS_EMAIL}, {BUSINESS_PHONE}, {BUSINESS_ADDRESS}.
          </p>
        </section>

        <div className="mt-12 border-t border-chalk pt-6">
          <Link href="/" className="text-warm-garnet hover:text-warm-garnet-deep text-sm underline underline-offset-2">
            ← Back to booking
          </Link>
        </div>
      </div>
    </main>
  )
}
