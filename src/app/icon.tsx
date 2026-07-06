export const dynamic = 'force-static'

export default function Icon() {
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="6" fill="#22c55e"/>
      <text x="16" y="22" font-family="system-ui" font-size="18" font-weight="bold" fill="white" text-anchor="middle">P</text>
    </svg>`,
    {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }
  )
}
