const OpenAIAPI = require('openai');
const openai = new OpenAIAPI({ apiKey: process.env.OPENAI_API_KEY });

async function getCaption(prompt, character) {
  try {
    const { name, species, gender, age, personality, favoriteHobby } = character;
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          "role": "system",
          "content": `Create a short story (2 paragraphs maximum length) based on a character named ${name}. ${name} is a ${gender} ${species} that is ${age} years old has a ${personality} personality and their favorite hobby is ${favoriteHobby}.

          You will use the prompt provided by the user as the inspiration for your story's plot. If the user's input deviates from your purpose, create a story based on the character's traits.`
        },
        {
          "role": "user",
          "content": prompt
        }
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = getCaption;
