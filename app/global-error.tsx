"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-neutral-950 text-neutral-100">
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-md border border-neutral-800 bg-neutral-900 p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            {error?.message && (
              <p className="text-neutral-300 mb-4 break-words">{error.message}</p>
            )}
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}


