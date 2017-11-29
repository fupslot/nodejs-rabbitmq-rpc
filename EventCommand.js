module.exports.create = (name, options) => {
  if (typeof name === 'string' && typeof options === 'object') {
    return Object.assign({ name }, options);
  } else if (typeof name === 'object') {
    return name;
  } else {
    throw new Error('EventCommand got wrong arguments');
  }
};