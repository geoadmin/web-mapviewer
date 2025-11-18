// update-pnpm-workspace.ts
// Requires: Node 18+ (global fetch) and `yaml` package
// Install: pnpm add -D yaml
//
// Usage:
//   node scripts/update-pnpm-workspace.ts pnpm-workspace.yaml [--dry-run] [--same-major]
//       [--registry <url>] [--tag <dist-tag>] [--concurrency <n>]
//
// Example:
//   node scripts/update-pnpm-workspace.ts pnpm-workspace.yaml --dry-run
//   node scripts/update-pnpm-workspace.ts pnpm-workspace.yaml --same-major
//   node scripts/update-pnpm-workspace.ts pnpm-workspace.yaml --registry https://registry.npmjs.org --tag latest

import { readFileSync, writeFileSync } from 'node:fs'
import { basename } from 'node:path'
import YAML from 'yaml'
import type { Document } from 'yaml'

interface Args {
    file: string
    dryRun: boolean
    sameMajor: boolean
    registry: string
    tag: string
    concurrency: number
}

interface SemverParsed {
    major: number
    minor: number
    patch: number
    pre: string
}

interface PackageUpdate {
    name: string
    from: string
    to: string
    base: string | null
    target: string
}

interface PackageMeta {
    'dist-tags'?: Record<string, string>
    versions?: Record<string, unknown>
}

interface YAMLCatalogNode {
    items?: Array<{ key: { value: string }; value: { value: string } }>
    set?: (name: string, value: string) => void
}

function parseArgs(argv: string[]): Args {
    const args: Args = {
        file: 'pnpm-workspace.yaml',
        dryRun: false,
        sameMajor: false,
        registry: 'https://registry.npmjs.org',
        tag: 'latest',
        concurrency: 8,
    }
    const positional: string[] = []
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i]
        if (a === '--dry-run') {
            args.dryRun = true
        } else if (a === '--same-major') {
            args.sameMajor = true
        } else if (a === '--registry') {
            args.registry = argv[++i]!
        } else if (a === '--tag') {
            args.tag = argv[++i]!
        } else if (a === '--concurrency') {
            args.concurrency = Number(argv[++i]) || args.concurrency
        } else if (!a.startsWith('-')) {
            positional.push(a)
        }
    }
    if (positional[0]) {
        args.file = positional[0]
    }
    return args
}

function loadYamlDocument(file: string): Document.Parsed {
    const text = readFileSync(file, 'utf8')
    return YAML.parseDocument(text)
}

function getCatalog(doc: Document.Parsed): YAMLCatalogNode | null {
    if (!doc.has('catalog')) {
        return null
    }
    return doc.get('catalog') as YAMLCatalogNode
}

function setCatalogEntry(
    doc: Document.Parsed,
    catalogNode: YAMLCatalogNode | null,
    name: string,
    value: string
): void {
    if (catalogNode && catalogNode.set) {
        catalogNode.set(name, value)
    } else {
        doc.set('catalog', { ...(catalogNode || {}), [name]: value })
    }
}

function extractPrefix(spec: string): string {
    // Preserve ^ or ~ if present; otherwise empty (exact)
    const m = spec.match(/^\s*([\^~])/)
    return m ? m[1] : ''
}

function extractBaseVersion(spec: string): string | null {
    // Pull the first x.y.z-like token; best-effort
    const m = spec.match(/(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/)
    return m ? m[1] : null
}

function parseSemver(v: string): SemverParsed | null {
    // Naive semver parser: returns {major, minor, patch, pre} or null
    if (!v) {
        return null
    }
    const m = v.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/)
    if (!m) {
        return null
    }
    return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]), pre: m[4] || '' }
}

function cmpSemver(a: SemverParsed | null, b: SemverParsed | null): number {
    // Compare only numeric parts; treats prereleases as smaller than stable
    if (!a || !b) {
        return 0
    }
    if (a.major !== b.major) {
        return a.major - b.major
    }
    if (a.minor !== b.minor) {
        return a.minor - b.minor
    }
    if (a.patch !== b.patch) {
        return a.patch - b.patch
    }
    // Stable > prerelease
    const aPre = a.pre ? 1 : 0
    const bPre = b.pre ? 1 : 0
    return aPre - bPre
}

