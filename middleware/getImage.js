const OpenAIAPI = require('openai');
const openai = new OpenAIAPI({ apiKey: process.env.OPENAI_API_KEY });

async function getImage(prompt, character) {
  try {
    const { name, species, gender, age, personality, favoriteHobby } = character;
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a detailed and expressive image in the style of a high-quality animated movie. Use bright, vivid colors and a joyful, wonder-filled atmosphere. The scene should center around a ${age}-year-old ${gender} ${species} named ${name}, characterized by a ${personality} personality, enjoying their favorite hobby: ${favoriteHobby}. The image should be inspired by the following story prompt: ${prompt}, and it must be rich in details to vividly convey the narrative without any text.`,
      n: 1,
      size: "1024x1024"
    });
    return response.data[0].url;
  } catch (error) {
    console.error(error);
    return null;
  }
};


module.exports = getImage;
