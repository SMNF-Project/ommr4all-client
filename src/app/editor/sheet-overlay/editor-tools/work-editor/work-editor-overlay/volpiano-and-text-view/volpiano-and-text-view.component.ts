import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-volpiano-and-text-view',
  templateUrl: './volpiano-and-text-view.component.html',
  styleUrls: ['./volpiano-and-text-view.component.css']
})
export class VolpianoAndTextViewComponent implements OnInit {

  @Input() volpianoWords: string[][];
  @Input() textWords: string[][];

  /**
   * Reformats text and volpiano words so that the words and syllables
   * are shared and the leaf of the structure is a {volpiano, text} syllable
   * pair
   */
  get volpianoAndTextWords(): Array<Array<{volpiano: string, text: string}>> {
    // Initial word: has clef and no text
    const initialWord = [{volpiano: '1', text: '.'}];

    const combinedWords = [initialWord];
    for (let wIdx = 0; wIdx < this.volpianoWords.length; wIdx++) {
      const vWord = this.volpianoWords[wIdx];
      const tWord = this.textWords[wIdx];
      // Check matching syllable counts
      if (vWord.length !== tWord.length) {
        console.error('Volpiano and text word lengths do not match: vWord = ' +
          vWord + ', tWord = ' + tWord + ', lenghts: vWord: ' + vWord.length +
          ', tWord: ' + tWord.length);
      }
      const word = [];
      for (let sIdx = 0; sIdx < vWord.length; sIdx++) {
        word.push({volpiano: vWord[sIdx], text: tWord[sIdx]});
      }
      combinedWords.push(word);
    }
    return combinedWords;
  }

  constructor() { }

  ngOnInit() {
  }

  determineVolpianoConnectorSuffix(isLastWord= false,
                                   isLastSyllable = false,
                                   isFirstSyllable = false) {
    if (!isLastSyllable) { return '--'; }
    if (isLastSyllable) {
      if (isLastWord) { return '---4'; } else { return '---'; }
    }
  }

  determineVolpianoConnectorPrefix(isLastWord= false,
                                   isLastSyllable = false,
                                   isFirstSyllable = false) {
    if (isFirstSyllable) { return '-'; }
    return '';
  }
}
