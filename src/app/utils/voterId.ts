const STORAGE_KEY = 'crowdshield_voter_id';

/** Stable anonymous id for this browser — survives refresh, cleared if user clears site data. */
export function getVoterId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
