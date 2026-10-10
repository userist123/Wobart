# Waits until no Blender process is running (another user's job finishes first), then renders the scroll story.
# Log: D:\Assets\renders\queue.log. Example: queue_scrub.ps1 -Out D:\Assets\renders\scrub-test -Extra '--width 960 --height 540 --samples 32 --step 30'
param([string]$Out = 'D:\Assets\renders\scrub', [string]$Extra = '')
$log = 'D:\Assets\renders\queue.log'
New-Item -ItemType Directory -Force (Split-Path $log) | Out-Null
"$(Get-Date -Format s) scrub queued -> $Out; waiting for other Blender jobs" | Add-Content $log
while ($true) {
  if (-not (Get-Process blender -ErrorAction SilentlyContinue)) { Start-Sleep -Seconds 20; if (-not (Get-Process blender -ErrorAction SilentlyContinue)) { break } }
  Start-Sleep -Seconds 30
}
"$(Get-Date -Format s) GPU free; starting scrub render" | Add-Content $log
& 'D:\Tools\blender-5.2.2-windows-x64\blender.exe' -b -P 'D:\Projects\Wobart\scripts\blender\render_scrub.py' -- 'D:\Assets\models\wob-car-concept.raw.glb' $Out --device OPTIX @($Extra -split ' ' | Where-Object { $_ }) 2>&1 |
  Select-String -Pattern 'RENDERED|ALL_DONE|GLARE|Error|Traceback|line \d+|GPU unavailable' | ForEach-Object { "$(Get-Date -Format s) $($_.Line)" | Add-Content $log }
"$(Get-Date -Format s) scrub finished" | Add-Content $log
