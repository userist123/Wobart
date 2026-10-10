# Tooling — where each step runs (inventory 2026-10-10)

## Marius-PC (Windows 11 Pro, 32 GB RAM, RTX 5060 Laptop 4 GB + Intel UHD; C: 15 GB free, D: 276 GB free)
Reached through Desktop Commander (device `Marius-PC`). PowerShell is the default shell. Install on **D:**, C: is nearly full.

| Tool | Path / state | Used for |
|---|---|---|
| Blender 5.2.2 LTS (portable zip, no admin) | `D:\Tools\blender-5.2.2-windows-x64\blender.exe` | headless `-b -P scripts/blender/build_car.py -- <out.glb>` → car GLB with clearcoat |
| gltf-transform CLI | `npm -g` → `gltf-transform` on PATH | `optimize --compress meshopt` (122 KB → 33.5 KB for the procedural car) |
| ffmpeg / ffprobe | winget `Gyan.FFmpeg`, user scope | video heroes, before/after scrub clips |
| KTX-Software (`toktx`) | **missing** (MSI needs admin) | KTX2 textures; until then gltf-transform uses WebP |
| Ollama 0.40.2 | running on 127.0.0.1:11434 | free local tier: qwen3:30b-a3b, qwen2.5-coder:7b/3b, llama3.1:8b, mistral:7b, qwen2.5:7b, nomic-embed-text |
| Node 24.13, pnpm, Python 3.14 (mcp 1.30, pytest, PyYAML, numpy, pillow), git, gh (logged in as userist123), vercel CLI, wsl | present | build, tests, deploy |
| Wobart checkout | `D:\Projects\Wobart` on `ccr-a57d8bba-5jt0rc` | model exports are committed from here |
| Vault checkouts | `C:\Users\Marius\Projects\AI_Memory_Vault_CODEX_READY` (main, behind origin); `C:\Users\Marius\AI_Memory_Vault_CODEX_READY` has a **broken HEAD**; a third copy sits inside `LogAnalyzer.UI` | keep only the `Projects` one |
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
