const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

//몽구스 연결
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

//db연결 확인
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price =Math.floor(Math.random()*20)+10;
    const camp = new Campground({
      author:'609aa2e6246d6654f489b071',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: "https://source.unsplash.com/collection/483251",
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ducimus repudiandae expedita, consequuntur illum quas numquam commodi facilis in doloribus, temporibus a possimus. Amet ut voluptate velit dolor, itaque mollitia accusamus?",
      price
      });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
