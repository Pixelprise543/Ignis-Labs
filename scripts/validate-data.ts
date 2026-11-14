/**
 * Dataset gate: `npm run validate:data`.
 *
 * Implemented fully in the P2 tier (tier M). It will fail the build when an
 * experiment is missing sources, uses a non-kebab-case id, or when an insight,
 * material risk or playbook step cites an evidence id that does not exist.
 *
 * Until the datasets land, keep the command honest: say what is not checked yet
 * instead of printing a green tick that means nothing.
 */
const notYetChecked = [
  'experiment sources and confidence levels',
  'kebab-case experiment ids',
  'dangling evidenceIds in insights, materials, playbook',
]

console.log('validate:data - datasets not committed yet (P0 deliverable B).')
console.log('Not checked yet (arriving in tier M):')
for (const item of notYetChecked) console.log(`  - ${item}`)
process.exit(0)
