
/**
 * User Schema
 */
export default {
  name: 'User',
  attribute: {
    username: {
      type: "STRING",
      allowNull: false,
      unique: true,
    },
    createdAt: {
      type: "STRING",
      allowNull: false,
    },
  }
};
