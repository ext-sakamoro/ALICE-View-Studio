//! ALICE View Studio — Core Rendering Engine
//!
//! Axum-based HTTP service exposing render, scene, format, and embed endpoints.

use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::{net::SocketAddr, sync::Arc, time::Instant};
use tokio::net::TcpListener;
use tracing::info;
use tracing_subscriber::EnvFilter;

// ── AppState ────────────────────────────────────────────────────────────────

#[derive(Clone)]
struct AppState {
    start_time: Arc<Instant>,
}

// ── Request / Response types ─────────────────────────────────────────────────

#[allow(dead_code)]
#[derive(Debug, Deserialize)]
struct RenderRequest {
    scene: serde_json::Value,
    width: u32,
    height: u32,
    format: String,
}

#[derive(Debug, Serialize)]
struct RenderResponse {
    status: &'static str,
    width: u32,
    height: u32,
    format: String,
    bytes: u64,
    render_ms: u64,
}

#[allow(dead_code)]
#[derive(Debug, Deserialize)]
struct SceneRequest {
    objects: Vec<serde_json::Value>,
    camera: serde_json::Value,
    lights: Vec<serde_json::Value>,
}

#[derive(Debug, Serialize)]
struct SceneResponse {
    status: &'static str,
    scene_id: String,
    object_count: usize,
    light_count: usize,
}

#[derive(Debug, Serialize)]
struct FormatsResponse {
    formats: Vec<&'static str>,
}

#[derive(Debug, Deserialize)]
struct EmbedRequest {
    scene_id: String,
    width: u32,
    height: u32,
}

#[derive(Debug, Serialize)]
struct EmbedResponse {
    status: &'static str,
    iframe_url: String,
    scene_id: String,
    width: u32,
    height: u32,
}

#[derive(Debug, Serialize)]
struct HealthResponse {
    status: &'static str,
    uptime_secs: u64,
}

// ── Handlers ─────────────────────────────────────────────────────────────────

async fn handle_render(
    State(_state): State<AppState>,
    Json(req): Json<RenderRequest>,
) -> impl IntoResponse {
    let start = Instant::now();
    info!(
        width = req.width,
        height = req.height,
        format = %req.format,
        "render request"
    );

    let supported = ["PNG", "JPEG", "WebP", "EXR", "HDR", "AVIF"];
    let fmt_upper = req.format.to_uppercase();
    if !supported.contains(&fmt_upper.as_str()) {
        return (
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(serde_json::json!({
                "error": format!("unsupported format: {}", req.format)
            })),
        )
            .into_response();
    }

    let bytes = (req.width as u64) * (req.height as u64) * 4;
    let render_ms = start.elapsed().as_millis() as u64;

    Json(RenderResponse {
        status: "ok",
        width: req.width,
        height: req.height,
        format: fmt_upper,
        bytes,
        render_ms,
    })
    .into_response()
}

async fn handle_scene(
    State(_state): State<AppState>,
    Json(req): Json<SceneRequest>,
) -> impl IntoResponse {
    let object_count = req.objects.len();
    let light_count = req.lights.len();

    info!(objects = object_count, lights = light_count, "scene upload");

    let scene_id = format!("scene-{:x}", fnv1a_timestamp());

    Json(SceneResponse {
        status: "ok",
        scene_id,
        object_count,
        light_count,
    })
}

async fn handle_formats(State(_state): State<AppState>) -> impl IntoResponse {
    Json(FormatsResponse {
        formats: vec!["PNG", "JPEG", "WebP", "EXR", "HDR", "AVIF"],
    })
}

async fn handle_embed(
    State(_state): State<AppState>,
    Json(req): Json<EmbedRequest>,
) -> impl IntoResponse {
    info!(scene_id = %req.scene_id, "embed request");

    let iframe_url = format!(
        "/embed/scenes/{}?w={}&h={}",
        req.scene_id, req.width, req.height
    );

    Json(EmbedResponse {
        status: "ok",
        iframe_url,
        scene_id: req.scene_id,
        width: req.width,
        height: req.height,
    })
}

async fn handle_health(State(state): State<AppState>) -> impl IntoResponse {
    Json(HealthResponse {
        status: "ok",
        uptime_secs: state.start_time.elapsed().as_secs(),
    })
}

// ── Utilities ────────────────────────────────────────────────────────────────

#[inline(always)]
fn fnv1a_timestamp() -> u64 {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos() as u64;
    let mut h: u64 = 0xcbf2_9ce4_8422_2325;
    for b in now.to_le_bytes() {
        h ^= b as u64;
        h = h.wrapping_mul(0x0000_0001_0000_01b3);
    }
    h
}

// ── Entry point ───────────────────────────────────────────────────────────────

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("view_engine=info,tower_http=debug")),
        )
        .init();

    let state = AppState {
        start_time: Arc::new(Instant::now()),
    };

    let app = Router::new()
        .route("/health", get(handle_health))
        .route("/api/v1/view/render", post(handle_render))
        .route("/api/v1/view/scene", post(handle_scene))
        .route("/api/v1/view/formats", get(handle_formats))
        .route("/api/v1/view/embed", post(handle_embed))
        .with_state(state);

    let addr_str = std::env::var("VIEW_ADDR").unwrap_or_else(|_| "0.0.0.0:8081".to_string());
    let addr: SocketAddr = addr_str
        .parse()
        .expect("VIEW_ADDR must be a valid socket address");

    info!("ALICE View Studio engine listening on {}", addr);

    let listener = TcpListener::bind(addr).await.expect("failed to bind");
    axum::serve(listener, app).await.expect("server error");
}