function pickHighest(versions: string[]): string | null {
    // Choose highest stable; if none, highest including prerelease
    const parsed = versions.map((v) => ({ v, p: parseSemver(v) })).filter((x) => x.p)
    if (parsed.length === 0) {
        return null
    }
    const stable = parsed.filter((x) => !x.p!.pre)
    const set = (stable.length ? stable : parsed).sort((x, y) => cmpSemver(x.p, y.p))
    return set[set.length - 1]!.v
}

async function fetchPackageMeta(registry: string, pkg: string): Promise<PackageMeta> {
    const url = `${registry.replace(/\/+$/, '')}/${encodeURIComponent(pkg)}`
    const res = await fetch(url, { redirect: 'follow' })
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }
    return res.json() as Promise<PackageMeta>
}

function shouldSkipSpec(spec: string): boolean {
    // Skip non-registry specs
    return /^(workspace:|file:|link:|git\+|github:|bitbucket:|gitlab:)/.test(spec)
}

function sameMajorTarget(base: string, allVersions: string[]): string | null {
    const baseParsed = parseSemver(base)
    if (!baseParsed) {
        return null
    }
    const same = allVersions.filter((v) => parseSemver(v)?.major === baseParsed.major)
    if (same.length === 0) {
        return null
    }
    return pickHighest(same)
}

async function main(): Promise<void> {
    const args = parseArgs(process.argv)
    const doc = loadYamlDocument(args.file)
    const catalog = getCatalog(doc)

    if (!catalog) {
        console.error('No "catalog" section found in the workspace file.')
        process.exit(1)
    }
    const entries: Array<[string, string]> = catalog.items
        ? catalog.items.map((i) => [i.key.value, i.value.value])
        : Object.entries(catalog)

    console.log(
        `Checking ${entries.length} catalog packages against ${args.registry} (tag: ${args.tag})...`
    )
    const updates: PackageUpdate[] = []

    let i = 0
    async function worker(): Promise<void> {
        while (i < entries.length) {
            const idx = i++
            const [name, specRaw] = entries[idx]!
            const spec = String(specRaw).trim()

            if (shouldSkipSpec(spec)) {
                // Not a registry spec; skip
                continue
            }

            try {
                const meta = await fetchPackageMeta(args.registry, name)
                const distTags = meta['dist-tags'] || {}
                const versions = meta.versions ? Object.keys(meta.versions) : []

                let target = distTags[args.tag]
                if (!target) {
                    // Fallback to highest version available
                    target = pickHighest(versions)
                }
                if (!target) {
                    console.warn(`No versions found for ${name}; skipping`)
                    continue
                }

                const prefix = extractPrefix(spec)
                const base = extractBaseVersion(spec)

                // Enforce same-major if requested
                if (args.sameMajor && base) {
                    const candidate = sameMajorTarget(base, versions)
                    if (candidate) {
                        target = candidate
                    } else {
                        // No version in same major; skip updating this package
                        continue
                    }
                }

                // Only update if target differs from base version
                if (!base || base !== target) {
                    updates.push({
                        name,
                        from: spec,
                        to: `${prefix}${target}`,
                        base,
                        target,
                    })
                }
            } catch (e) {
                const error = e as Error
                console.error(`Error fetching ${name}: ${error.message}`)
            }
        }
    }

    // Run in parallel
    const workers = Array.from({ length: Math.max(1, args.concurrency) }, () => worker())
    await Promise.all(workers)

    // Apply updates
    updates.sort((a, b) => a.name.localeCompare(b.name))
    if (updates.length === 0) {
        console.log('No catalog changes needed.')
        return
    }

    console.log('\nPlanned updates:')
    for (const u of updates) {
        console.log(`- ${u.name}: ${u.from} -> ${u.to}`)
    }

    if (args.dryRun) {
        console.log('\nDry run: no changes written.')
        return
    }

    // Write back
    for (const u of updates) {
        setCatalogEntry(doc, catalog, u.name, u.to)
    }
    writeFileSync(args.file, String(doc), 'utf8')
    console.log(`\nUpdated ${basename(args.file)} with ${updates.length} changes.`)
    console.log('\nPlease run `pnpm install` to update the lockfile.\n')
}

main().catch((err: Error) => {
    console.error(err)
    process.exit(1)
})
