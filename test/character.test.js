// Import dependencies
const app = require('../app');
const request = require('supertest');
const expect = require('chai').expect;
const { User, Character } = require('../models');

// Import faker for generating test data
const { faker } = require('@faker-js/faker');

// Character Model Tests
describe('Character Model Routes', () => {

    let userId;
    let characterId;

    // Helper function to create a user for testing
    async function createUser() {
        return await User.create({
            username: faker.internet.userName(),
            password: faker.internet.password(),
            email: faker.internet.email(),
        });
    }

    // Helper function to create a character for testing
    async function createCharacter(user) {
        return await Character.create({
            user: user._id,
            name: faker.name.findName(),
            species: faker.animal.type(),
            gender: faker.random.arrayElement(['Male', 'Female', 'Non-binary']),
            age: faker.datatype.number({ min: 1, max: 100 }),
            personality: faker.lorem.word(),
            favoriteHobby: faker.hobby.type()
        });
    }

    // Test POST /new - Create a new character
    describe('POST /new', () => {
        before(async () => {
            const testUser = await createUser();
            userId = testUser._id;
        });

        it('creates a new character and returns the character object', async () => {
            const characterData = {
                user: userId,
                name: faker.name.findName(),
                species: faker.animal.type(),
                gender: "Non-binary",
                age: faker.datatype.number({ min: 1, max: 100 }),
                personality: "Friendly",
                favoriteHobby: "Reading"
            };

            const response = await request(app)
                .post('/new')
                .send(characterData);

            expect(response.status).to.equal(200);
            expect(response.body).to.include.keys('user', 'name', 'species', 'age');

            characterId = response.body._id; // Save character ID for later tests
        });

        after(async () => {
            await User.findByIdAndDelete(userId);
            if (characterId) {
                await Character.findByIdAndDelete(characterId);
            }
        });
    });

    // Test GET /:id - View a single character
    describe('GET /:id', () => {
        before(async () => {
            const testUser = await createUser();
            userId = testUser._id;
            const testCharacter = await createCharacter(testUser);
            characterId = testCharacter._id;
        });

        it('returns the character object for a valid id', async () => {
            const response = await request(app).get(`/${characterId}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('_id', characterId.toString());
        });

        after(async () => {
            await User.findByIdAndDelete(userId);
            await Character.findByIdAndDelete(characterId);
        });
    });

    // Test GET /collection/:userId - View all characters for a user
    describe('GET /collection/:userId', () => {
        before(async () => {
            const testUser = await createUser();
            userId = testUser._id;

            // Create multiple characters for the user
            await createCharacter(testUser);
            await createCharacter(testUser);
        });

        it('returns all characters for a given user', async () => {
            const response = await request(app).get(`/collection/${userId}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.be.an('array');
            expect(response.body.length).to.be.at.least(1);
        });

        after(async () => {
            await User.findByIdAndDelete(userId);
            await Character.deleteMany({ user: userId });
        });
    });

    // Test PUT /edit/:id - Edit a single character
    describe('PUT /edit/:id', () => {
        before(async () => {
            const testUser = await createUser();
            userId = testUser._id;
            const testCharacter = await createCharacter(testUser);
            characterId = testCharacter._id;
        });

        it('updates character data and returns the updated character object', async () => {
            const updatedData = {
                name: "Updated Name",
                age: 45
            };

            const response = await request(app)
                .put(`/edit/${characterId}`)
                .send(updatedData);

            expect(response.status).to.equal(200);
            expect(response.body).to.include(updatedData);
        });

        after(async () => {
            await User.findByIdAndDelete(userId);
            await Character.findByIdAndDelete(characterId);
        });
    });

    // Test DELETE /delete/:id - Delete a character
    describe('DELETE /delete/:id', () => {
        before(async () => {
            const testUser = await createUser();
            userId = testUser._id;
            const testCharacter = await createCharacter(testUser);
            characterId = testCharacter._id;
        });

        it('deletes a character and ensures it no longer exists', async () => {
            const response = await request(app)
                .delete(`/delete/${characterId}`);

            expect(response.status).to.equal(200);

            const characterExists = await Character.findById(characterId);
            expect(characterExists).to.be.null;
        });

        after(async () => {
            await User.findByIdAndDelete(userId);
        });
    });
});
