"use strict";

var words, all_words;

words = [
	//https://www.independent.co.uk/news/weird-news/the-most-difficult-words-to-pronounce-in-the-english-language-revealed-as-well-as-the-world-s-10159516.html
	['worcestershire', 'otorhinolaryngologist', 'colonel', 'isthmus'],
	//https://www.englishclub.com/efl/esl-magazine/pronunciation-25-words/
	['onomatopoeia', 'deterioration'],
	//http://grammar.yourdictionary.com/style-and-usage/mispron.html
	['affidavit', 'alzheimer', 'cacophony', 'caucasus', 'diphtheria', 'heimlich', 'ostensibly']
];
all_words = [];
words.forEach( word_array => all_words = all_words.concat(word_array) );

module.exports = all_words;