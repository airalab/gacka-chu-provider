import db from "./db";

const Demands = db.sequelize.define("demands", {
  original: {
    type: db.Sequelize.STRING,
    defaultValue: "",
  },
});

export default Demands;
