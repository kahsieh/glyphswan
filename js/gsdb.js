/*
GlyphSwan
gsdb.js

Copyright (c) 2009-2018 Kevin Hsieh. All Rights Reserved.
Parts of this file are derived from the Unihan Database.
*/

function toChar(point) {
  return String.fromCodePoint(parseInt(point.split('+')[1], 16));
}

function toPoint(char) {
  return "U+" + char.codePointAt(0).toString(16).toUpperCase();
}

const gsdb = {
  getVariants: function (char) {
    let vobj = {};
    let key = toPoint(char);
    if (!this.variants_[key]) {
      return vobj;
    }
    for (let type in this.variants_[key]) {
      vobj[type] = this.variants_[key][type].map(toChar);
    }
    return vobj;
  },
  updateVariants: function (path, overwrite=false) {
    if (overwrite) {
      this.variants_ = {};
    }
    let req = new XMLHttpRequest();
    req.open("GET", path);
    req.onreadystatechange = () => {
      if (!(req.readyState == 4 && (!req.status || req.status == 200))) {
        return;
      }
      for (let line of req.responseText.split('\n')) {
        if (!line || line[0] == '#') {
          continue;
        }
        let tokens = line.split('\t');
        if (!this.variants_[tokens[0]]) {
          this.variants_[tokens[0]] = {}
        }
        if (!this.variants_[tokens[0]][tokens[1]]) {
          this.variants_[tokens[0]][tokens[1]] = [];
        }
        let varr = this.variants_[tokens[0]][tokens[1]];
        this.variants_[tokens[0]][tokens[1]] = varr.concat(tokens[2].split(' ')
            .map(token => token.split('<')[0])
            .filter(point => varr.indexOf(point) < 0));
      }
    }
    req.send()
  },
};