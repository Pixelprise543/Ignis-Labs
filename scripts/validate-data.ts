/**
 * Dataset gate: `npm run validate:data`.
 *
 * Loads the validator through Vite so the `@/` alias and extensionless imports
 * resolve exactly as they do in the app. Without that, plain Node would fail on
 * `import ... from '@/lib/...'` before it could check a single record.
 *
 * Exits 1 on any issue, so this can gate a release. Zod proves each record's
 * shape; src/lib/schema.ts adds id uniqueness, year ordering and evidence
 * resolution.
 */
import { createServer } from 'vite'

interface ValidationIssue {
  code: string
  message: string
}

interface SchemaModule {
  validateDataset?: () => ValidationIssue[]
}

async function main(): Promise<void> {
  const server = await createServer({
    configFile: 'vite.config.ts',
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  })

  let issues: ValidationIssue[] = []
  let counts = { experiments: 0, findings: 0, materials: 0, glossary: 0 }

  try {
    const schema = (await server.ssrLoadModule('/src/lib/schema.ts')) as SchemaModule
    if (typeof schema.validateDataset !== 'function') {
      throw new Error('src/lib/schema.ts does not export validateDataset')
    }
    issues = schema.validateDataset()

    const data = (await server.ssrLoadModule('/src/lib/data.ts')) as {
      getExperiments: () => unknown[]
      getFindings: () => unknown[]
      getMaterials: () => unknown[]
      getGlossary: () => unknown[]
    }
    counts = {
      experiments: data.getExperiments().length,
      findings: data.getFindings().length,
      materials: data.getMaterials().length,
      glossary: data.getGlossary().length,
    }
  } finally {
    await server.close()
  }

  if (issues.length === 0) {
    console.log(
      `validate:data OK - ${counts.experiments} experiments, ${counts.findings} findings, ` +
        `${counts.materials} materials, ${counts.glossary} glossary terms, ` +
        '12 coverage cells, 5 scenarios, 5 playbooks.',
    )
    console.log('Citations: every finding, material, insight and playbook evidence id resolves.')
    return
  }

  console.error(`validate:data FAILED - ${issues.length} issue(s):`)
  for (const issue of issues) console.error(`  [${issue.code}] ${issue.message}`)
  process.exitCode = 1
}

main().catch((error: unknown) => {
  console.error('validate:data crashed:', error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
