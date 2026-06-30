import Link from 'next/link'

export default function ConfirmationPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <div className="text-5xl">🌸</div>
        <h1 className="text-2xl font-bold">Request Received!</h1>
        <p className="text-stone-600">
          Your appointment request has been submitted. We'll send you a text message
          to confirm your booking shortly.
        </p>
        <p className="text-sm text-stone-400">
          Didn't get a text within a few hours? Check that your phone number was correct.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 text-rose-500 hover:text-rose-600 font-medium text-sm"
        >
          ← Back to booking
        </Link>
      </div>
    </main>
  )
}
