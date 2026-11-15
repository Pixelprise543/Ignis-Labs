/**
 * The app's single backdrop image, fixed behind every route.
 *
 * Why a component and not a CSS `url()`: the deploy is a GitHub Pages project
 * page, so assets live under a sub-path. `import.meta.env.BASE_URL` is the only
 * reliable way to build that URL - a root-absolute "/hero-..." would 404 there.
 *
 * The image is from NASA's science image library (science.nasa.gov), public
 * domain, committed byte-for-byte and never re-encoded. The scrim that keeps
 * text legible over it lives in app.css; this file only positions the photo.
 */
export function Backdrop() {
  const src = `${import.meta.env.BASE_URL}hero-pillars-of-creation.jpg`;

  return (
    <div className="ig-backdrop" aria-hidden="true">
      <div className="ig-backdrop-photo" style={{ backgroundImage: `url("${src}")` }} />
    </div>
  );
}
