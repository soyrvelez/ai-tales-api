// Import dependencies
const app = require('../app');
const request = require('supertest');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const { User } = require('../models');

// Import faker for generating test data
const { faker } = require('@faker-js/faker');

// User Model Tests
describe('User Model Routes', () => {

    let createdUserId;

    // Helper function to create a user for testing
    async function createUser() {
        return await User.create({
            username: faker.internet.userName(),
            password: faker.internet.password(),
            email: faker.internet.email(),
        });
    }

    // Test POST /new - Create a new user
    describe('POST /new', () => {
        it('creates a new user and returns the user object', async () => {
            const userData = {
                username: faker.internet.userName(),
                password: faker.internet.password(),
                email: faker.internet.email(),
            };

            const response = await request(app)
                .post('/new')
                .send(userData);

            expect(response.status).to.equal(200);
            expect(response.body).to.include.keys('username', 'email', '_id');

            // Deletes Test User After Creation
            if (response.body._id) {
                await User.findByIdAndDelete(response.body._id);
            }
        });
    });

    // Test GET /:id - View a single user
    describe('GET /:id', () => {
        before(async () => {
            const testUser = await createUser();
            createdUserId = testUser._id;
        });

        it('returns the user object for a valid id', async () => {
            const response = await request(app).get(`/${createdUserId}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('_id', createdUserId.toString());
        });

        after(async () => {
            await User.findByIdAndDelete(createdUserId);
        });
    });

    // Test PUT /edit/:id - Edit user account
    describe('PUT /edit/:id', () => {
        before(async () => {
            const testUser = await createUser();
            createdUserId = testUser._id;
        });

        it('updates user data and returns the updated user object', async () => {
            const updatedData = {
                username: 'UpdatedUsername',
                email: 'updated@example.com'
            };

            const response = await request(app)
                .put(`/edit/${createdUserId}`)
                .send(updatedData);

            expect(response.status).to.equal(200);
            expect(response.body).to.include(updatedData);
        });

        after(async () => {
            await User.findByIdAndDelete(createdUserId);
        });
    });

    // Test DELETE /delete/:id - Delete user account
    describe('DELETE /delete/:id', () => {
        before(async () => {
            const testUser = await createUser();
            createdUserId = testUser._id;
        });

        it('deletes a user and ensures it no longer exists', async () => {
            const response = await request(app)
                .delete(`/delete/${createdUserId}`);

            expect(response.status).to.equal(200);

            const userExists = await User.findById(createdUserId);
            expect(userExists).to.be.null;
        });
    });
});
