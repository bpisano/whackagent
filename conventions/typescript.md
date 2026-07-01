# Conventions — TypeScript

Base template copied into `.whackagent/conventions/` by `/wa-setup`. Edit **Toggles** block per project. `wa-implementer` writes against these rules; each category `wa-reviewer` checks them.

## Toggles

```yaml
public_doc: true          # TSDoc on every exported symbol
comment_discipline: true  # comments only explain non-obvious "why"
strict_types: true        # no `any`; prefer `unknown` + narrowing
no_default_export: true   # named exports only
```

## Review checklist

1. **Public documentation** (`public_doc`) — every exported function/type/const carries `/** TSDoc */`.
2. **Comment discipline** (`comment_discipline`) — no comment restates code; only non-obvious *why*.
3. **Strict types** (`strict_types`) — no `any`; use `unknown` + narrowing, discriminated unions, `as const`. No non-null `!` unless justified.
4. **Idiomatic** — `const` over `let`, immutability, `map`/`filter`/`reduce`, optional chaining / nullish coalescing, early return.
5. **Modules** (`no_default_export`) — named exports; one main concept per file.
6. **Async** — `async`/`await`, never floating promises; handle rejections.
7. **Testing** — colocated `*.test.ts`, one `describe` per unit, clear test names.

## Architecture (review category: architecture)

- **Group by feature/domain, not by type.** No god `utils/`, `types/`, `services/` buckets holding everything.
- **No flat tree.** Large folders get sub-folders; nest as area grows.
- **Clear module boundaries**, one-directional dependencies, no cycles.
- **Barrel/`index.ts`** only at intentional public boundaries, not everywhere.

## Build proof

Implementer must show typecheck + tests passing (`tsc --noEmit`, then project's test runner) before reporting done.