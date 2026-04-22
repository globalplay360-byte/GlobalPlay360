import { Country, State } from "country-state-city";
import type { Opportunity } from "@/types";

export function formatLocation(opp: Partial<Opportunity> & { location?: string }): string {
  // Backwards compatibility for old records
  if (opp.location && !opp.country) {
    return opp.location;
  }

  const parts: string[] = [];
  
  if (opp.city) {
    parts.push(opp.city);
  }
  
  if (opp.state && opp.country) {
    // Optionally resolve state name, though usually raw state name or code is fine.
    // If opp.state is a state code, we can resolve it:
    const stateObj = State.getStateByCodeAndCountry(opp.state, opp.country);
    parts.push(stateObj?.name || opp.state);
  } else if (opp.state) {
    parts.push(opp.state);
  }
  
  if (opp.country) {
    const countryObj = Country.getCountryByCode(opp.country);
    parts.push(countryObj?.name || opp.country);
  }

  return parts.filter(Boolean).join(', ') || 'Ubicació no especificada';
}
