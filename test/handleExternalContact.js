const test = require('tape')
const md5hex = require('md5-hex')
const PouchDB = require('pouchDB')
const handleExternalContact = require('../lib/handleExternalContact')

test(`
given a new simplePerson
and the email matches no existing person
and the email_verified is false
and the externalContactID matches no existing contact
when it is put
then a new contact will be created
with the email_verified set to false
`,
t => {
  setup((err, db) => {
    t.error(err)
    let simplePerson = {name: 'Ryan Ramage', email: 'ryanr@redmantech.com'}
    let email_verified = false
    let systemID = 'skynet'
    let externalContactID = '12432432'
    handleExternalContact.put(db, simplePerson, email_verified, systemID, externalContactID, (err, results) => {
      t.error(err)
      t.ok(true)
      t.equals(results.email_verified, email_verified)
      db.destroy(() => t.end())
    })
  })
})

test(`
given a new simplePerson
and the email matches no existing person
and the email_verified is true
and the externalContactID matches no existing contact
when it is put
then a new contact will be created
with the email_verified set to true
and a new email entry will be created

`,
t => {
  setup((err, db) => {
    t.error(err)
    let simplePerson = {name: 'Ryan Ramage', email: 'ryanr@redmantech.com'}
    let email_verified = true
    let systemID = 'skynet'
    let externalContactID = '12432432'
    handleExternalContact.put(db, simplePerson, email_verified, systemID, externalContactID, (err, results) => {
      t.error(err)
      t.ok(true)
      t.equals(results.email_verified, email_verified)
      db.destroy(() => t.end())
    })
  })
})

test(`
given a new simplePerson
and the externalContactID MATCHES an existing contact
and the email_verified is false
and the email matches no existing person
when it is put
then a new contact will NOT be created
with the email_verified still set to false
`,
t => {
  setup((err, db) => {
    t.error(err)
    let simplePerson = {name: 'Ryan Ramage', email: 'ryanr@redmantech.com'}
    let email_verified = false
    let systemID = 'skynet'
    let externalContactID = '12432432'
    // we create the contact by calling twice
    handleExternalContact.put(db, simplePerson, email_verified, systemID, externalContactID, (err, results) => {
      t.error(err)
      handleExternalContact.put(db, simplePerson, email_verified, systemID, externalContactID, (err, results2) => {
        t.error(err)
        t.equals(results2.email_verified, email_verified)
        t.equals(results2.email, simplePerson.email)
        db.destroy(() => t.end())
      })
    })
  })
})

test(`
given a new simplePerson
and the email_verified is true
and the externalContactID matches no existing contact
and the email MATCHES an existing person
when it is put
then a new contact will NOT be created
`,
t => {
  let exitingContact = {
    _id: 'gb|contact|1',
    first: 'Ryan',
    last: 'Ramage',
    email: 'ryanr@redmantech.com'
  }
  let existingEmail = {
    _id: 'gb|email|' + md5hex(exitingContact.email),
    email: exitingContact.email,
    contact: 1,
    updated: 2
  }
  setup([exitingContact, existingEmail], (err, db) => {
    t.error(err)
    let simplePerson = {name: 'Ryan Ramage', email: 'ryanr@redmantech.com'}
    let email_verified = true
    let systemID = 'skynet'
    let externalContactID = '12432432'
    handleExternalContact.put(db, simplePerson, email_verified, systemID, externalContactID, (err, results) => {
      t.error(err)
      t.ok(true)
      t.equals(results._id, exitingContact._id)
      t.equals(results.email, simplePerson.email)
      t.equals(results.email_verified, true)
      t.ok(results.lookups)
      t.equals(results.lookups.skynet.id, externalContactID)
      db.destroy(() => t.end())
    })
  })
})

function setup (docs, done) {
  if (!done) {
    done = docs
    docs = []
  }
  let db = new PouchDB('gabby-contacts')
  const grandCouchapp = require('gabby-contacts/couchapps/_design-grandContacts.js')
  Object.keys(grandCouchapp.views).forEach(key => {
    grandCouchapp.views[key].map = grandCouchapp.views[key].map.toString()
  })
  const gabbyCouchapp = require('gabby-contacts/couchapps/_design-gabby.js')
  Object.keys(gabbyCouchapp.views).forEach(key => {
    gabbyCouchapp.views[key].map = gabbyCouchapp.views[key].map.toString()
  })
  docs.push(grandCouchapp)
  docs.push(gabbyCouchapp)
  db.bulkDocs(docs, err => done(err, db))
}
