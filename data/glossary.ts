import type { GlossaryTerm } from '@/contracts/types'

/**
 * Plain-language and technical definitions for every term the UI is allowed to
 * use without explaining it inline.
 *
 * `plain` is written for someone who has never taken a combustion course and is
 * deliberately analogy-first. `technical` is the version an engineer would accept.
 * Neither is allowed to be vague ("the way fire works"); both have to say
 * something falsifiable.
 */
export const GLOSSARY: GlossaryTerm[] = [
  {
    id: 'microgravity',
    term: 'Microgravity',
    plain:
      'Falling so freely that everything inside the vehicle seems to float. It is not zero gravity - the station still feels about a millionth of Earth\'s pull - but buoyancy stops working, so hot air no longer rises.',
    technical:
      'A free-fall environment where the residual acceleration is small enough that buoyant forces are negligible compared with forced convection and surface tension. The ISS sits near 1e-6 g; this dataset stores the idealised value as 0 g.',
    related: ['buoyancy', 'forced-convection', 'partial-gravity'],
  },
  {
    id: 'partial-gravity',
    term: 'Partial gravity',
    plain:
      'Gravity that is weaker than Earth\'s but still present, such as the Moon\'s one-sixth g or Mars\'s three-eighths g. Flames there are neither the ones you see on Earth nor the ones seen on the station.',
    technical:
      'Acceleration between microgravity and normal gravity, typically 0.01-0.9 g. Buoyancy is weakened but not gone, so a flame has an asymmetric, rounded shape whose behaviour cannot be interpolated from either end of the range.',
    related: ['microgravity', 'buoyancy'],
  },
  {
    id: 'buoyancy',
    term: 'Buoyancy',
    plain:
      'Why hot air rises. A flame heats the air around it, that air becomes lighter than the cold air above, and it floats upward, dragging fresh oxygen into the fire.',
    technical:
      'The pressure-gradient force on a fluid parcel of differing density. In a flame it produces the plume that controls oxidiser entrainment at normal gravity and vanishes in free fall.',
    related: ['microgravity', 'forced-convection'],
  },
  {
    id: 'forced-convection',
    term: 'Forced convection',
    plain:
      'Moving air with a fan instead of letting it rise on its own. In space this is the only way to bring fresh oxygen to a fire and carry smoke away.',
    technical:
      'Mass transport driven by an imposed pressure gradient rather than by buoyancy. In spacecraft cabins the ventilation flow field is the dominant control on flame spread and detector response.',
    related: ['buoyancy', 'residence-time'],
  },
  {
    id: 'residence-time',
    term: 'Residence time',
    plain:
      'How long a packet of air hangs around near the fuel before it moves on. Longer contact lets the fuel pick up more oxygen and burn faster.',
    technical:
      'The characteristic time a fluid element spends in the reaction zone, set by flow speed and geometry. When buoyancy is absent it becomes a first-order parameter for flame spread over a surface.',
    related: ['forced-convection', 'flame-spread'],
  },
  {
    id: 'flame-spread',
    term: 'Flame spread',
    plain:
      'How a fire crawls across a surface, from the burning part into new material. On Earth it usually creeps upward because the flame preheats the fuel above it; in space it follows the airflow instead.',
    technical:
      'The propagation of a reaction front across a condensed-phase fuel, controlled by heat feedback from the flame to unburned fuel and by oxidiser transport. Direction and rate change with gravity and flow.',
    related: ['residence-time', 'extinction'],
  },
  {
    id: 'extinction',
    term: 'Extinction',
    plain:
      'The flame going out. It can happen because the fuel runs out, because too much heat is lost, or because the airflow or oxygen drops below what the reaction needs.',
    technical:
      'Cessation of sustained combustion when the reaction can no longer generate enough heat to ignite fresh reactants, whether through fuel depletion, strain, radiative loss or oxidiser dilution.',
    related: ['flammability-limit', 'radiative-extinction', 'suppression'],
  },
  {
    id: 'flammability-limit',
    term: 'Flammability limit',
    plain:
      'The edge of the range where a material will keep burning. Below or above that range it can be lit but will not sustain a flame.',
    technical:
      'The boundary condition - in oxygen concentration, pressure, strain rate or flow speed - separating sustained combustion from extinction for a given fuel and geometry.',
    related: ['extinction', 'extinction-limit', 'oxygen-enriched-atmosphere'],
  },
  {
    id: 'extinction-limit',
    term: 'Extinction limit',
    plain:
      'The specific point where a flame gives up: the lowest oxygen level, the lowest pressure, or the fastest airflow that still allows burning.',
    technical:
      'The measured value of a controlling parameter at which the flame quenches. Near this limit small changes flip the outcome, so a single flammability rating hides the operating margin.',
    related: ['flammability-limit', 'extinction'],
  },
  {
    id: 'oxygen-enriched-atmosphere',
    term: 'Oxygen-enriched atmosphere',
    plain:
      'Air with more oxygen than the 21 percent we breathe. Everything that burns does so more easily, and materials that are safe in normal air can become a fire risk.',
    technical:
      'An atmosphere with an oxygen fraction above that of sea-level air. It lowers ignition energy and raises flame temperature and spread rate, and it changes the outcome of standard material flammability screening.',
    related: ['flammability-limit', 'partial-pressure'],
  },
  {
    id: 'partial-pressure',
    term: 'Partial pressure of oxygen',
    plain:
      'How much of the air pressure comes from oxygen alone. A suit can be at a third of sea-level pressure and still deliver plenty of oxygen if the air is pure oxygen.',
    technical:
      'The contribution of oxygen to total gas pressure. Physiological sufficiency depends on oxygen partial pressure, not total pressure, which is why a 29.6 kPa pure-oxygen suit is breathable while a 29.6 kPa air mix would not be.',
    related: ['oxygen-enriched-atmosphere', 'microgravity'],
  },
  {
    id: 'cool-flame',
    term: 'Cool flame',
    plain:
      'A reaction that keeps going with no visible flame and very little heat. The fuel is still being consumed, so a fire that looks out can come back.',
    technical:
      'Low-temperature oxidation occurring below the visible-flame threshold, driven by degenerate chain branching. It can sustain fuel consumption and later transition to hot ignition.',
    related: ['extinction', 'smouldering'],
  },
  {
    id: 'smouldering',
    term: 'Smouldering',
    plain:
      'Burning without flames, like a cigarette or a charred log. It is slow, produces a lot of smoke, and can turn into a flaming fire later.',
    technical:
      'Heterogeneous surface oxidation of a porous fuel with no gas-phase flame, propagating at low temperature and releasing combustion products and aerosols.',
    related: ['cool-flame', 'soot'],
  },
  {
    id: 'soot',
    term: 'Soot',
    plain:
      'The black particles that make smoke dark. They are what a smoke detector sees and what makes smoke toxic, so being able to predict soot is central to fire safety.',
    technical:
      'Carbonaceous particulate formed in fuel-rich regions of a flame through precursor growth and coagulation. Its volume fraction sets smoke opacity and radiative heat loss.',
    related: ['smouldering', 'heat-release-rate'],
  },
  {
    id: 'heat-release-rate',
    term: 'Heat release rate',
    plain:
      'How much energy the fire is putting out per second - the single best number for saying how dangerous a fire is.',
    technical:
      'The rate of thermal energy liberated by combustion, usually in watts or kilowatts. It drives temperature rise, smoke production and the time to flashover.',
    related: ['soot', 'extinction'],
  },
  {
    id: 'suppression',
    term: 'Suppression',
    plain:
      'Putting the fire out on purpose, with an agent or by cutting the air. In space the agent has to be pushed into the flame, because nothing falls into it.',
    technical:
      'Interruption of the combustion reaction by chemical inhibition, oxygen displacement, or heat removal. In microgravity, agent transport must be forced rather than buoyancy-driven.',
    related: ['extinction', 'flammability-limit'],
  },
  {
    id: 'radiative-extinction',
    term: 'Radiative extinction',
    plain:
      'A flame going out because it radiates its heat away faster than it makes it. It is a small effect on Earth and a decisive one in space, where a flame can be a glowing ball with no plume to recycle heat.',
    technical:
      'Quenching caused by radiative heat loss exceeding heat generation, significant for weakly burning microgravity flames where soot radiation can dominate the energy balance.',
    related: ['extinction', 'soot'],
  },
  {
    id: 'drop-tower',
    term: 'Drop tower',
    plain:
      'A tall tower where an experiment is dropped in a vacuum capsule so it floats for a few seconds. It is the cheap way to test an idea before spending a flight slot.',
    technical:
      'A ground facility producing free fall for a fixed duration by releasing a drag-shielded capsule in an evacuated shaft. Glenn\'s 2.2-second tower and 5.18-second facility are the reference combustion test beds.',
    related: ['microgravity'],
  },
  {
    id: 'combustion-integrated-rack',
    term: 'Combustion Integrated Rack',
    plain:
      'The station\'s fire laboratory: a rack with a 100-litre chamber where experiments can burn safely without threatening the crew.',
    technical:
      'A ISS facility in the Destiny laboratory containing a 100 L combustion chamber, gas and flow control, and diagnostics. Launched on STS-126 in November 2008; hosts FLEX, ACME, SoFIE and related investigations.',
    related: ['microgravity', 'sofi'],
  },
  {
    id: 'sofi',
    term: 'SoFIE',
    plain:
      'The current station facility for asking whether spacecraft materials will burn, and how hard they are to put out, in reduced gravity.',
    technical:
      'Solid Fuel Ignition and Extinction: five investigations in the Combustion Integrated Rack (RTDFS, NCA, GEL, MIST, SMuRF) studying solid-material flammability, extinction limits and suppression.',
    related: ['combustion-integrated-rack', 'flammability-limit'],
  },
  {
    id: 'sibal',
    term: 'SIBAL',
    plain:
      'The fabric sample used in the Saffire burns: a mix of cotton and fiberglass, close to what stowage bags and covers are made from.',
    technical:
      'A cotton-fiberglass blend developed as a representative spacecraft solid fuel; used at 0.4 m by 1 m scale in Saffire-I and as one of four materials in Saffire-VI.',
    related: ['soot', 'flammability-limit'],
  },
]
