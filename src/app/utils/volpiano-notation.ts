/* Utility functions for converting to the volpiano notation format.
 * This is used to generate a modern notation view dynamically from
 * the data. */

import {Work} from '../data-types/page/work';


// Assuming you have pname and octave, you get the corresponding volpiano note
// from VOLPIANO_PITCH_FROM_PNAME_AND_OCTAVE[octave][pname]
export class VolpianoConstants {
  static readonly VOLPIANO_PITCH_FROM_PNAME_AND_OCTAVE = [
    // pitch indexes 0 and 1 are A and B in the given octave...
    [], // no octave 0
    [], // or octave 1
    ['a', 'b', undefined, undefined, undefined, undefined, '9'], // or octave 2 - has g-b
    ['h', 'j', 'c', 'd', 'e', 'f', 'g'], // octave 3 rendered as octave 4
    ['p', 'q', 'k', 'l', 'm', 'n', 'o'],
    [undefined, undefined, 'r', 's', undefined, undefined, undefined],
    [],
  ];
// 9  a  b  c  d  e f g h=a j k l m n o p=a q r s
}

export function workToVolpianoData(work: Work) {
  /* Converts the music and lyrics contained inside a Work
   * to data that can be rendered using the Volpiano font.
   * */
  return '';
}
