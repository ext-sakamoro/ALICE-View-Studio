import Link from "next/link";

const features = [
  {
    title: "Cloud Rendering",
    description:
      "Submit scenes and receive rendered images in PNG, JPEG, WebP, EXR, HDR, or AVIF — all processed server-side at scale.",
    icon: "☁",
  },
  {
    title: "Scene Management",
    description:
      "Upload and version scene graphs containing objects, cameras, and lights. Retrieve by stable scene IDs.",
    icon: "🗂",
  },
  {
    title: "Embeddable Previews",
    description:
      "Generate iframe-ready preview URLs for any scene. Drop a rendered view into any webpage with a single tag.",
    icon: "🖼",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-32 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-400">
          ALICE View Studio
        </p>
        <h1 className="mb-4 text-5xl font-extrabold leading-tight md:text-6xl">
          Don&apos;t render blindly.
          <br />
          <span className="text-indigo-400">Render the law of light.</span>
        </h1>
        <p className="mb-8 max-w-xl text-lg text-gray-400">
          Cloud rendering studio powered by ALICE-View. Submit scene graphs,
          receive pixel-perfect images, and embed previews anywhere — without
          managing GPU infrastructure.
        </p>
        <div className="flex gap-4">
          <Link
            href="/dashboard/console"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Open Console
          </Link>
          <Link
            href="#features"
            className="rounded-lg border border-gray-700 px-6 py-3 font-semibold text-gray-300 hover:border-indigo-500 hover:text-white transition-colors"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            What ALICE View Studio gives you
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-800 bg-gray-900 p-6"
              >
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
                <p className="text-gray-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-sm text-gray-600">
        ALICE View Studio — AGPL-3.0
      </footer>
    </main>
  );
}
