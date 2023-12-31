const OpenAIAPI = require('openai');
const openai = new OpenAIAPI({ apiKey: process.env.OPENAI_API_KEY });

async function getAvatar(character) {
  try {
    const { name, species, gender, age, personality, favoriteHobby } = character;
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a detailed and expressive headshot portrait in the style of a high-quality animated movie. Use bright, vivid colors and a joyful, wonder-filled atmosphere. The subject of the headshot is a ${age}-year-old ${gender} ${species} named ${name}, characterized by a ${personality} personality and a favorite hobby: ${favoriteHobby}. The image should be optimized to standout when used as a social media profile picture or avatar.`,
      n: 1,
      size: "1024x1024"
    });
    return response.data[0].url;
  } catch (error) {
    console.error(error);
    return null;
  }
};


module.exports = getAvatar;
