/* jshint -W033, -W104, -W097, esversion: 6 */
/*global require, console, flatten, WTTUtil */
// create variable definitions and values
// moves from JSON to flat
"use strict";
class LocalStorage {

  constructor() {
    this.ls = window.localStorage;
  }

  get(key) {
    try {
      return JSON.parse(this.ls.getItem(key));
    } catch (e) {
      return this.ls.getItem(key);
    }
  }

  set(key, val) {
    this.ls.setItem(key, JSON.stringify(val));
    return this.get(key);
  }
}
