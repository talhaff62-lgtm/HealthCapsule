// Module-level store for the most recently added facility,
// so the doctor form can prefill the linked facility.
export type LastFacility = { id: string; name: string } | null;

let lastFacility: LastFacility = null;

export function setLastFacility(f: { id: string; name: string }) {
  lastFacility = f;
}

export function getLastFacility(): LastFacility {
  return lastFacility;
}

export function clearLastFacility() {
  lastFacility = null;
}
