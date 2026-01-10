import axios from 'axios';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL;

async function decideAgentAction(payload) {
  const response = await axios.post(
    `${AI_ENGINE_URL}/agent/decide`,
    payload
  );

  return response.data;
}

export default decideAgentAction;