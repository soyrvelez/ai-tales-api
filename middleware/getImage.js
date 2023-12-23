const OpenAIAPI = require('openai');
const openai = new OpenAIAPI({ apiKey: process.env.OPENAI_API_KEY });

async function getImage(prompt, character) {
  try {
    const { name, species, gender, age, personality, favoriteHobby } = character;
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `You will create a vignette for a short story focused on a main character. The main character is a ${age} years old ${gender} ${species} named ${name} with a ${personality} personality whose favorite hobby is ${favoriteHobby}. Your task is to create a vignette for a story with this character and the following story prompt: ${prompt}.`,
      n: 1,
      size: "1024x1024",
    });
    return response.data[0].url;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = getImage;
