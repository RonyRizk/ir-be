import { Variation } from '@/models/property';

export class VariationSorter {
  public sortVariations(variations: Variation[]): Variation[] {
    const maxAdults = Math.max(...variations.map(v => v.adult_nbr));
    const maxChildren = Math.max(...variations.filter(v => v.adult_nbr === maxAdults).map(v => v.child_nbr));
    return this.mergeSort(variations, maxAdults, maxChildren);
  }

  private mergeSort(items: Variation[], maxAdults: number, maxChildren: number): Variation[] {
    if (items.length <= 1) {
      return items;
    }

    const middle = Math.floor(items.length / 2);
    const left = items.slice(0, middle);
    const right = items.slice(middle);

    return this.merge(this.mergeSort(left, maxAdults, maxChildren), this.mergeSort(right, maxAdults, maxChildren), maxAdults, maxChildren);
  }

  private merge(left: Variation[], right: Variation[], maxAdults: number, maxChildren: number): Variation[] {
    let resultArray: Variation[] = [],
      leftIndex = 0,
      rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      if (this.compareVariations(left[leftIndex], right[rightIndex], maxAdults, maxChildren) === -1) {
        resultArray.push(left[leftIndex]);
        leftIndex++; // move left array cursor
      } else {
        resultArray.push(right[rightIndex]);
        rightIndex++; // move right array cursor
      }
    }

    return resultArray.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
  }

  private compareVariations(a: Variation, b: Variation, maxAdults: number, maxChildren: number): number {
    // Check for the special case where the max adult and max child should be sorted last
    const isAMax = a.adult_nbr === maxAdults && a.child_nbr === maxChildren;
    const isBMax = b.adult_nbr === maxAdults && b.child_nbr === maxChildren;

    if (isAMax && !isBMax) return 1;
    if (!isAMax && isBMax) return -1;

    // Normal sorting based on adults first, then children
    if (a.adult_nbr !== b.adult_nbr) {
      return a.adult_nbr - b.adult_nbr;
    }

    return a.child_nbr - b.child_nbr;
  }
}
