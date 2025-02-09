module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Contacts", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      phoneNumber: { type: Sequelize.STRING },
      email: { type: Sequelize.STRING },
      linkedId: { type: Sequelize.INTEGER },
      linkPrecedence: { type: Sequelize.ENUM("primary", "secondary") },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("Contacts");
  },
};
