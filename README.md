# Daylight

**See what's hidden in your photos. Then fix it.**

Daylight is a privacy-first image toolkit that processes everything in your browser. Drop a photo and instantly see what metadata is hiding inside — GPS coordinates, camera info, timestamps, editing software. Then strip it, compress, convert, and resize. Your photos never leave your device.

## Why Daylight?

Most image tools upload your photos to their servers. Even the ones that claim they don't — how would you know?

Daylight is different:

- **Zero network requests.** Open your browser's DevTools Network tab while using Daylight. You'll see nothing. That's the point.
- **No servers.** We literally don't have any. Daylight is a static site that runs entirely in your browser using modern web technologies (Canvas API, WebAssembly).
- **Prove it yourself.** The trust banner at the top of every page shows a live count: photos processed, network requests made (always 0), and data uploaded (always 0 bytes).

## Tools

### Privacy Audit (The Scary One)

Drop a photo and see everything that's hidden inside:

- **GPS location** plotted on an interactive map — see exactly where the photo was taken
- **Camera info** — make, model, lens, serial number
- **Timestamps** — when it was taken, when it was last edited
- **Software** — what app touched this photo
- **Privacy score** — red/yellow/green rating of how much you're exposing

Most people don't realize that sharing a photo from their phone can reveal their exact home address.

### Metadata Strip

Clean your photos before sharing:

- One-click removal of all metadata (GPS, camera info, timestamps)
- Selective stripping — keep orientation but remove location
- Before/after comparison showing exactly what was removed

### Compress & Convert

Shrink file sizes and convert between formats:

- JPEG, WebP, PNG output with quality slider
- Live file size comparison (e.g., "2.4 MB → 380 KB, 84% smaller")
- Side-by-side quality preview

### Resize

Resize images for any use case:

- Custom dimensions with aspect ratio lock
- Quick presets: Web (1200px), Email (800px), Social (1080px), Thumbnail (300px)
- Live preview

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| EXIF Parsing | exifr |
| Maps | Leaflet + OpenStreetMap |
| Icons | Lucide React |
| Image Processing | Canvas API (client-side) |

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output goes to `dist/` — a static site ready for deployment to GitHub Pages, Netlify, Vercel, or any static host.

## The Fine Print

Unlike TinyPNG (which uploads your photos and limits you to 20/day), Canva (which charges $13/month), or countless tools that say "privacy-first" in their footer and hope you believe them — Daylight gives you the tools to verify the claim yourself. Open the Network tab. See for yourself.

**Stop hoping your photos are private. Know they are.**

## License

MIT
