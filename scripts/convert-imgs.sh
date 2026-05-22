#!/bin/bash
# Convert every image under src/imgs/ (recursively) to webp at <=1024px long edge,
# mirroring subfolder structure into public/media/images/. Slugifies filenames.
# Pipeline: sips (HEIC/PNG/JPG/JPEG/GIF -> intermediate PNG, resized) -> cwebp -> webp.
set -uo pipefail

SRC=/Users/leifhetland/Desktop/code/leifandem/src/imgs
DEST=/Users/leifhetland/Desktop/code/leifandem/public/media/images
TMPDIR=$(mktemp -d -t leifem-convert.XXXXXX)
trap 'rm -rf "$TMPDIR"' EXIT

mkdir -p "$DEST"

convert_one() {
  local infile="$1"
  local rel="${infile#"$SRC"/}"
  local dir
  dir="$(dirname "$rel")"
  local base
  base="$(basename "$rel")"
  local stem="${base%.*}"
  local slug
  slug="$(printf '%s' "$stem" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-_')"
  local outdir
  if [[ "$dir" == "." ]]; then
    outdir="$DEST"
  else
    outdir="$DEST/$(printf '%s' "$dir" | tr '[:upper:]' '[:lower:]')"
  fi
  mkdir -p "$outdir"
  local outfile="$outdir/$slug.webp"
  if [[ -f "$outfile" ]]; then
    return 0
  fi
  local tmp
  tmp="$(mktemp "$TMPDIR/${slug}.XXXXXX.png")"
  if ! sips -s format png -Z 1024 "$infile" --out "$tmp" >/dev/null 2>&1; then
    echo "SIPS FAIL: $infile" >&2
    rm -f "$tmp"
    return 1
  fi
  if ! cwebp -quiet -q 82 -m 6 "$tmp" -o "$outfile" >/dev/null 2>&1; then
    echo "CWEBP FAIL: $infile" >&2
    rm -f "$tmp"
    return 1
  fi
  rm -f "$tmp"
}

export -f convert_one
export SRC DEST TMPDIR

total=$(find "$SRC" -type f \( -iname "*.heic" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" \) | wc -l | tr -d ' ')
echo "Converting $total files to webp..."

find "$SRC" -type f \( -iname "*.heic" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" \) -print0 | \
  xargs -0 -n 1 -P 8 -I {} bash -c 'convert_one "$@"' _ {}

written=$(find "$DEST" -type f -name "*.webp" | wc -l | tr -d ' ')
size=$(du -sh "$DEST" | awk '{print $1}')
echo "Done. $written webp files written. Total size: $size"
