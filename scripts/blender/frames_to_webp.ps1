# Converts the rendered story frames (f0001.png ...) into the WebP sets the hero scrubs: public/story/1920 and /1280.
# Usage: frames_to_webp.ps1 -In D:\Assets\renders\scrub [-Quality 72]
param([string]$In = 'D:\Assets\renders\scrub', [int]$Quality = 72)
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
foreach ($w in 1920, 1280) {
  $out = Join-Path $root "public\story\$w"
  New-Item -ItemType Directory -Force $out | Out-Null
  & ffmpeg -v error -y -start_number 1 -i (Join-Path $In 'f%04d.png') -vf "scale=$($w):-2:flags=lanczos" -c:v libwebp -quality $Quality -compression_level 6 (Join-Path $out 'f%04d.webp')
  $files = Get-ChildItem $out -Filter *.webp
  "{0}px: {1} frames, {2:N1} MB" -f $w, $files.Count, (($files | Measure-Object Length -Sum).Sum / 1MB)
}
