#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const findings = [];

// ── Utilities ────────────────────────────────────────────────────────────────

function globFiles(dir, exts) {
  const result = [];
  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (exts.some(e => entry.name.endsWith(e))) result.push(full);
    }
  }
  walk(dir);
  return result;
}

function readLines(file) {
  return fs.readFileSync(file, 'utf8').split('\n').map((text, i) => ({ num: i + 1, text }));
}

function rel(file) {
  return path.relative(ROOT, file);
}

function add(severity, check, file, line, message) {
  findings.push({ severity, check, file: rel(file), line, message });
}

function isDmeFile(file) {
  const name = path.basename(file);
  // IDP tooling files that legitimately use raw values
  return ['TokenEditor.jsx', 'RoleTargeter.jsx', 'main.jsx',
    'DevModeInspector.jsx', 'CommentsInspector.jsx', 'StatesPanel.jsx',
    'PageNavigator.jsx'].includes(name);
}

function findFile(files, name) {
  return files.find(f => path.basename(f) === name);
}

const SURFACES = ['muted', 'inverse', 'accent', 'tertiary'];

// ── Check 1: Button Variant Wiring ──────────────────────────────────────────

function checkButtonWiring(files) {
  const comBtnFile = findFile(files, 'ComButtons.css');
  if (!comBtnFile) { add('P0', 'btn-wiring', comBtnFile || 'N/A', 0, 'ComButtons.css not found'); return; }

  // Extract variant names from ComButtons.css class definitions
  const comBtnLines = readLines(comBtnFile);
  const variantSet = new Set();
  for (const { text } of comBtnLines) {
    const m = text.match(/\.com-btn--([a-z-]+)\s*[{,]/);
    if (m && !['lg', 'sm', 'micro', 'xsm', 'pill-lg', 'pill-sm', 'pill-md'].includes(m[1])) {
      variantSet.add(m[1]);
    }
  }
  const variants = [...variantSet];

  // Determine the canonical "probe" token for each variant.
  // Ghost and outline are intentionally transparent (no -bg token).
  function probeToken(v) {
    if (v === 'ghost') return 'btn-ghost-fg';
    if (v === 'outline') return 'btn-outline-fg';
    if (v === 'pill') return 'btn-pill-bg';
    return `btn-${v}-bg`;
  }

  // Tokens CSS: check L2 token exists for each variant
  const tokenFile = findFile(files, 'tokens.css');
  if (tokenFile) {
    const tokenText = fs.readFileSync(tokenFile, 'utf8');
    for (const v of variants) {
      const tok = `--com-${probeToken(v)}`;
      if (!tokenText.includes(tok + ':') && !tokenText.includes(tok + ' :')) {
        add('P0', 'btn-wiring', tokenFile, 0, `Missing L2 token ${tok} for variant "${v}"`);
      }
    }
    // Check surface tokens for each variant × surface
    for (const v of variants) {
      const suffix = probeToken(v);
      for (const sf of SURFACES) {
        const tok = `--sf-${sf}-${suffix}`;
        if (!tokenText.includes(tok + ':') && !tokenText.includes(tok + ' :')) {
          add('P0', 'btn-wiring', tokenFile, 0, `Missing surface token ${tok}`);
        }
      }
    }
  }

  // Surfaces CSS: check remapping for each variant × surface
  const surfFile = findFile(files, 'surfaces.css');
  if (surfFile) {
    const surfText = fs.readFileSync(surfFile, 'utf8');
    for (const v of variants) {
      const suffix = probeToken(v);
      for (const sf of SURFACES) {
        const tok = `--sf-${sf}-${suffix}`;
        if (!surfText.includes(tok)) {
          add('P0', 'btn-wiring', surfFile, 0, `Missing surface remapping for ${tok} in .surface-${sf}`);
        }
      }
    }
  }

  // TokenEditor.jsx: BTN_SURFACE_TOKENS, DEFAULT_SURFACE_TOKEN_MAP, BTN_LIGHT/BTN_DARK
  const teFile = findFile(files, 'TokenEditor.jsx');
  if (teFile) {
    const teText = fs.readFileSync(teFile, 'utf8');
    for (const v of variants) {
      const suffix = probeToken(v);
      // BTN_SURFACE_TOKENS
      if (!teText.includes(`'${suffix}'`) && !teText.includes(`"${suffix}"`)) {
        add('P0', 'btn-wiring', teFile, 0, `BTN_SURFACE_TOKENS missing "${suffix}"`);
      }
      // DEFAULT_SURFACE_TOKEN_MAP
      if (!teText.includes(`'${suffix}'`) && !teText.includes(`"${suffix}"`)) {
        add('P0', 'btn-wiring', teFile, 0, `DEFAULT_SURFACE_TOKEN_MAP missing key "${suffix}"`);
      }
    }
  }

  // RoleTargeter.jsx: BTN_VARIANTS
  const rtFile = findFile(files, 'RoleTargeter.jsx');
  if (rtFile) {
    const rtText = fs.readFileSync(rtFile, 'utf8');
    for (const v of variants) {
      if (!rtText.includes(`'${v}'`) && !rtText.includes(`"${v}"`)) {
        add('P0', 'btn-wiring', rtFile, 0, `BTN_VARIANTS missing variant "${v}"`);
      }
    }
  }

  // main.jsx: RO_BTN_CSS
  const mainFile = findFile(files, 'main.jsx');
  if (mainFile) {
    const mainText = fs.readFileSync(mainFile, 'utf8');
    for (const v of variants) {
      // RO_BTN_CSS keys use the variant name directly
      const keyPat1 = `'${v}'`;
      const keyPat2 = `"${v}"`;
      const keyPat3 = `${v}:`;
      if (!mainText.includes(keyPat1) && !mainText.includes(keyPat2) && !mainText.includes(keyPat3)) {
        add('P0', 'btn-wiring', mainFile, 0, `RO_BTN_CSS missing variant "${v}"`);
      }
    }
  }

  // ButtonsSheetPage.jsx: VARIANTS array
  const bspFile = findFile(files, 'ButtonsSheetPage.jsx');
  if (bspFile) {
    const bspText = fs.readFileSync(bspFile, 'utf8');
    for (const v of variants) {
      if (!bspText.includes(`com-btn--${v}`)) {
        add('P0', 'btn-wiring', bspFile, 0, `VARIANTS array missing "com-btn--${v}"`);
      }
    }
  }

  // SurfacePreviewPage.jsx: variants array
  const sppFile = findFile(files, 'SurfacePreviewPage.jsx');
  if (sppFile) {
    const sppText = fs.readFileSync(sppFile, 'utf8');
    for (const v of variants) {
      if (!sppText.includes(`com-btn--${v}`)) {
        add('P0', 'btn-wiring', sppFile, 0, `variants array missing "com-btn--${v}"`);
      }
    }
  }
}

// ── Check 2: Token Definition Completeness ──────────────────────────────────

function checkTokenDefinitions(files) {
  const surfFile = findFile(files, 'surfaces.css');
  const tokenFile = findFile(files, 'tokens.css');
  if (!surfFile || !tokenFile) return;

  const tokenText = fs.readFileSync(tokenFile, 'utf8');
  const surfLines = readLines(surfFile);

  // Collect all --sf-* tokens referenced in surfaces.css (on the right side of var())
  const referenced = new Set();
  const refLocations = {};
  for (const { num, text } of surfLines) {
    const matches = text.matchAll(/var\((--sf-[a-z0-9-]+)\)/g);
    for (const m of matches) {
      referenced.add(m[1]);
      if (!refLocations[m[1]]) refLocations[m[1]] = { file: surfFile, line: num };
    }
  }

  // Check each referenced token is defined in tokens.css :root
  for (const tok of referenced) {
    // Token defined means it appears as a property declaration: --sf-muted-bg:
    if (!tokenText.includes(tok + ':') && !tokenText.includes(tok + ' :')) {
      const loc = refLocations[tok];
      add('P0', 'token-defs', loc.file, loc.line, `Orphan surface token "${tok}" referenced but never defined in tokens.css`);
    }
  }
}

// ── Check 3: Surface Remapping Completeness ─────────────────────────────────

function checkSurfaceRemapping(files) {
  const surfFile = findFile(files, 'surfaces.css');
  const tokenFile = findFile(files, 'tokens.css');
  if (!surfFile || !tokenFile) return;

  const tokenText = fs.readFileSync(tokenFile, 'utf8');
  const surfText = fs.readFileSync(surfFile, 'utf8');

  // Find all --sf-{surface}-* tokens defined in tokens.css
  // Group by suffix (everything after --sf-{surface}-)
  const suffixesBySurface = {};
  for (const sf of SURFACES) {
    suffixesBySurface[sf] = new Set();
    const regex = new RegExp(`--sf-${sf}-([a-z0-9-]+)\\s*:`, 'g');
    let m;
    while ((m = regex.exec(tokenText)) !== null) {
      suffixesBySurface[sf].add(m[1]);
    }
  }

  // Collect union of all suffixes across surfaces
  const allSuffixes = new Set();
  for (const sf of SURFACES) {
    for (const s of suffixesBySurface[sf]) allSuffixes.add(s);
  }

  // For each suffix, check that every surface defines it in tokens.css
  const tokenLines = readLines(tokenFile);
  for (const suffix of allSuffixes) {
    for (const sf of SURFACES) {
      if (!suffixesBySurface[sf].has(suffix)) {
        add('P0', 'surface-remap', tokenFile, 0, `Surface "${sf}" missing token --sf-${sf}-${suffix} (defined for other surfaces)`);
      }
    }
  }

  // For each suffix defined, check surfaces.css remaps it in the .surface-* class
  // Extract class body by counting braces (handles nested blocks)
  const surfLines = readLines(surfFile);
  for (const sf of SURFACES) {
    const startLine = surfLines.findIndex(l => l.text.includes(`.surface-${sf}`));
    if (startLine === -1) {
      add('P0', 'surface-remap', surfFile, 0, `.surface-${sf} class not found in surfaces.css`);
      continue;
    }
    // Collect body by brace counting
    let depth = 0; let classBody = '';
    for (let i = startLine; i < surfLines.length; i++) {
      const line = surfLines[i].text;
      classBody += line + '\n';
      depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      if (depth === 0 && i > startLine) break;
    }
    for (const suffix of suffixesBySurface[sf]) {
      const remapTok = `--sf-${sf}-${suffix}`;
      if (!classBody.includes(remapTok)) {
        add('P1', 'surface-remap', surfFile, surfLines[startLine].num, `Token ${remapTok} defined but not remapped in .surface-${sf}`);
      }
    }
  }
}

// ── Check 4: Build Verification ─────────────────────────────────────────────

function checkBuild() {
  try {
    execSync('npx vite build', { cwd: ROOT, stdio: 'pipe', timeout: 60000 });
  } catch (err) {
    const output = (err.stderr || err.stdout || '').toString().slice(0, 500);
    add('P0', 'build', 'vite.config.js', 0, `Build failed: ${output.replace(/\n/g, ' ').trim()}`);
  }
}

// ── Check 5: Hardcoded Colors in JSX ────────────────────────────────────────

function checkHardcodedColors(files) {
  const jsxFiles = files.filter(f => f.endsWith('.jsx') && !isDmeFile(f));
  // Matches JSX inline style properties with hardcoded color values
  // Pattern: propertyName: '#hex' or propertyName: 'rgb(...)' etc.
  const inlineColorProp = /(?:color|background|backgroundColor|borderColor|borderTop|borderBottom|borderLeft|borderRight|border|boxShadow|outline)\s*[:=]\s*['"`]?\s*(?:#[0-9a-fA-F]{3,8}\b|rgba?\s*\(|hsla?\s*\()/;
  // CSS-in-JSX property assignment with hex/rgb
  const cssAssignColor = /\.style\.(?:color|background|backgroundColor|borderColor)\s*=\s*['"]#/;

  for (const file of jsxFiles) {
    const lines = readLines(file);
    for (const { num, text } of lines) {
      const trimmed = text.trim();
      // Skip comments and imports
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed.startsWith('import ')) continue;
      // Skip lines that are only var() references
      if (text.includes('var(--') && !/#[0-9a-fA-F]{3,8}/.test(text.replace(/var\(--[^)]+\)/g, ''))) continue;

      if (inlineColorProp.test(text) || cssAssignColor.test(text)) {
        add('P1', 'hardcoded-colors', file, num, `Hardcoded color: ${trimmed.slice(0, 100)}`);
      }
    }
  }
}

// ── Check 6: Hardcoded Z-Index ──────────────────────────────────────────────

function checkHardcodedZIndex(files) {
  const targetFiles = files.filter(f => !isDmeFile(f));

  for (const file of targetFiles) {
    const lines = readLines(file);
    for (const { num, text } of lines) {
      if (text.trim().startsWith('//') || text.trim().startsWith('*')) continue;

      // CSS: z-index: <number>
      const cssMatch = text.match(/z-index\s*:\s*(\d+)/);
      if (cssMatch && !text.includes('var(--z-')) {
        add('P1', 'hardcoded-zindex', file, num, `Hardcoded z-index: ${cssMatch[1]}`);
        continue;
      }
      // JSX: zIndex: <number> or zIndex: '<number>'
      const jsxMatch = text.match(/zIndex\s*:\s*['"]?(\d+)/);
      if (jsxMatch && !text.includes('var(--z-')) {
        add('P1', 'hardcoded-zindex', file, num, `Hardcoded zIndex: ${jsxMatch[1]}`);
      }
    }
  }
}

// ── Check 7: Modal Pattern Compliance ───────────────────────────────────────

function checkModalCompliance(files) {
  const jsxFiles = files.filter(f => f.endsWith('.jsx') && !isDmeFile(f));

  for (const file of jsxFiles) {
    const lines = readLines(file);
    const text = fs.readFileSync(file, 'utf8');

    // Scan for position: 'fixed' in JSX that look modal-like but don't use .overlay
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for position fixed in inline styles (potential overlay)
      if (/position\s*:\s*['"]fixed['"]/.test(line.text)) {
        // Look at surrounding lines for overlay class usage
        const context = lines.slice(Math.max(0, i - 5), Math.min(lines.length, i + 5))
          .map(l => l.text).join(' ');
        if (/backdrop|overlay|modal|inset|z-?[Ii]ndex/i.test(context) &&
            !context.includes('className') &&
            !context.includes('overlay')) {
          add('P1', 'modal-compliance', file, line.num,
            'Inline position:fixed with backdrop behavior — should use .overlay class');
        }
      }
    }

    // Check for modal-like containers without .modal class
    // Pattern: overlay div wrapping a non-.modal div
    const overlayBlocks = text.matchAll(/className="overlay[^"]*"[^>]*>[\s\S]*?<div[^>]*?(?:onClick|className)[^>]*>/g);
    for (const match of overlayBlocks) {
      const inner = match[0];
      // If inner div doesn't use modal, side-panel, bottom-sheet, or popup-panel class
      if (!inner.includes('modal') && !inner.includes('side-panel') &&
          !inner.includes('bottom-sheet') && !inner.includes('popup-panel') &&
          !inner.includes('player-card')) {
        // Find line number
        const idx = text.indexOf(inner);
        const lineNum = text.slice(0, idx).split('\n').length;
        add('P1', 'modal-compliance', file, lineNum,
          'Overlay wraps a div without .modal/.side-panel/.bottom-sheet class');
      }
    }
  }
}

// ── Check 8: Unglobalized Component Patterns ────────────────────────────────

function checkUnglobalizedPatterns(files) {
  const jsxFiles = files.filter(f => f.endsWith('.jsx') && !isDmeFile(f));

  // Track inline style patterns across files
  const searchBarInstances = [];
  const cardInstances = [];
  const dividerInstances = [];

  for (const file of jsxFiles) {
    const lines = readLines(file);
    const text = fs.readFileSync(file, 'utf8');

    for (const { num, text: lineText } of lines) {
      // Search bar pattern: input with placeholder containing "search" and inline styles
      if (/placeholder.*[Ss]earch/i.test(lineText) && !lineText.includes('search-bar')) {
        if (/style\s*=/.test(lineText) || /style\s*=/.test(lines[Math.min(num, lines.length - 1)]?.text || '')) {
          searchBarInstances.push({ file, line: num, text: lineText.trim() });
        }
      }

      // Divider pattern: borderTop/borderBottom with 1px solid
      if (/border(?:Top|Bottom)\s*:\s*['"]1px solid/.test(lineText)) {
        dividerInstances.push({ file, line: num, text: lineText.trim() });
      }
    }

    // Card pattern: repeated borderRadius + padding + background combo in style objects
    const styleBlocks = text.matchAll(/style\s*=\s*\{\{([^}]{20,})\}\}/g);
    for (const match of styleBlocks) {
      const block = match[1];
      if (/borderRadius/.test(block) && /padding/.test(block) && /background/.test(block)) {
        const idx = text.indexOf(match[0]);
        const lineNum = text.slice(0, idx).split('\n').length;
        cardInstances.push({ file, line: lineNum, text: block.trim().slice(0, 80) });
      }
    }
  }

  // Report search bar instances not using global .search-bar
  if (searchBarInstances.length >= 2) {
    for (const inst of searchBarInstances) {
      add('P1', 'unglobalized', inst.file, inst.line,
        `Search input with inline styles — should use .search-bar class`);
    }
  }

  // Report divider patterns
  if (dividerInstances.length >= 3) {
    for (const inst of dividerInstances) {
      add('P2', 'unglobalized', inst.file, inst.line,
        `Inline border divider — consider a utility class`);
    }
  }

  // Report card patterns
  if (cardInstances.length >= 3) {
    for (const inst of cardInstances) {
      add('P2', 'unglobalized', inst.file, inst.line,
        `Card-like inline style (borderRadius+padding+background) — consider a global .card class`);
    }
  }
}

// ── Check 9: Breakpoint Consistency ─────────────────────────────────────────

function checkBreakpoints(files) {
  const CANONICAL = new Set(['480px', '768px', '1024px', '1280px']);
  const cssFiles = files.filter(f => f.endsWith('.css'));
  const seen = new Map(); // value → [{file, line}]

  for (const file of cssFiles) {
    const lines = readLines(file);
    for (const { num, text } of lines) {
      const m = text.match(/@media\s*.*?(?:max|min)-width\s*:\s*(\d+px)/);
      if (m) {
        const bp = m[1];
        if (!seen.has(bp)) seen.set(bp, []);
        seen.get(bp).push({ file, line: num });
      }
    }
  }

  for (const [bp, locations] of seen) {
    if (!CANONICAL.has(bp)) {
      for (const loc of locations) {
        add('P2', 'breakpoints', loc.file, loc.line,
          `Non-canonical breakpoint ${bp} (canonical: 480/768/1024/1280px)`);
      }
    }
  }
}

// ── Check 10: Duplicate CSS Declarations ────────────────────────────────────

function checkDuplicateCSS(files) {
  const cssFiles = files.filter(f => f.endsWith('.css'));

  for (const file of cssFiles) {
    const lines = readLines(file);
    // Parse property: value pairs with their selectors
    const decls = new Map(); // "property:value" → [lineNum]
    let currentSelector = '';
    let braceDepth = 0;

    for (const { num, text } of lines) {
      const trimmed = text.trim();

      // Track selector context
      if (trimmed.includes('{')) {
        braceDepth += (trimmed.match(/\{/g) || []).length;
        if (braceDepth === 1) {
          currentSelector = trimmed.replace(/\s*\{.*/, '');
        }
      }
      if (trimmed.includes('}')) {
        braceDepth -= (trimmed.match(/\}/g) || []).length;
      }

      // Skip variable definitions, comments, selectors
      if (trimmed.startsWith('--') || trimmed.startsWith('/*') || trimmed.startsWith('*') ||
          trimmed.startsWith('//') || trimmed.includes('{') || trimmed.includes('}') ||
          trimmed.startsWith('@')) continue;

      // Match property: value declarations
      const declMatch = trimmed.match(/^([a-z-]+)\s*:\s*(.+?)\s*;?\s*$/);
      if (declMatch) {
        const prop = declMatch[1];
        const val = declMatch[2].replace(/\s+/g, ' ').replace(/;$/, '');
        // Skip trivial/structural props that naturally repeat
        const trivialProps = ['display', 'position', 'box-sizing', 'overflow', 'cursor',
          'text-decoration', 'list-style', 'border', 'outline', 'margin', 'padding',
          'appearance', 'resize', 'white-space', 'text-align', 'font-weight',
          'flex-direction', 'align-items', 'justify-content', 'flex-shrink', 'flex-wrap'];
        if (trivialProps.includes(prop)) continue;
        // Skip if value is just a var() reference (intentional design token usage)
        if (/^var\(--/.test(val)) continue;
        const key = `${prop}:${val}`;
        if (!decls.has(key)) decls.set(key, []);
        decls.get(key).push(num);
      }
    }

    // Report declarations appearing 5+ times
    for (const [decl, lineNums] of decls) {
      if (lineNums.length >= 5) {
        const sample = lineNums.length > 6 ? lineNums.slice(0, 6).join(', ') + '...' : lineNums.join(', ');
        add('P2', 'duplicate-css', file, lineNums[0],
          `"${decl}" repeated ${lineNums.length}x (lines: ${sample}) — consider consolidation`);
      }
    }
  }
}

// ── Report ──────────────────────────────────────────────────────────────────

function report() {
  const grouped = { P0: [], P1: [], P2: [] };
  findings.forEach(f => grouped[f.severity].push(f));

  console.log('\n╔══════════════════════════════════╗');
  console.log('║      IDP AUDIT REPORT            ║');
  console.log('╚══════════════════════════════════╝\n');

  for (const sev of ['P0', 'P1', 'P2']) {
    if (grouped[sev].length === 0) continue;
    const label = sev === 'P0' ? 'CRITICAL' : sev === 'P1' ? 'IMPORTANT' : 'ADVISORY';
    console.log(`\n── ${sev} ${label} (${grouped[sev].length} findings) ${'─'.repeat(40)}\n`);

    // Group by check within severity
    const byCheck = {};
    for (const f of grouped[sev]) {
      if (!byCheck[f.check]) byCheck[f.check] = [];
      byCheck[f.check].push(f);
    }

    for (const [check, items] of Object.entries(byCheck)) {
      console.log(`  [${check}] (${items.length})`);
      for (const f of items) {
        console.log(`    ${f.file}:${f.line} — ${f.message}`);
      }
      console.log();
    }
  }

  const total = findings.length;
  console.log(`${'─'.repeat(60)}`);
  console.log(`Total: ${total} findings  |  P0: ${grouped.P0.length}  |  P1: ${grouped.P1.length}  |  P2: ${grouped.P2.length}`);
  console.log();

  if (grouped.P0.length > 0) {
    console.log('⛔ P0 critical issues found — exit code 1');
    process.exit(1);
  } else {
    console.log('✓ No P0 critical issues');
    process.exit(0);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

console.log('Scanning', SRC, '...\n');
const files = globFiles(SRC, ['.css', '.jsx']);
console.log(`Found ${files.length} files (${files.filter(f=>f.endsWith('.css')).length} CSS, ${files.filter(f=>f.endsWith('.jsx')).length} JSX)\n`);

const checks = [
  ['Button Variant Wiring', () => checkButtonWiring(files)],
  ['Token Definition Completeness', () => checkTokenDefinitions(files)],
  ['Surface Remapping Completeness', () => checkSurfaceRemapping(files)],
  ['Build Verification', () => checkBuild()],
  ['Hardcoded Colors in JSX', () => checkHardcodedColors(files)],
  ['Hardcoded Z-Index', () => checkHardcodedZIndex(files)],
  ['Modal Pattern Compliance', () => checkModalCompliance(files)],
  ['Unglobalized Patterns', () => checkUnglobalizedPatterns(files)],
  ['Breakpoint Consistency', () => checkBreakpoints(files)],
  ['Duplicate CSS Declarations', () => checkDuplicateCSS(files)],
];

for (const [name, fn] of checks) {
  const before = findings.length;
  process.stdout.write(`  Running: ${name}...`);
  try {
    fn();
  } catch (err) {
    add('P0', name.toLowerCase().replace(/\s+/g, '-'), 'scripts/audit.js', 0, `Check crashed: ${err.message}`);
  }
  const found = findings.length - before;
  console.log(` ${found} findings`);
}

report();
