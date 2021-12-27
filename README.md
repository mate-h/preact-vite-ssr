# vite-ssr-web

Ideally each feature would be a separate package in a monorepository structure.
Examples: `theme`, `locale`, and `palette`.

Use PNPM workspace.

Vanilla Vite SSR, no SSR plugin, use preact static router. Use SvelteKit patterns for filesystem based routing.
Always based on standards.

Features:
- Preact
- Vite SSR
- WindiCSS/Tailwind
- Themeing
- i18n, a11y
- RTL layout
- Icons
- Customizable design system
- Customizable components
- Baselined text
- Proper documentation

Research:
- Isomorphic RPC
- Dynamic theme and user language for pre-rendered HTML content served over CDN with cache
- Offline support
- Worker support (web worker or edge worker)
- WASM / Rust packages for OpenCV QR reader
- PWA manifest, installability
- User defined meta tags
- Save/sync to any data store backend (local storage, firestore, etc.)
- Editable, persisted interface state (node based, see slate)
- Page transitions with iOS backswipe detection to cancel transition
- WebGL shaders: metaball, water surface, parallax, continous curvature