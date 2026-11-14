export type GravityRegime = 'microgravity' | 'partial-g' | 'normal-g';
export type FuelType = 'solid' | 'gas' | 'liquid' | 'droplet' | 'dust' | 'cool-flame';
export type Facility = 'ISS-CIR' | 'ISS-MSG' | 'ISS-other' | 'Free-flyer' |
  'Drop-tower' | 'Parabolic-flight' | 'Sounding-rocket' | 'Ground';
export type Confidence = 'verified' | 'curated' | 'illustrative';
export type Severity = 'info' | 'caution' | 'high' | 'critical';
export type ScenarioId = 'iss' | 'lunar' | 'mars' | 'eva' | 'custom';
export interface Source { title: string; url?: string; org: string; year?: number }
export interface Finding { id: string; text: string; tags: string[] }
export interface Metric { key: string; label: string; unit: string;
  value: number | null; note?: string }
export interface Conditions { gravityG: number; o2Percent: number | null;
  diluent: string; pressureKPa: number | null; flowCmPerS: number | null }
export interface Experiment {
  id: string;                       // kebab-case, e.g. "saffire-iv"
  name: string; acronym: string; summary: string;
  facility: Facility; regime: GravityRegime;
  years: [number, number | null];
  fuelType: FuelType; fuel: string;
  conditions: Conditions; metrics: Metric[]; findings: Finding[];
  safetyTakeaway: string;           // one plain-language sentence
  sources: Source[]; confidence: Confidence; tags: string[];
}
export interface Scenario { id: ScenarioId; label: string; gravityG: number;
  o2Percent: number; pressureKPa: number; description: string;
  assumption: boolean }             // true = value is an assumption to verify
export interface ScoreWeights { hazardSeverity: number; exploration: number;
  evidence: number; recency: number }          // each 0..1
export interface RankedExperiment { experiment: Experiment;
  scores: { hazardSeverity: number; exploration: number; evidence: number;
    recency: number };                          // each 0..100
  composite: number; rationale: string }
export interface Insight { id: string; title: string; summary: string;
  severity: Severity; scenarios: ScenarioId[]; evidenceIds: string[];
  confidence: number; recommendation: string }
export interface Material { id: string; name: string;
  category: 'textile' | 'polymer' | 'foam' | 'paper' | 'composite' |
    'liquid-fuel' | 'gas'; usedFor: string; evidenceIds: string[];
  baseFlammability: number;         // 0..100 qualitative index
  notes: string }
export interface MaterialRisk { materialId: string; scenarioId: ScenarioId;
  risk: number; level: Severity; rationale: string; evidenceIds: string[] }
export interface GlossaryTerm { id: string; term: string; plain: string;
  technical: string; related: string[] }
export interface TimelineEvent { year: number; title: string; summary: string;
  experimentIds: string[]; milestone: boolean }
export interface CoverageCell { gravityBand: string; o2Band: string;
  count: number; experimentIds: string[]; gap: boolean;
  relevantScenarios: ScenarioId[] }
export interface SimInput { materialId: string; gravityG: number;
  o2Percent: number; pressureKPa: number; flowCmPerS: number }
export interface SimDriver { factor: string; direction: 'raises' | 'lowers';
  weight: number; explanation: string; evidenceIds: string[] }
export interface SimResult { risk: number; level: Severity; drivers: SimDriver[];
  nearestExperimentIds: string[]; caveats: string[] }
export interface PlaybookStep { phase: 'detect' | 'isolate' | 'suppress' |
  'ventilate' | 'recover'; action: string; rationale: string;
  evidenceIds: string[] }
export interface Playbook { scenarioId: ScenarioId; steps: PlaybookStep[];
  caveats: string[] }
export interface SIRequest { mode: 'summarize' | 'compare' | 'interpret' |
  'ask' | 'brief' | 'playbook'; experimentIds: string[]; scenario: Scenario;
  question?: string; context?: string }
export interface SIResponse { answerMarkdown: string; citations: string[];
  model: string; fallback: boolean; groundingScore: number;
  invalidCitationsRemoved: number }
