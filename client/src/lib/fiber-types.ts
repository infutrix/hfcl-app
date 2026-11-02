/** Fiber types offered when opening a testing session (from HFCL's "Fiber Type" sheet). */
export const FIBER_TYPE_GROUPS = [
  {
    label: "Single Mode",
    types: [
      "G.657A1",
      "G.657A1 200",
      "G.657A1 250",
      "G.657A1 190",
      "G.657A2",
      "G.657A2 190",
      "G.657A2 200",
      "G.657A2 250",
      "G.657B1",
      "G.657B2",
      "G.652 D",
      "G.655",
      "G.652B",
      "G.655E",
    ],
  },
  {
    label: "Multi Mode",
    types: ["OM1", "OM2", "OM3", "OM4", "OM5"],
  },
] as const

const KNOWN_FIBER_TYPES = new Set<string>(FIBER_TYPE_GROUPS.flatMap((g) => g.types))

export function isKnownFiberType(value: string): boolean {
  return KNOWN_FIBER_TYPES.has(value)
}
