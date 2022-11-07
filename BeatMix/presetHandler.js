// Use this presets array inside your presetHandler
const presets = require('./presets');

// Complete this function:
const getPreset = (index) => {
  return presets[index] || null;
}

const putPreset = (index, arrayName) => {
  if (!presets[index]) {
    return;
  }
  presets[index] = arrayName;
  return presets[index];
};

const presetHandler = (method, index, newPresetArray) => {
  if (method === 'GET') {
    let preset = getPreset(index);
    if (preset) {
      return [200, preset];
    } else {
      return [404];
    }
  } else if (method === 'PUT') {
    const newPreset = putPreset(index, newPresetArray);
    if (newPreset) {
      return [200, newPreset];
    } else {
      return [404];
    }
  } else {
    return [400];
  }
};

// Leave this line so that your presetHandler function can be used elsewhere:
module.exports = presetHandler;
