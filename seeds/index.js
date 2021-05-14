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
      author:'609aa97f9662f704dc68e6d8', 
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ducimus repudiandae expedita, consequuntur illum quas numquam commodi facilis in doloribus, temporibus a possimus. Amet ut voluptate velit dolor, itaque mollitia accusamus?",
      price,
      geometry:{
        type : "Point",
        coordinates:[-113.1331, 47.0202]
      },
      images:[
        {
          url: 'https://res.cloudinary.com/dasyrpts0/image/upload/v1620966854/YelpCamp/f0fihjoyc08qw2o3uzre.jpg',
          filename: 'YelpCamp/f0fihjoyc08qw2o3uzre'
        },
        {
          url: 'https://res.cloudinary.com/dasyrpts0/image/upload/v1620966853/YelpCamp/kjjvdetbl78s9b57l5e4.jpg',
          filename: 'YelpCamp/kjjvdetbl78s9b57l5e4'
        }
    
      ]
      });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
