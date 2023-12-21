// import the server
const app = require('../app'); // make the server is exported from app.js
const request = require('supertest');
const expect = require('chai').expect;

// Test Home Route
describe('GET /', () => {
  it('returns a 200 response', (done) => {
      request(app).get('/')
          .expect(200, done);
  });
});
