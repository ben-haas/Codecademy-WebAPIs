// Drum Arrays
let kicks = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
let snares = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
let hiHats = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
let rideCymbals = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];

const getArray = (arrayName) => {
  switch (arrayName) {
    case 'kicks':
      return kicks;
      break;
    case 'snares':
      return snares;
      break;
    case 'hiHats':
      return hiHats;
      break;
    case 'rideCymbals':
      return rideCymbals;
      break;
    default:
      return false;
  }
};

const toggleDrum = (drumArray, index) => {
  let drumSet = getArray(drumArray);

  if (!drumArray || index > 15 || index < 0) {
    return;
  }

  drumSet[index] = !drumSet[index];

};

const clear = drumArray => {
  let drumSet = getArray(drumArray);
  if (!drumArray || !drumSet) {
    return;
  }

  drumSet.fill(false);
};

const invert = drumArray => {
  let drumSet = getArray(drumArray);
  if (!drumArray || !drumSet) {
    return;
  }

  for (let i=0; i<drumSet.length; i++) {
    drumSet[i] = !drumSet[i];
  }
};

const getNeighborPads = (x, y, size) => {
  let neighborArray = [];
  if (x > size-1 || x < 0 || y > size-1 || y < 0) {
    return [];
  } else {
    //TODO add neighbor logic
    // neighborArray.push([x, y+1], [x,y-1], [x+1,y], [x-1,y]);
  }

  return neighborArray;
};
