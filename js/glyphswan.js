/*
GlyphSwan
glyphswan.js

Copyright (c) 2009-2018 Kevin Hsieh. All Rights Reserved.
*/

// -----------------------------------------------------------------------------
// GLOBALS
// -----------------------------------------------------------------------------

let converter = null;
const langs = ["zh-CN", "zh-TW", "ja-JP", "ko-KR"];

// -----------------------------------------------------------------------------
// UTILITIES
// -----------------------------------------------------------------------------

function id(str) {
  return document.getElementById(str);
}

function isHighSurrogate(char) {
  let point = char.charCodeAt(0);
  return point >= 0xD800 && point <= 0xDBFF;
}

class Converter {
  constructor(input, type) {
    this.input_ = input;
    this.i_ = 0;
    this.type_ = type;
    this.result_ = "";
  }

  convert(selection=null) {
    while (this.i_ < this.input_.length) {
      let char = isHighSurrogate(this.input_[this.i_])
                 ? this.input_.substr(this.i_, 2)
                 : this.input_[this.i_];
      let varr = gsdb.getVariants(char)[this.type_];
      if (!varr) {
        // No variants.
        this.result_ += char;
      } else if (varr.length == 1) {
        // Single variant.
        this.result_ += varr[0];
      } else if (selection) {
        // Multiple variants, selection provided.
        this.result_ += varr[selection-1];
        selection = null;
      } else {
        // Multiple variants, selection needed.
        return {"i": this.i_, "choices": varr};
      }
      // Skip low surrogates.
      this.i_ += isHighSurrogate(this.input_[this.i_]) ? 2 : 1;
    }
    return {"i": this.i_, "choices": []};
  }

  get result() { return this.result_; }
}

// -----------------------------------------------------------------------------
// APPLICATION
// -----------------------------------------------------------------------------

function analyze(char=null) {
  // Don't analyze if a conversion is active.
  if (converter) {
    return;
  }

  // Get selected character if char isn't specified. Add lookup links.
  if (!char) {
    char = id("text").value.slice(id("text").selectionStart,
                                  id("text").selectionEnd);
  }
  let html = "Look up selection in <a target='_blank' "
      + "href='https://qzj-dict.com/?search=" + char + "'>QZJ Dict</a> or "
      + "<a target='_blank' "
      + "href='https://www.unicode.org/cgi-bin/GetUnihanData.pl?codepoint="
      + char + "'>Unihan</a>.";

  // Stop here if char isn't the right length.
  if (!(char.length == 1 || isHighSurrogate(char[0]) && char.length == 2)) {
    html += "<p>Select a character to analyze it.</p>";
    id("analysis").innerHTML = html;
    return;
  }

  // Start table.
  html += " Fonts and databases may take some time to load."
      + "<table><thead><tr>"
      + "<th>Codepoint</th><th>" + langs.join("</th><th>") + "</th>"
      + "</tr></thead><tbody><tr>"
      + "<td>" + toPoint(char) + "<br>Selected</td>";
  for (let lang of langs) {
    html += "<td class='demo' lang='" + lang + "'>" + char + "</td>"
  }
  html += "</tr>";

  // Add variants.
  let vobj = gsdb.getVariants(char);
  let added = new Set(char);
  for (let type of Object.keys(vobj).sort()) {
    for (let variant of vobj[type]) {
      if (added.has(variant)) {
        continue;
      }
      html += "<tr><td><a href='javascript:analyze(\"" + variant + "\")'>"
          + toPoint(variant) + "<br>" + type.substr(1) + "</a></td>";
      for (let lang of langs) {
        html += "<td class='demo' lang='" + lang + "'>" + variant + "</td>"
      }
      html += "</tr>";
      added.add(variant);
    }
  }

  // Finish and show table.
  html += "</tbody></table>"
  if (added.size > 1) {
    html += "<p>Click a variant codepoint to view secondary variants.</p>";
  }
  id("analysis").innerHTML = html;
}

function startConvert(type) {
  converter = new Converter(id("text").value, type);
  continueConvert();
}

function continueConvert(selection=null) {
  // Convert and update textarea.
  let status = converter.convert(selection);
  id("text").value = converter.result + id("text").value.substr(status.i);

  // Exit if conversion is complete.
  if (status.choices.length == 0) {
    converter = null;
    id("analysis").innerHTML = "<p>Conversion is complete.</p>"
        + "<p>Select a character to analyze it.</p>";
    return;
  }

  // Just choose the first one if disambiguating automatically.
  if (!id("mdcheck").checked) {
    continueConvert(1);
    return;
  }

  // Manual disambiguation. Select the character in the textarea and
  // display the disambiguation prompt.
  id("text").focus();
  id("text").setSelectionRange(converter.result.length, converter.result.length
      + (isHighSurrogate(id("text").value[converter.result.length]) ? 2 : 1));
  let message = "<p>Manual disambiguation:</p>";
  for (let i = 0; i < status.choices.length; ++i) {
    message += "<label><input name='selection' type='radio' "
        + "onclick='continueConvert(" + (i + 1) + ")' /><span "
        + "class='black-text'>" + status.choices[i] + "</span></label><br>";
  }
  id("analysis").innerHTML = message;
}
