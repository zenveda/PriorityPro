import seedAiSdrFeatures from "./seed-data";

// Run the seed function
seedAiSdrFeatures()
  .then(features => {
    console.log(`Successfully seeded ${features.length} AI SDR features!`);
    process.exit(0);
  })
  .catch(error => {
    console.error("Error seeding data:", error);
    process.exit(1);
  });