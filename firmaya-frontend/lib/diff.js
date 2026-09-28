// Comparación de versiones por palabras (CU-12).
// Devuelve los segmentos para la columna A (texto eliminado) y la columna B (texto añadido),
// agrupando cada bloque contiguo de diferencias como un "cambio" navegable.

function tokenize(text) {
  return (text || "").split(/(\s+)/).filter((t) => t !== "");
}

function diffTokens(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: "equal", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "del", text: a[i++] });
    } else {
      ops.push({ type: "add", text: b[j++] });
    }
  }
  while (i < n) ops.push({ type: "del", text: a[i++] });
  while (j < m) ops.push({ type: "add", text: b[j++] });
  return ops;
}

export function compareTexts(textA, textB) {
  const ops = diffTokens(tokenize(textA), tokenize(textB));
  const left = [];
  const right = [];
  let changes = 0;
  let inChange = false;

  for (const op of ops) {
    if (op.type === "equal") {
      // Los espacios entre dos tramos modificados no cortan el cambio.
      if (inChange && /^\s+$/.test(op.text)) {
        left.push({ type: "equal", text: op.text });
        right.push({ type: "equal", text: op.text });
        continue;
      }
      inChange = false;
      left.push({ type: "equal", text: op.text });
      right.push({ type: "equal", text: op.text });
      continue;
    }
    if (!inChange) {
      inChange = true;
      changes++;
    }
    const segment = { type: op.type, text: op.text, change: changes - 1 };
    if (op.type === "del") left.push(segment);
    else right.push(segment);
  }

  return { left: merge(left), right: merge(right), changes };
}

function merge(segments) {
  const out = [];
  for (const s of segments) {
    const last = out[out.length - 1];
    if (last && last.type === s.type && last.change === s.change) last.text += s.text;
    else out.push({ ...s });
  }
  return out;
}
