'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Players extends Model {
  
    static associate(models) {
      Players.hasMany(models.scores, {
        foreignKey: 'playerId',
      });
    }
  };

  Players.init({
    name: DataTypes.STRING,
    username: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Players',
    freezeTableName: true
  });
  
  return Players;
};