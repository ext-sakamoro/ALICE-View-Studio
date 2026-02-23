# ALICE View Studio

Cloud rendering studio powered by ALICE-View.

**License**: AGPL-3.0

---

## Architecture

```
Browser
  └── Frontend (Next.js)       :3000
        └── API Gateway        :8080
              └── View Engine  :8081   (Rust/Axum)
```

| Service | Port | Technology |
|---------|------|-----------|
| Frontend | 3000 | Next.js 14, TypeScript, Tailwind CSS |
| API Gateway | 8080 | Reverse proxy / auth middleware |
| View Engine | 8081 | Rust, Axum, Tokio |

---

## Endpoints

All endpoints are served at `:8081` (or through the gateway at `:8080`).

### `POST /api/v1/view/render`

Submit a scene for rendering.

**Request**
```json
{
  "scene": { "objects": [], "camera": {}, "lights": [] },
  "width": 1920,
  "height": 1080,
  "format": "PNG"
}
```

**Response**
```json
{
  "status": "ok",
  "width": 1920,
  "height": 1080,
  "format": "PNG",
  "bytes": 8294400,
  "render_ms": 12
}
```

### `POST /api/v1/view/scene`

Upload a scene graph and receive a stable ID.

**Request**
```json
{
  "objects": [{ "type": "sphere", "radius": 1 }],
  "camera": { "position": [0, 0, 5], "fov": 60 },
  "lights": [{ "type": "point", "intensity": 1.0 }]
}
```

**Response**
```json
{
  "status": "ok",
  "scene_id": "scene-a1b2c3d4e5f6",
  "object_count": 1,
  "light_count": 1
}
```

### `GET /api/v1/view/formats`

List all supported output formats.

**Response**
```json
{ "formats": ["PNG", "JPEG", "WebP", "EXR", "HDR", "AVIF"] }
```

### `POST /api/v1/view/embed`

Generate an embeddable iframe URL for a scene.

**Request**
```json
{ "scene_id": "scene-a1b2c3d4e5f6", "width": 800, "height": 450 }
```

**Response**
```json
{
  "status": "ok",
  "iframe_url": "/embed/scenes/scene-a1b2c3d4e5f6?w=800&h=450",
  "scene_id": "scene-a1b2c3d4e5f6",
  "width": 800,
  "height": 450
}
```

### `GET /health`

Liveness check.

```json
{ "status": "ok", "uptime_secs": 42 }
```

---

## Running Locally

### View Engine

```bash
cd services/core-engine
VIEW_ADDR=0.0.0.0:8081 cargo run --release
```

### Frontend

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VIEW_ADDR` | `0.0.0.0:8081` | Bind address for the render engine |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | API gateway base URL |
| `RUST_LOG` | `view_engine=info` | Logging filter |

---

## License

AGPL-3.0. See [LICENSE](./LICENSE).
