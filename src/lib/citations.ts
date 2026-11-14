import { getExperiment, getFinding } from '@/lib/data'

/**
 * Citation auditing for model output.
 *
 * A language model writing about this dataset is allowed to say anything, so the
 * only thing the app trusts is the bracketed citation. This module scans the
 * markdown, keeps a citation when it resolves to a real experiment (or to a
 * finding that belongs to one), and strips the brackets when it does not. The
 * stripped text is left in place so the reader can see the sentence the model
 * tried to ground and the fact that it could not.
 *
 * `groundingScore` is the share of citation attempts that survived. An answer
 * with no citations at all scores 0: fluent prose is not evidence.
 */

const CITATION = /\[([^[\]\n]+)\](?!\()/g

export interface CitationAudit {
  markdown: string
  citations: string[]
  invalidCitationsRemoved: number
  groundingScore: number
}

export function auditCitations(markdown: string): CitationAudit {
  const citations: string[] = []
  const seen = new Set<string>()
  let valid = 0
  let invalid = 0

  const add = (experimentId: string) => {
    if (seen.has(experimentId)) return
    seen.add(experimentId)
    citations.push(experimentId)
  }

  const audited = markdown.replace(CITATION, (match, rawToken: string) => {
    const token = rawToken.trim()
    if (token === '') return match

    // A bare URL in brackets is a link the model wrote, not a citation.
    if (/^https?:\/\//i.test(token)) return match

    const key = token.toLowerCase()

    if (getExperiment(key)) {
      valid += 1
      add(key)
      return match
    }

    const finding = getFinding(key)
    if (finding) {
      valid += 1
      add(finding.experiment.id)
      return match
    }

    invalid += 1
    return token
  })

  const attempts = valid + invalid
  return {
    markdown: audited,
    citations,
    invalidCitationsRemoved: invalid,
    groundingScore: attempts === 0 ? 0 : Math.round((valid / attempts) * 100) / 100,
  }
}
