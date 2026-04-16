'use client'

type Props = { url: string; title: string }

export default function DownloadButton({ url, title }: Props) {
  return (
    <a
      href={url}
      download
      className="w-full py-4 rounded-2xl text-white text-lg font-semibold tracking-wide text-center active:scale-95 transition-transform block"
      style={{ backgroundColor: '#0A84FF' }}
    >
      Download {title}
    </a>
  )
}
