const User = require('./User');
const Conversation = require('./Conversation');
const Message = require('./Message');

// No need to define relationships here as they are already defined in the schema files
// Mongoose uses references in the schema definitions, not explicit relationship methods

module.exports = {
  User,
  Conversation,
  Message
};