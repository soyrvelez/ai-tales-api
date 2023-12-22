// Import dependencies
const app = require('../app');
const request = require('supertest');
const expect = require('chai').expect;
const { User, Character, Scene } = require('../models');

// Import faker for generating test data
const { faker } = require('@faker-js/faker');

// Scene Model Tests
describe('Scene Model Routes', () => {

    let characterId, sceneId, userId;

    // Helper function to create a user
    async function createUser() {
        return await User.create({
            username: faker.internet.userName(),
            password: faker.internet.password(),
            email: faker.internet.email(),
        });
    }

    // Helper function to create a character
    async function createCharacter(user) {
        return await Character.create({
            user: user._id,
            name: faker.person.firstName(),
            species: faker.animal.type(),
            gender: faker.helpers.arrayElement(['Male', 'Female', 'Non-binary']),
            age: faker.number.int({ min: 1, max: 100 }),
            personality: faker.lorem.word(),
            favoriteHobby: "Golf"
        });
    }

    // Helper function to create a scene
    async function createScene(character) {
        return await Scene.create({
            character: [character._id],
            prompt: faker.lorem.sentence(),
            sceneImageUrl: faker.image.url(),
            sceneCaption: faker.lorem.sentence(),
            likes: faker.number.int(),
            comments: faker.number.int(),
            views: faker.number.int()
        });
    }

    // Test POST /new - Create a new scene
    describe('POST /new', () => {
        before(async () => {
            const testUser = await createUser();
            const testCharacter = await createCharacter(testUser);
            characterId = testCharacter._id;
        });

        it('creates a new scene and returns the scene object', async () => {
            const sceneData = {
                character: characterId,
                prompt: "A mysterious forest",
                sceneImageUrl: "http://example.com/forest.jpg",
                sceneCaption: "Deep in the mystical woods",
                likes: 10,
                comments: 2,
                views: 100
            };

            const response = await request(app)
                .post(`/scenes/new/${characterId}`)
                .send(sceneData);

            expect(response.status).to.equal(201);
            expect(response.body).to.include.keys('character', 'prompt', 'sceneImageUrl');
        });

        after(async () => {
            if (sceneId) {
                await Scene.findByIdAndDelete(sceneId);
                await Character.findByIdAndDelete(characterId);
                await User.findByIdAndDelete(testUser._id);
            }
        });
    });

    // Test GET /:id - View a single scene
    describe('GET /:id', () => {
        before(async () => {
            const testCharacter = await createCharacter(await createUser());
            const testScene = await createScene(testCharacter);
            characterId = testCharacter._id;
            sceneId = testScene._id;
        });

        it('returns the scene object for a valid id', async () => {
            const response = await request(app).get(`/scenes/${sceneId}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('_id', sceneId.toString());
        });

        after(async () => {
            await Scene.findByIdAndDelete(sceneId);
            await Character.findByIdAndDelete(characterId);
        });
    });

    // Test GET /character/:characterId - Views all of a character’s scenes
    describe('GET /character/:characterId', () => {
        before(async () => {
            const testUser = await createUser();
            const testCharacter = await createCharacter(testUser);
            characterId = testCharacter._id;
            await createScene(testCharacter);
            await createScene(testCharacter);
        });

        it('returns all scenes for a given character', async () => {
            const response = await request(app).get(`/scenes/character/${characterId}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.be.an('array');
            expect(response.body.length).to.be.at.least(1);
        });

        after(async () => {
            await Character.findByIdAndDelete(characterId);
            await Scene.deleteMany({ character: characterId });
        });
    });

    // Test GET /users/:userId - Views all scenes associated with a single user
    describe('GET /users/:userId', () => {
        before(async () => {
            const testUser = await createUser();
            userId = testUser._id;
            const testCharacter = await createCharacter(testUser);
            await createScene(testCharacter);
            await createScene(testCharacter);
        });

        it('returns all scenes associated with a user', async () => {
            const response = await request(app).get(`/scenes/users/${userId}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.be.an('array');
            expect(response.body.length).to.be.at.least(1);
        });

        after(async () => {
            await User.findByIdAndDelete(userId);
            await Character.deleteMany({ user: userId });
            await Scene.deleteMany({ 'character.user': userId });
        });
    });

    // Test GET /explore/ - View all scenes except those of the current user
describe('GET /explore/:userId', () => {
    let currentUser, otherUser, otherCharacter, otherSceneId;

    before(async () => {
        // Creating a 'current' user and a 'other' user
        currentUser = await createUser();
        otherUser = await createUser();

        // Creating a character and a scene for the 'other' user
        otherCharacter = await createCharacter(otherUser);
        const otherScene = await createScene(otherCharacter);
        otherSceneId = otherScene._id;
    });

    it('returns scenes not associated with the current user', async () => {
        const response = await request(app).get(`/scenes/explore/${currentUser._id}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');

        // Check that the returned scenes are not associated with the 'current' user
        response.body.forEach(scene => {
            expect(String(scene.character[0].user)).to.not.equal(String(currentUser._id));
        });
    });

    after(async () => {
        // Clean up: delete both users, their characters, and scenes
        await User.findByIdAndDelete(currentUser._id);
        await User.findByIdAndDelete(otherUser._id);
        await Character.findByIdAndDelete(otherCharacter._id);
        await Scene.findByIdAndDelete(otherSceneId);
    });
});

    // Test DELETE /delete/:id - Delete a scene
    describe('DELETE /delete/:id', () => {
        before(async () => {
            const testCharacter = await createCharacter(await createUser());
            const testScene = await createScene(testCharacter);
            sceneId = testScene._id;
        });

        it('deletes a scene and ensures it no longer exists', async () => {
            const response = await request(app).delete(`/scenes/delete/${sceneId}`);

            expect(response.status).to.equal(200);

            const sceneExists = await Scene.findById(sceneId);
            expect(sceneExists).to.be.null;
        });
    });

});
