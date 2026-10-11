# Tooling — where each step runs (inventory 2026-10-10)

## LAB-PC (Windows 11 Pro, 32 GB RAM, RTX 5060 Laptop 4 GB + Intel UHD; C: 15 GB free, D: 276 GB free)
Reached through Desktop Commander (device `LAB-PC`). PowerShell is the default shell. Install on **D:**, C: is nearly full.

| Tool | Path / state | Used for |
|---|---|---|
| Blender 5.2.2 LTS (portable zip, no admin) | `D:\Tools\blender-5.2.2-windows-x64\blender.exe` | headless `-b -P scripts/blender/build_car.py -- <out.glb>` → car GLB with clearcoat |
| gltf-transform CLI | `npm -g` → `gltf-transform` on PATH | `optimize --compress meshopt` (122 KB → 33.5 KB for the procedural car) |
| ffmpeg / ffprobe | winget `Gyan.FFmpeg`, user scope | video heroes, before/after scrub clips |
| KTX-Software (`toktx`) | **missing** (MSI needs admin) | KTX2 textures; until then gltf-transform uses WebP |
| Ollama 0.40.2 | running on 127.0.0.1:11434 | free local tier: qwen3:30b-a3b, qwen2.5-coder:7b/3b, llama3.1:8b, mistral:7b, qwen2.5:7b, nomic-embed-text |
| Node 24.13, pnpm, Python 3.14 (mcp 1.30, pytest, PyYAML, numpy, pillow), git, gh (logged in as userist123), vercel CLI, wsl | present | build, tests, deploy |
| Wobart checkout | `D:\Projects\Wobart` on `ccr-a57d8bba-5jt0rc` | model exports are committed from here |
| Vault checkouts | `C:\Users\user\Projects\AI_Memory_Vault_CODEX_READY` (main, behind origin); `C:\Users\user\AI_Memory_Vault_CODEX_READY` has a **broken HEAD**; a third copy sits inside `LogAnalyzer.UI` | keep only the `Projects` one |
| Blocked by Desktop Commander policy | `reg`, `net`, `sc`, `netsh`, `runas`, `shutdown`, disk tools | nothing here needs them |

## Cloud session (claude.ai/code container)
Next.js build, lint, tsc, Playwright/Chromium (preinstalled, WebGL via SwiftShader), subagents, GitHub push.
Gaps: no Blender (Python 3.13 here; the `bpy` wheel needs 3.11, so the binary tarball would be the way), the vault MCP
server needs `mcp<2` or a port to `MCPServer`, pytest not preinstalled.

## 3D asset pipeline (proven end to end on 2026-10-10)
1. `blender -b -P scripts/blender/build_car.py -- public/models/wob-car.raw.glb` (3.6 s, 448 base polys before bevel)
2. `gltf-transform optimize wob-car.raw.glb wob-car.glb --compress meshopt --texture-compress false`
3. `gltf-transform inspect wob-car.glb` → extensions: EXT_meshopt_compression, KHR_materials_clearcoat,
   KHR_materials_emissive_strength, KHR_mesh_quantization; materials: Wrap, Glass, Rubber, Rim, Headlight, Taillight
4. Commit the GLB from `D:\Projects\Wobart`, pull in the cloud session, wire it in `components/canvas/WrapConfigurator.tsx`
   (`useGLTF(url, undefined, true)` for meshopt; swap the material named `Wrap` at runtime).

## Still only the owner can supply
Licensed realistic car model (if wanted), real photos, phone/address/hours, reviews, logo, Vercel env vars
(`MONGO_URL`, backend URL), DNS at the registrar, admin-level installs (toktx).

## Penpot design via MCP (set up 2026-10-10, owner-approved)
- Penpot 2.18 runs locally at `http://localhost:9001` (Docker Compose project `penpot`, `C:\Dev\penpot`).
- Agent account `agent@wob-art.local` ("WOB Design Agent"); password only in `D:\Tools\penpot-agent\agent-account.txt`.
  Its design file: "WOB ART — Design v3" (Drafts of the agent's personal team).
- A dedicated headless Chromium (`D:\Tools\penpot-agent\start-browser.cjs`, CDP on 127.0.0.1:9333 only, profile in
  `D:\Tools\penpot-agent\profile`) keeps the workspace open with Main menu → MCP server → Connect. The owner explicitly
  approved keeping this browser running while we work; stop it by closing that Chromium process.
- MCP client: `D:\Tools\penpot-mcp-client\call.mjs` (official SDK). Server URL + key read from `mcp-url.txt`
  (currently the agent's key; the owner's key is kept in `mcp-url-user.txt`). Never print these files.
  `node call.mjs list` · `node call.mjs execute_code @code.json` · `node call.mjs export_shape '{"shapeId":"<id>"}'`.
- Gotchas: `penpot.currentUser` needs a permission the plugin lacks; `export_shape` with "page" fails, export a board id.
  A Playwright `has-text("Connect")` also matches "Disconnect": match `/^Connect$/`.
