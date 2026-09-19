import mongoose from "mongoose";
import "../config/env.js";
import connectDB from "../config/db.js";
import { Place } from "../models/place.model.js";
import { User } from "../models/user.model.js";

// Real Ilam (Nepal) tourist destinations.
// Photos are real, CC licensed Wikimedia Commons images stored in
// backend/public/images and served by the API at /static/<slug>.jpg
// (run `npm run seed:images` to download them).
const baseUrl = (
  process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`
).replace(/\/+$/, "");

const imageFor = (slug) => `${baseUrl}/static/${slug}.jpg`;

const places = [
  {
    name: "Kanyam Tea Garden",
    slug: "kanyam-tea-garden",
    description:
      "Kanyam is the most visited spot of Ilam, a vast green carpet of tea bushes spread over gentle hills. The tea estate, the winding road and the cool breeze make it perfect for a short walk, cycling or simply sitting in one of the hilltop cafes.",
    location: "Kanyam, Suryodaya Municipality, Ilam",
    category: "Tea Garden",
    bestTimeToVisit: "October to November and March to May",
    entryFee: "Free",
    thingsToDo: [
      "Walk through the tea garden",
      "Cycling on the estate road",
      "Photography",
      "Horse riding",
      "Local tea and snacks at hilltop cafes",
    ],
  },
  {
    name: "Antu Danda",
    slug: "antu-danda",
    description:
      "Antu Danda is a hilltop viewpoint at about 2,328 m famous for its sunrise. On clear mornings the first light falls on the Kanchenjunga range, and the view stretches over the Terai plains, tea estates and the winding Mechi river below.",
    location: "Antu, Chulachuli, Ilam",
    category: "Viewpoint",
    bestTimeToVisit: "October to December (best sunrise views)",
    entryFee: "Free",
    thingsToDo: [
      "Sunrise view of Kanchenjunga",
      "Camping and night stay",
      "Hiking to the viewpoint",
      "Photography",
    ],
  },
  {
    name: "Mai Pokhari",
    slug: "mai-pokhari",
    description:
      "Mai Pokhari is a sacred lake and a Ramsar wetland site at about 2,430 m. Surrounded by dense forest and rhododendron, it is believed to have been formed from the tears of the goddess Parvati and is visited both by pilgrims and nature lovers.",
    location: "Mai Pokhari, Suryodaya Municipality, Ilam",
    category: "Lake and Pilgrimage",
    bestTimeToVisit: "March to May (rhododendrons) and September to November",
    entryFee: "NPR 25",
    thingsToDo: [
      "Boating on the lake",
      "Bird watching",
      "Pilgrimage around the lake",
      "Forest walk",
    ],
  },
  {
    name: "Sandakpur",
    slug: "sandakpur",
    description:
      "Sandakpur sits on the Nepal-India border at around 3,636 m and is one of the highest points of Ilam. The trek passes rhododendron forests and Sherpa style villages, and the summit offers a wide Himalayan panorama including Kanchenjunga.",
    location: "Sandakpur, Ilam (Nepal-India border)",
    category: "Trekking",
    bestTimeToVisit: "October to December and March to April",
    entryFee: "Free",
    thingsToDo: [
      "Trekking",
      "Sunrise and sunset views",
      "View of Kanchenjunga and Everest range",
      "Camping",
    ],
  },
  {
    name: "Fikkal Bazaar",
    slug: "fikkal-bazaar",
    description:
      "Fikkal is the busiest trading town of Ilam, built along the highway near the Indian border. It is known for its colourful market, tea shops and a mixed culture of Nepali and Indian hill communities.",
    location: "Fikkal, Ilam",
    category: "Market and Town",
    bestTimeToVisit: "September to November and March to May",
    entryFee: "Free",
    thingsToDo: [
      "Shop for tea and local products",
      "Taste local food",
      "Walk around the bazaar",
    ],
  },
  {
    name: "Ilam Tea Estate",
    slug: "ilam-tea-estate",
    description:
      "The historic Ilam Tea Estate, started in 1863, is the oldest tea garden of Nepal. Visitors can see how orthodox Ilam tea is plucked, processed and packed, and taste freshly made tea overlooking the estate slopes.",
    location: "Ilam Tea Estate, Ilam Municipality, Ilam",
    category: "Tea Garden",
    bestTimeToVisit: "October to November and March to May",
    entryFee: "NPR 30",
    thingsToDo: [
      "Guided tea estate tour",
      "Visit the tea processing unit",
      "Tea tasting",
      "Photography",
    ],
  },
  {
    name: "Gajurmukhi Temple",
    slug: "gajurmukhi-temple",
    description:
      "Gajurmukhi is an old temple of the goddess Gajurmukhi Devi in eastern Ilam, close to the Mechi river. It is an important pilgrimage site of the district, especially busy during Dashain and other festivals.",
    location: "Gajurmukhi, Ilam",
    category: "Temple and Pilgrimage",
    bestTimeToVisit: "September to November and March to May",
    entryFee: "Free",
    thingsToDo: [
      "Temple visit and pilgrimage",
      "Walk along the Mechi river",
      "Local village walk",
    ],
  },
  {
    name: "Todke Jharna",
    slug: "todke-jharna",
    description:
      "Todke Jharna is a tall waterfall near Todke village on the road to Sandakpur. The cool water, surrounding forest and rocks make it a favourite short stop for travellers heading to the higher hills.",
    location: "Todke, Ilam",
    category: "Waterfall",
    bestTimeToVisit: "June to September (monsoon) and October to November",
    entryFee: "NPR 20",
    thingsToDo: [
      "Enjoy the waterfall",
      "Picnic",
      "Photography",
      "Short forest walk",
    ],
  },

{
    name: "Siddhithumka",
    slug: "siddhithumka",
    description:
      "Siddhithumka is a quiet hill village of Ilam known for homestays and sunrise views over the tea hills. It is a small, peaceful place to stay with local families and experience village life.",
    location: "Siddhithumka, Ilam",
    category: "Village",
    bestTimeToVisit: "October to December and March to May",
    entryFee: "Free",
    thingsToDo: [
      "Village homestay",
      "Sunrise and sunset views",
      "Hiking around the hills",
    ],
  },
  {
    name: "Chhintapu",
    slug: "chhintapu",
    description:
      "Chhintapu, at about 3,363 m, is the second highest peak of Ilam and the highest hill of the Mahabharat range in the district. The trail goes through dense rhododendron forest and offers a Himalayan view on clear days.",
    location: "Chhintapu, Ilam",
    category: "Trekking",
    bestTimeToVisit: "March to April (rhododendron) and October to November",
    entryFee: "Free",
    thingsToDo: [
      "Trekking",
      "Rhododendron forest walk",
      "Himalayan viewpoint",
      "Camping",
    ],
  },
  {
    name: "Pashupatinagar",
    slug: "pashupatinagar",
    description:
      "Pashupatinagar is the border town of eastern Ilam on the road to Darjeeling. The bazaar, tea warehouses and mixed Nepali-Indian culture make it an interesting stop for travellers crossing the Mechi border.",
    location: "Pashupatinagar, Ilam",
    category: "Town",
    bestTimeToVisit: "September to November and March to May",
    entryFee: "Free",
    thingsToDo: [
      "Walk around the border bazaar",
      "Buy local tea and goods",
      "Try local cuisine",
    ],
  },
];

const seedPlaces = async () => {
  try {
    await connectDB();

    // Attach seeded places to an admin account when one exists
    const admin = await User.findOne({ role: "admin" }).select("_id");

    let created = 0;
    let skipped = 0;
    let refreshed = 0;

    for (const place of places) {
      const imageUrl = imageFor(place.slug);
      const existing = await Place.findOne({ slug: place.slug }).select("images");

      if (existing) {
        // keep the seeded photo link in sync without touching other fields
        if (existing.images?.[0] !== imageUrl) {
          existing.images = [imageUrl];
          await existing.save();
          refreshed += 1;
          console.log(`~ image refreshed: ${place.name}`);
        } else {
          skipped += 1;
          console.log(`- skipped (already exists): ${place.name}`);
        }

        continue;
      }

      await Place.create({
        ...place,
        images: [imageUrl],
        createdBy: admin?._id,
      });

      created += 1;
      console.log(`+ created: ${place.name}`);
    }

    const total = await Place.countDocuments();

    console.log("-----------------------------------------------");
    console.log(`Places created: ${created}`);
    console.log(`Images refreshed: ${refreshed}`);
    console.log(`Places skipped: ${skipped}`);
    console.log(`Total places in database: ${total}`);
    console.log("-----------------------------------------------");
  } catch (err) {
    console.error(`Place seeding failed: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

seedPlaces();