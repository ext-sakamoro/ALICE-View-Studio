const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ── Request / Response types ──────────────────────────────────────────────────

export interface RenderRequest {
  scene: unknown;
  width: number;
  height: number;
  format: string;
}

export interface RenderResponse {
  status: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  render_ms: number;
}

export interface SceneRequest {
  objects: unknown[];
  camera: unknown;
  lights: unknown[];
}

export interface SceneResponse {
  status: string;
  scene_id: string;
  object_count: number;
  light_count: number;
}

export interface FormatsResponse {
  formats: string[];
}

export interface EmbedRequest {
  scene_id: string;
  width: number;
  height: number;
}

export interface EmbedResponse {
  status: string;
  iframe_url: string;
  scene_id: string;
  width: number;
  height: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { method: "GET" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── ViewClient ────────────────────────────────────────────────────────────────

export const viewClient = {
  /** Submit a scene and receive render metadata. */
  render(req: RenderRequest): Promise<RenderResponse> {
    return post<RenderResponse>("/api/v1/view/render", req);
  },

  /** Upload a scene graph and receive a stable scene_id. */
  scene(req: SceneRequest): Promise<SceneResponse> {
    return post<SceneResponse>("/api/v1/view/scene", req);
  },

  /** List all supported output formats. */
  formats(): Promise<FormatsResponse> {
    return get<FormatsResponse>("/api/v1/view/formats");
  },

  /** Generate an embeddable iframe URL for a scene. */
  embed(req: EmbedRequest): Promise<EmbedResponse> {
    return post<EmbedResponse>("/api/v1/view/embed", req);
  },
};
