'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Scores extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Scores.belongsTo(models.Players, {
        foreignKey: 'playerId',
        onDelete: 'CASCADE'
      });
    }
  };
  Scores.init({
    kills: DataTypes.INTEGER,
    scores: DataTypes.INTEGER,
    playerId: DataTypes.INTEGER,
    time: DataTypes.DATE,
    match_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'scores',
    freezeTableName: true
  });
  return Scores;
};