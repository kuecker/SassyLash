import Link from 'next/link'

export default function ConfirmationPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <div className="text-5xl">🌸</div>
        <h1 className="font-display text-2xl font-bold text-deep-walnut">Request Received!</h1>
        <p className="font-body text-driftwood">
          Your appointment request has been submitted. We'll send you a text message
          to confirm your booking shortly.
        </p>
        <p className="font-body text-sm text-fog">
          Didn't get a text within a few hours? Check that your phone number was correct.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 text-warm-garnet hover:text-warm-garnet-deep font-body font-medium text-sm"
        >
          ← Back to booking
        </Link>
      </div>
    </main>
  )
}
