'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    static associate(models) {
      // Define associations here (if needed)
    }
  }

  Contact.init(
    {
      phoneNumber: DataTypes.STRING,
      email: DataTypes.STRING,
      linkedId: DataTypes.INTEGER,
      linkPrecedence: DataTypes.ENUM("primary", "secondary"),
    },
    {
      sequelize,
      modelName: "Contact",
      timestamps: true, 
      paranoid: true, 
    }
  );

  return Contact;
};
