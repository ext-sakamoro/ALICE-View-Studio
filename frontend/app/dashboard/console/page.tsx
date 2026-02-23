"use client";

import { useViewStore } from "@/lib/hooks/use-store";
import { viewClient } from "@/lib/api/client";

const FORMATS = ["PNG", "JPEG", "WebP", "EXR", "HDR", "AVIF"] as const;

const DEFAULT_SCENE = JSON.stringify(
  {
    objects: [{ type: "sphere", radius: 1, position: [0, 0, 0] }],
    camera: { position: [0, 0, 5], fov: 60 },
    lights: [{ type: "point", position: [3, 3, 3], intensity: 1.0 }],
  },
  null,
  2
);

export default function ViewConsolePage() {
  const {
    width,
    height,
    format,
    sceneData,
    result,
    loading,
    setWidth,
    setHeight,
    setFormat,
    setSceneData,
    setResult,
    setLoading,
  } = useViewStore();

  async function handleRender() {
    setLoading(true);
    setResult(null);
    try {
      let scene: unknown;
      try {
        scene = JSON.parse(sceneData || DEFAULT_SCENE);
      } catch {
        scene = {};
      }
      const res = await viewClient.render({
        scene,
        width,
        height,
        format,
      });
      setResult(res as unknown as Record<string, unknown>);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-semibold">View Console</h1>
        <p className="text-sm text-gray-400">
          Submit scenes and inspect render results
        </p>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {/* Controls */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Width */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Width (px)
            </label>
            <input
              type="number"
              min={1}
              max={8192}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Height */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Height (px)
            </label>
            <input
              type="number"
              min={1}
              max={8192}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Format */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Output Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Scene JSON */}
        <section>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Scene JSON
          </label>
          <textarea
            rows={14}
            value={sceneData ?? DEFAULT_SCENE}
            onChange={(e) => setSceneData(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 font-mono text-sm text-green-400 focus:border-indigo-500 focus:outline-none"
            spellCheck={false}
          />
        </section>

        {/* Render button */}
        <button
          onClick={handleRender}
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          {loading ? "Rendering..." : "Render"}
        </button>

        {/* Result panel */}
        {result && (
          <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-3 text-lg font-semibold">Result</h2>
            <pre className="overflow-auto text-sm text-green-400">
              {JSON.stringify(result, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </div>
  );
}
