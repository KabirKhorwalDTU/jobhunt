import { useEffect, useState } from 'react'

export default function DeckPreview({ companyName, deckUrl, loomLink }) {
  const [frameLoaded, setFrameLoaded] = useState(false)

  useEffect(() => {
    setFrameLoaded(false)
  }, [deckUrl])

  if (!companyName) {
    return <div className="h-full grid place-items-center text-slate-600 text-sm px-4 text-center">Select a contact to view deck details.</div>
  }

  return (
    <section className="h-full flex flex-col p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Deck for {companyName}</h3>

      {deckUrl ? (
        <>
          <a
            href={deckUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700 w-fit"
          >
            Open Deck ↗
          </a>

          <div className="mt-3 flex-1 min-h-[280px] rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <iframe
              src={deckUrl}
              title={`Deck for ${companyName}`}
              className="h-full w-full"
              onLoad={() => setFrameLoaded(true)}
            />
          </div>

          {!frameLoaded && (
            <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-300">
              If deck embed is blocked, use the Open Deck button above.
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
          No deck URL is available for this company.
        </div>
      )}

      {loomLink && (
        <a
          href={loomLink}
          target="_blank"
          rel="noreferrer"
          className="mt-4 text-sm text-sky-400 hover:text-sky-300"
        >
          🎥 Loom link
        </a>
      )}
    </section>
  )
}
