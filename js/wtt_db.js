/* jshint -W033, -W104, -W097, esversion: 6 */
/*global require, console */
"use strict";
class WTTDB {

  constructor() {
    this.base = {};
    this.status = {connected: false, loaded: false, updates: 0}
  }

  updateFields(table, id, fields) {
    var t = Date.now()
    this.base(table).update(id, fields, (err, record) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Updated ${table}.${id} fields ${fields} in ${Date.now() - t}ms`);
      t = this.db[table];
      t[id] = record;
    });
    this.status.updates++;
  }

  updateField(table, id, field, value) {
    // reci07VlHwRHHdXc0
    if (value && value.startsWith && value.startsWith('rec'))
      value = [value];

    var x = {}
    x[field] = value;
    this.updateFields(table, id, x)
  }

  getRecords(table) {
    var a = [];
    var t = this.db[table];
    Object.keys(t).forEach(function(key) {
      var record = t[key];
      var fields = Object.assign({}, record.fields);
      fields._id = key;
      a.push(fields);
    })
    return a;
  }

  getRecord(table, id) {
    if (Array.isArray(id))
      id = id[0]

    var t = this.db[table];
    t = t[id];
    var _id = id;
    // not relational after WTT load - id is the SMT value
    if (t == null) {
      t = this.db[table];
      var a = null;
      Object.keys(t).forEach(function(key) {
        var record = t[key];
        if (record.fields.id == id) {
          a = record;
          _id = key;
        }
      })
      t = a;
    }
    var fields = Object.assign({}, t.fields);
    fields._id = _id;
    return fields;
  }

  init(apiKey, base) {
    var Airtable = require('airtable');
    Airtable.configure({
      endpointUrl: 'https://api.airtable.com',
      apiKey: apiKey  // fred@n4fl.com
    });
    this.base = Airtable.base(base);  // WTT2018
    this.db = {};
  }

  // database information -- load tables
  async initDB(apiKey, base, callback) {
    this.init(apiKey, base)
    let sort = [{field: "sched_date", direction: "asc"}]
    await this.loadTable('team_logo')
    await this.loadTable('player_pictures')
    await this.loadTable('matches', {sort: sort})
    await this.loadTable('teams')
    await this.loadTable('players')
    await this.loadTable('venues')
    console.log(">>> DB Loaded", this.db);
    this.status.loaded = true
    callback();
  }

  loadTable(table, options = {}) {
    let db = this.db
    let base = this.base
    return new Promise(function(resolve, reject) {
      var recordArray = {}
      options = Object.assign({maxRecords: 99}, options)
      base(table).select(options).eachPage(function page(records, fetchNextPage) {
        records.forEach(function(record) {
          recordArray[record.id] = record;
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
      }, function done(err) {
        if (err)
          console.error(err);

        db[table] = recordArray;
        return resolve();
      })
    })
  }

  insert(table, record) {
    this.base(table).create(record)
  }

  getStatus() {return this.status}
}
