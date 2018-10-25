# GlyphSwan
Analyze and convert CJK characters.

## Analysis

When a character is selected, GlyphSwan renders the character and its variants
(from GlyphSwan conversion tables and the Unihan database) in four languages:
`zh-CN`, `zh-TW`, `ja-JP`, and `ko-KR`, so that language variants can be easily
compared. Analysis of secondary variants is available, and links are provided
to look up the selection in QZD Dict or the Unihan database.

## Conversion

GlyphSwan provides the following conversions:

- Chinese: Simplified ↔ Traditional
  - Maximal coverage of the 8,105 characters in the _Table of General Standard
    Chinese Characters_. (Not covered: character 6,774, which is not
    represented in Unicode, and character 7,146, whose simplified form is not
    represented in Unicode.)
  - Manual disambiguation for one-to-many conversions.
  - Correct handling of surrogate pairs for characters in the CJK Unified
    Ideographs Extension Blocks B–E.
- Kanji: Shinjitai ↔ Kyūjitai
  - Complete coverage of the 2,136 Jōyō kanji.
  - Manual disambiguation for one-to-many conversions.
- Kana: Hiragana ↔ Katakana
  - Maximal coverage of the 92 kana. (Not covered: VA, VI, VE, and VO, whose
    hiragana forms are not represented in Unicode as single codepoints.)

Copyright © 2009–2018 Kevin Hsieh. All Rights Reserved.
