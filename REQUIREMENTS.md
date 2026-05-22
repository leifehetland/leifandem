# Wedding Splash — Requirements

## 1. Vision

A single-page web experience that announces our marriage, tells our story, and offers two clear paths for people who want to give a gift. It should feel celebratory, magical, and unmistakably ours — closer to an interactive art piece than a templated wedding website. The visual reference is *Child of Eden*: floating photo cards, additive-blended light particles, heavy bloom, a dominantly cyan/blue palette with magenta and green accents.

## 2. Personas

| Persona | Device | Time on page | Primary goal |
|---|---|---|---|
| Family member | iPhone, cellular | 30 seconds | See photos, find gift link |
| Friend | Laptop, wifi | 2–5 minutes | Explore, watch videos, read story |
| Older relative | iPad or older Android | 1 minute | Read names/date, see a few photos, not crash |
| Search crawler / link unfurler | n/a | n/a | Get OG image and title |

All personas must reach the gift links within two taps from landing.

## 3. Out of scope

- RSVP collection
- Registry management beyond linking out
- Guestbook, comments, or any form submission
- Authentication or private pages
- Multi-language / i18n
- Analytics beyond basic Vercel Web Analytics
- Email capture
- Music streaming integration (Spotify embed etc.)

## 4. Functional requirements

### 4.1 Landing and loading

- On first load, show a brief "tap to enter" gate. The tap doubles as the user gesture that unlocks audio playback.
- After tap, show a loading screen with a progress indicator until critical assets are ready (hero font, first 4 photo textures, ambient audio track).
- Once loaded, fade into the scene over ~800ms.

### 4.2 The scene (3D experience)

- A dark space with a central focal area where particle streaks flow inward (the *Child of Eden* "flow" effect).
- 12–20 media cards float in 3D, each registered in the media manifest, drifting and gently rotating.
- A particle field surrounds them with additive blending and bloom postprocessing.
- Camera responds to pointer position (desktop) or device tilt (mobile, optional) for subtle parallax. No free-fly camera.
- Background music loops at low volume by default.

### 4.3 Media cards

Three card types, all registered in the same manifest:

**Photo card**
- Rendered as a textured plane with a thin glowing border.
- Hover (desktop) or tap (mobile) scales it up and brightens its bloom.
- Click/tap opens the focused-card modal with the full-resolution image and caption.

**Video card**
- Same as photo card but the texture is a looping muted video.
- When focused, modal plays the video with sound (or captions if speech).

**Audio card**
- Rendered as a glowing orb, not a plane — visually distinct.
- Pulses its bloom intensity to the audio's amplitude when playing.
- When focused, modal shows a label, a play/pause control, and a waveform or simple scrubber.

### 4.4 Persistent UI

The following HTML elements are always visible above the canvas:

- **Hero header**: couple names + wedding date, top-center
- **Story button**: opens the story panel
- **Gifts button**: opens the gift modal
- **Audio toggle**: mute/unmute background music
- **Reduced-motion indicator** (only when active): "Static view enabled"

### 4.5 Story panel

- Slide-in panel from the right (desktop) or full-screen takeover (mobile).
- Renders the contents of `src/content/story.mdx`.
- Includes a close button and ESC-key support.
- Scrollable if content exceeds viewport.

### 4.6 Gift modal

- Centered modal with the heading "If you'd like to celebrate with us…"
- Two large, equally-weighted CTAs:
  - **Amazon Wishlist** — opens in new tab (`rel="noopener noreferrer"`)
  - **Honeyfund** — opens in new tab
- Short copy between/under the buttons explaining there's no expectation, both are just options.
- Dismissible via close button, ESC, or background tap.

### 4.7 Audio

- One ambient background loop, low volume, muted by default until first user interaction.
- Per-clip audio for audio cards, triggered on focus.
- Global mute toggle persists in `sessionStorage`.
- No audio plays before the loading-screen tap.

### 4.8 Sharing

- OG title, description, and a static OG image (1200x630) configured for unfurling in iMessage, WhatsApp, Slack, and Twitter/X.
- Favicon at multiple sizes including Apple touch icon.

## 5. Non-functional requirements

### 5.1 Performance

- **LCP** < 2.5s on mid-tier mobile (throttled 4G)
- **Initial JS bundle** (gzipped, no Three.js): < 200 kB
- **Total page weight** before scene assets: < 500 kB
- **Sustained framerate**: 60 fps desktop, 30 fps mobile minimum
- Total `/public/media` size under 40 MB

### 5.2 Compatibility

- **Must work**: latest 2 versions of Chrome, Safari, Firefox, Edge on desktop; iOS Safari 16+; Chrome Android 100+
- **Graceful fallback**: any browser without WebGL2 gets the low-tier 2D experience
- **No IE, no legacy Edge**

### 5.3 Accessibility

- Respect `prefers-reduced-motion` — disable drift, parallax, and audio reactivity; show static card layout
- All media has alt text in the manifest
- Story panel and gift modal are keyboard-navigable (Tab, ESC, Enter)
- Color contrast on all HTML text meets WCAG AA on the dark backdrop
- Focus indicators visible on all interactive HTML elements
- Skip-to-content link for screen readers that jumps straight to the gift modal

### 5.4 Mobile

- Layout works portrait and landscape from 360px width upward
- Touch targets at least 44x44 px (HTML) and equivalent invisible colliders on 3D cards
- No fixed elements that overlap iOS home indicator or notch
- Pinch-to-zoom disabled on the canvas, enabled on text content

### 5.5 SEO / discoverability

- Static metadata: title, description, OG, Twitter card
- `robots.txt` allows indexing (the site is public)
- Sitemap optional given it's a single page

### 5.6 Privacy

- No third-party trackers
- Vercel Web Analytics (privacy-preserving, no cookies) is the only telemetry
- No email, name, or other PII collected from visitors

## 6. Content the couple provides

This list is what must be supplied before launch. Build can proceed with placeholders.

- 12–20 photos (jpeg/png, will be converted to webp)
- 2–4 short video clips (mp4 or mov)
- 1–3 audio clips, optional (mp3 or wav)
- The story prose (markdown or plain text)
- Amazon wishlist URL
- Honeyfund URL
- Couple names + wedding date
- Optional: ambient background music track (mp3, license-cleared)

## 7. Launch checklist

- [ ] Real content swapped in for all placeholders
- [ ] Gift links tested (both open correct destinations)
- [ ] OG preview verified in iMessage, WhatsApp, Slack
- [ ] Tested on a real iPhone and a real Android phone
- [ ] Tested with `prefers-reduced-motion` enabled
- [ ] Tested with WebGL disabled (fallback path)
- [ ] Performance budget verified via Lighthouse mobile run
- [ ] Domain pointed at Vercel deployment
- [ ] HTTPS confirmed, no mixed content warnings
- [ ] Favicon and Apple touch icon visible

## 8. Success criteria

The site is successful if:

1. Friends and family who receive the link can find a gift link within two interactions
2. At least half of mobile visitors stay long enough to interact with one card (measurable in Vercel Analytics)
3. No one reports the site crashed or showed a black screen
4. The couple is proud to share it
