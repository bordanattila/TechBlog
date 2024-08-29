const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");
class BlogPosts extends Model {}
BlogPosts.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        topic: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "user",
                key: "id",
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        excerpt: {
            type: DataTypes.VIRTUAL, // Use VIRTUAL type for computed columns
            get() {
              const content = this.getDataValue("content");
              return content ? content.substring(0, 200) + "..." : "";
            },
          },
    },
    {
        sequelize,
        freezeTableName: true,
        underscored: true,
        modelName: 'blogData',
        underscored: true,
      }
    
);
  
module.exports = BlogPosts;