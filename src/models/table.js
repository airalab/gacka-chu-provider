import db from "./db";

const Model = db.sequelize.define("auction", {
  status: {
    type: db.Sequelize.STRING,
    defaultValue: "coming",
  },
  dateStart: {
    type: db.Sequelize.DATE,
  },
  dateEnd: {
    type: db.Sequelize.DATE,
  },
  cost: {
    type: db.Sequelize.INTEGER,
    defaultValue: 0,
  },
  account: {
    type: db.Sequelize.STRING,
    defaultValue: "",
  },
  original: {
    type: db.Sequelize.STRING,
    defaultValue: "",
  },
  bid: {
    type: db.Sequelize.STRING,
    defaultValue: "",
  },
  vid: {
    type: db.Sequelize.STRING,
    defaultValue: "",
  },
  name: {
    type: db.Sequelize.STRING,
    defaultValue: "",
  },
  objective: {
    type: db.Sequelize.STRING,
    defaultValue: "",
  },
  liability: {
    type: db.Sequelize.STRING,
    defaultValue: "",
  },
});

export default Model;
