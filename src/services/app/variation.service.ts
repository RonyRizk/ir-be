import { Variation } from '@/models/property';
import localizedWords from '@/stores/localization.store';

export default class VariationService {
  /**
   * Formats a variation based on the number of infants and returns a formatted string.
   * @param {Object} params - The input parameters.
   * @param {Variation} params.baseVariation - The base variation object.
   * @param {Variation[]} params.variations - A list of available variations.
   * @param {number} params.infants - The number of infants to adjust the variation for.
   * @returns {string} A formatted string describing the variation adjusted for infants.
   */
  public formatVariationBasedOnInfants(params: { baseVariation: Variation; variations: Variation[]; infants: number }): string {
    const variation = this.getVariationBasedOnInfants(params);
    return this.formatVariation(variation, params.infants);
  }

  /**
   * Calculates the discounted amount for a variation adjusted for the number of infants.
   * @param {Object} params - The input parameters.
   * @param {Variation} params.baseVariation - The base variation object.
   * @param {Variation[]} params.variations - A list of available variations.
   * @param {number} params.infants - The number of infants to consider for adjustments.
   * @returns {number} The discounted amount for the selected variation, or 0 if no discounted amount is available.
   */
  public calculateVariationAmount(params: { baseVariation: Variation; variations: Variation[]; infants: number }): number {
    return this.getVariationBasedOnInfants(params)?.discounted_amount || 0;
  }

  /**
   * Finds the appropriate variation from a list of variations based on the number of infants.
   * @param {Object} params - The input parameters.
   * @param {Variation} params.baseVariation - The base variation object.
   * @param {Variation[]} params.variations - A list of available variations.
   * @param {number} params.infants - The number of infants to adjust for.
   * @returns {Variation} The matching variation or the base variation if no match is found.
   */
  public getVariationBasedOnInfants({ variations, baseVariation, infants }: { baseVariation: Variation; variations: Variation[]; infants: number }): Variation {
    const { adult_nbr, child_nbr } = baseVariation;
    return variations.find(v => v.adult_nbr === adult_nbr && v.child_nbr === Math.max(0, child_nbr - Math.max(0, infants))) || baseVariation;
  }

  /**
   * Formats a variation object into a human-readable string, adjusted for the number of infants.
   * @param {Variation} variation - The variation object to format.
   * @param {number} infant_nbr - The number of infants to adjust for.
   * @returns {string} A formatted string representing the variation.
   * @private
   */
  private formatVariation({ child_nbr, adult_nbr }: Variation, infant_nbr: number): string {
    const adultNumber = Number(adult_nbr) || 0;
    const infantNumber = Math.max(Number(infant_nbr) || 0, 0);
    const adultLabel = adultNumber > 1 ? localizedWords.entries.Lcz_Adults.toLowerCase() : localizedWords.entries.Lcz_Adult.toLowerCase();
    const childLabel = child_nbr > 1 ? localizedWords.entries.Lcz_Children.toLowerCase() : localizedWords.entries.Lcz_Child.toLowerCase();
    const infantLabel = infantNumber > 1 ? (localizedWords.entries['Lcz_Infants'] ?? 'infants')?.toLowerCase() : (localizedWords?.entries['Lcz_Infant'] ?? 'infant')?.toLowerCase();
    const parts = [`${adultNumber} ${adultLabel}`, child_nbr ? `${child_nbr} ${childLabel}` : '', infantNumber ? `${infantNumber} ${infantLabel}` : ''];
    return parts.filter(Boolean).join('&nbsp&nbsp&nbsp&nbsp');
  }
}
