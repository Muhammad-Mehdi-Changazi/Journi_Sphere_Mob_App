const cities = [
  // {
  //   name: "Lahore",
  //   touristSpots: [
  //     {
  //       name: "Badshahi Mosque",
  //       description: "A grand Mughal-era mosque known for its stunning architecture and historical significance.",
  //       image: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Badshahi_Mosque_front_picture.jpg"
  //     },
  //     {
  //       name: "Lahore Fort",
  //       description: "A historical fortress built during the Mughal era, offering breathtaking views and intricate artwork.",
  //       image: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Lahore_Fort_view_from_Baradari.jpg"
  //     },
  //     {
  //       name: "Shalimar Gardens",
  //       description: "A UNESCO World Heritage site featuring terraced gardens, fountains, and Mughal architecture.",
  //       image: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Reflection_of_Farah_Baksh_Terrace_%28Upper_Terrace%29_main_building.jpg"
  //     }
  //   ]
  // },
  // {
  //   name: "Islamabad",
  //   touristSpots: [
  //     {
  //       name: "Faisal Mosque",
  //       description: "The largest mosque in Pakistan, featuring modern architecture and scenic mountain views.",
  //       image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/New_Faisal_Mosque_Islamabad.jpg/440px-New_Faisal_Mosque_Islamabad.jpg"
  //     },
  //     {
  //       name: "Daman-e-Koh",
  //       description: "A popular viewpoint offering a panoramic view of Islamabad and its surroundings.",
  //       image: "https://upload.wikimedia.org/wikipedia/commons/e/e5/The_Margalla_Hills%2C_Islamabad%2C_Pakistan_from_Daman-e-Koh_park.jpg"
  //     },
  //     {
  //       name: "Pakistan Monument",
  //       description: "A national monument symbolizing the four provinces of Pakistan with beautiful nighttime lighting.",
  //       image:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Blue_Hour_at_Pakistan_Monument.jpg/500px-Blue_Hour_at_Pakistan_Monument.jpg"
  //     }
  //   ]
  // },
  // {
  //   name: "Karachi",
  //   touristSpots: [
  //     {
  //       name: "Clifton Beach",
  //       description: "A famous beach in Karachi, popular for camel rides and seafood stalls.",
  //       image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Seaview_%28Clifton_Beach%29_Karachi.jpg/2560px-Seaview_%28Clifton_Beach%29_Karachi.jpg"
  //     },
  //     {
  //       name: "Mazar-e-Quaid",
  //       description: "The mausoleum of Pakistan's founder, Muhammad Ali Jinnah, with a striking white marble structure.",
  //       image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Jinnah_Mausoleum.JPG/500px-Jinnah_Mausoleum.JPG"
  //     },
  //     {
  //       name: "Port Grand",
  //       description: "A vibrant waterfront destination featuring restaurants, cultural events, and shopping.",
  //       image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Port_Grand_Karachi.JPG/2560px-Port_Grand_Karachi.JPG"
  //     }
  //   ]
  // },
  // {
  //   "name": "Quetta",
  //   "touristSpots": [
  //     {
  //       "name": "Hanna Lake",
  //       "description": "A picturesque lake surrounded by mountains, popular for boating and picnics.",
  //       "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Hanna_Lake_Quetta.jpg/2560px-Hanna_Lake_Quetta.jpg"
  //     },
  //     {
  //       "name": "Urak Valley",
  //       "description": "A lush green valley known for its apple orchards, waterfalls, and scenic beauty.",
  //       "image": "https://upload.wikimedia.org/wikipedia/commons/2/24/Urak_valley.........jpg"
  //     },
  //     {
  //       "name": "Hazarganji National Park",
  //       "description": "A national park home to the rare Chiltan wild goats and diverse wildlife, perfect for nature lovers.",
  //       "image": "https://live.staticflickr.com/3129/2561127729_e62d9cc911_b.jpg"
  //     }
  //   ]
  // }
  
];


// Insert into MongoDB
const mongoose = require("mongoose");
// const City = mongoose.model("City", specificCitySchema);
const Tourism = require("./models/tourism");

mongoose
  .connect(
    "mongodb+srv://sQpbJkHNcJzho6Pd:sQpbJkHNcJzho6Pd@manzil.gxdiu.mongodb.net/",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(async () => {
    console.log("Connected to MongoDB");
    await Tourism.insertMany(cities);
    console.log("Cities inserted successfully");
    mongoose.connection.close();
  })
  .catch((err) => console.error("Error connecting to MongoDB", err));
