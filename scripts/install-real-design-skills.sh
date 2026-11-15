#!/usr/bin/env bash
# Reproducible, pinned upstream design skills. Developer tools, NOT website runtime packages.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
command -v git >/dev/null
command -v node >/dev/null
[ "$(node -p 'Number(process.versions.node.split(".")[0])')" -ge 22 ] || { echo "Node 22+ required"; exit 1; }

sparse_repo() {
 local name="$1" url="$2" commit="$3"; shift 3
 local location="$TMP/$name"
 git init -q "$location"
 git -C "$location" remote add origin "$url"
 git -C "$location" sparse-checkout init --cone
 git -C "$location" sparse-checkout set "$@"
 git -C "$location" -c protocol.version=2 fetch -q --depth=1 --filter=blob:none origin "$commit"
 git -C "$location" checkout -q --detach FETCH_HEAD
 [ "$(git -C "$location" rev-parse HEAD)" = "$commit" ] || { echo "Upstream pin mismatch: $name"; exit 1; }
}
sparse_repo taste https://github.com/Leonxlnx/taste-skill.git f6b76575f949707b4e3c37cd86cb44b0b98643e8 skills/taste-skill
sparse_repo vercel https://github.com/vercel-labs/agent-skills.git 1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62 skills/web-design-guidelines
sparse_repo voltagent https://github.com/VoltAgent/awesome-design-md.git fcc70284932276d085f01ef9f83edde90b1258cb design-md/airbnb design-md/figma design-md/apple
sparse_repo playwright https://github.com/microsoft/playwright-cli.git b21724888b8100b05ef8dee3a92f2bb03bf4dcde skills/playwright-cli

mkdir -p "$ROOT/.agents/skills" "$ROOT/.agents/design-inspirations" "$ROOT/docs/vendor-licenses"
rm -rf "$ROOT/.agents/skills/design-taste-frontend" "$ROOT/.agents/skills/web-design-guidelines" "$ROOT/.agents/skills/playwright-cli"
mkdir -p "$ROOT/.agents/skills/design-taste-frontend" "$ROOT/.agents/skills/web-design-guidelines" "$ROOT/.agents/skills/playwright-cli"
cp -a "$TMP/taste/skills/taste-skill/." "$ROOT/.agents/skills/design-taste-frontend/"
cp -a "$TMP/vercel/skills/web-design-guidelines/." "$ROOT/.agents/skills/web-design-guidelines/"
cp -a "$TMP/playwright/skills/playwright-cli/." "$ROOT/.agents/skills/playwright-cli/"
for design in airbnb figma apple; do
 mkdir -p "$ROOT/.agents/design-inspirations/$design"
 cp "$TMP/voltagent/design-md/$design/DESIGN.md" "$ROOT/.agents/design-inspirations/$design/DESIGN.md"
done
cp "$TMP/taste/LICENSE" "$ROOT/docs/vendor-licenses/taste-skill-MIT.txt"
cp "$TMP/voltagent/LICENSE" "$ROOT/docs/vendor-licenses/awesome-design-md-MIT.txt"
cp "$TMP/playwright/LICENSE" "$ROOT/docs/vendor-licenses/playwright-cli-APACHE-2.0.txt"

test -s "$ROOT/.agents/skills/design-taste-frontend/scripts/consistency.mjs"
test -s "$ROOT/.agents/skills/design-taste-frontend/scripts/gate.mjs"
test -s "$ROOT/.agents/skills/web-design-guidelines/SKILL.md"
test -s "$ROOT/.agents/skills/playwright-cli/SKILL.md"
for design in airbnb figma apple; do test -s "$ROOT/.agents/design-inspirations/$design/DESIGN.md"; done
echo "Installed actual pinned upstream skill files and read-only DESIGN.md references."

if [ "${1:-}" = "--with-cli" ]; then
 mkdir -p "$ROOT/.tools/playwright-cli"
 npm install --no-audit --no-fund --no-save --prefix "$ROOT/.tools/playwright-cli" @playwright/cli@0.1.24
 "$ROOT/.tools/playwright-cli/node_modules/.bin/playwright-cli" --help >/dev/null
 echo "Playwright CLI verified for development/QA, not included in website runtime."
fi
