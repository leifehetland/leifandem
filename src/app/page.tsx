import { SceneBackground } from '@/components/scene/SceneBackground';
// import { AudioToggle } from '@/components/ui/AudioToggle';
// import { BunzPanel } from '@/components/ui/BunzPanel'; // temporarily hidden
import { CeremonyPanel } from '@/components/ui/CeremonyPanel';
import { LocaleToggle } from '@/components/ui/LocaleToggle';
import { FocusedCardModal } from '@/components/ui/FocusedCardModal';
// import { Hero } from '@/components/ui/Hero';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { NavButtons } from '@/components/ui/NavButtons';
import { RotateHint } from '@/components/ui/RotateHint';
import { PlaylistBar } from '@/components/ui/PlaylistBar';
import { StoryContent } from '@/components/ui/StoryContent';
import { StoryPanel } from '@/components/ui/StoryPanel';
import { ThrowbacksPanel } from '@/components/ui/ThrowbacksPanel';
import { WebGLFallback } from '@/components/ui/WebGLFallback';

/**
 * The only route. Server Component that composes Client overlays plus the
 * dynamically-imported 3D background and the 2D low-tier fallback.
 *
 * Stacking & pointer-events:
 *   <SceneBackground>   fixed inset-0, no z-index, FIRST in DOM → behind
 *                       <main>. Pointer-events ON so cards can be clicked.
 *   <main>              relative, no z-index, AFTER SceneBackground → on
 *                       top visually but `pointer-events-none` so clicks
 *                       fall through to the canvas. Has no background of
 *                       its own; the gradient lives on <body> in globals.css
 *                       so it shows through when the canvas isn't rendered.
 *   z= 10  <WebGLFallback> (relative, inside main, only when tier='low')
 *   z= 30  <Hero>, <NavButtons>, <AudioToggle>
 *   z= 40  <GiftModal>
 *   z= 50  <StoryPanel>, <CeremonyPanel>, <ThrowbacksPanel>, <LoadingScreen>
 *   z= 55  <FocusedCardModal> — sits above the grid panels so taps on a
 *          thumbnail open the full-size photo on top of the grid
 *   z= 60  <PlaylistBar> — sits above the panels so the playlist stays
 *          accessible while any of them are open. It's gated on
 *          `hasEntered`, so the LoadingScreen still appears alone.
 *
 * `<StoryContent />` is a Server Component that reads + compiles the MDX
 * narrative; it is passed as children into the client `<StoryPanel />`.
 */
export default function Page() {
  return (
    <>
      <SceneBackground />

      <main className="pointer-events-none relative min-h-dvh w-full overflow-hidden">
        <WebGLFallback />
        <LocaleToggle />
        {/* <Hero /> */}
        <NavButtons />
        <RotateHint />
        {/* <AudioToggle /> */}
        <FocusedCardModal />
        <StoryPanel
          enContent={<StoryContent locale="en" />}
          noContent={<StoryContent locale="no" />}
        />
        {/* <BunzPanel /> -- temporarily hidden; restore alongside BunzLink in story MDX */}
        <CeremonyPanel />
        <ThrowbacksPanel />
        <PlaylistBar />
        <LoadingScreen />
      </main>
    </>
  );
}
