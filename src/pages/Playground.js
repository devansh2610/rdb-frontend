import { useEffect } from "react";
import Navigation from "../components/Navigation";
import { Spinner } from "flowbite-react";
import PlaygroundModal from "../modals/PlaygroundModal";
import recipeDB_logo from "../assets/recipeDB_logo.png";
import flavorDB_logo from "../assets/flavorDB_logo.png";
import sustainableDB_logo from "../assets/sustainableDB_logo.png";
import dietRx_logo from "../assets/dietRx_logo.png";
import spiceRx_logo from "../assets/spicerx.jpg.png";
import cocktailDB_logo from "../assets/cocktailDB.png";

export default function Playground() {
  useEffect(() => {
    // Store the current theme state
    const wasDark = document.documentElement.classList.contains('dark');

    // Force remove dark mode
    document.documentElement.classList.remove('dark');

    // Cleanup: Restore theme state when leaving the page
    return () => {
      if (wasDark) {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  const db_cards = {
    recipeDB: {
      name: "RecipeDB",
      short_description: "118,000+ recipes from across the globe.",
      image: recipeDB_logo,
      route: "recipedb",
      comingSoon: false
    },
    flavorDB: {
      name: "FlavorDB",
      short_description: "Flavor profiles of ~1,000 natural ingredients.",
      image: flavorDB_logo,
      route: "flavordb",
      comingSoon: false
    },
    spiceRx: {
      name: "SpiceRx",
      short_description: "Phytochemical-disease associations.",
      image: spiceRx_logo,
      route: "spicerx",
      comingSoon: false
    },
    cocktailDB: {
      name: "CocktailDB",
      short_description: "8,600+ cocktail recipes with ingredients & nutrition.",
      image: cocktailDB_logo,
      route: "cocktaildb",
      comingSoon: false
    },
    SustainableDB: {
      name: "SustainableDB",
      short_description: "Environmental impact for 500+ foods",
      image: sustainableDB_logo,
      route: "",
      comingSoon: true
    },
    DietRx: {
      name: "DietRxDB",
      short_description: "Food recommendations for 100+ diseases.",
      image: dietRx_logo,
      route: "",
      comingSoon: true
    }
  };

  return (
    <div className="flex flex-col w-full h-full min-h-screen dark:bg-gray-900 bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-rose-100 to-teal-100 dark:from-slate-900 dark:to-slate-800">
      <Navigation stay={true} />
      <div className="bg-white dark:bg-gray-900 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 mx-0 sm:mx-4 md:mx-8 lg:mx-12 xl:mx-20 my-8 sm:my-12 md:my-20 lg:my-32 py-10">
        <div className="container px-4 sm:px-6 py-8 sm:py-12 mx-auto">
          <h1 className="text-2xl text-center md:text-start font-semibold text-gray-800 capitalize lg:text-3xl dark:text-white">
            Playground
          </h1>
          <p className="mt-4 text-gray-500 xl:mt-6 dark:text-gray-300 text-center md:text-start">
            Experiment, explore, and integrate a wide range of APIs for traditional recipes, nutrition data, flavor molecules, health correlations, and carbon footprints of natural ingredients.
          </p>
          {Object.keys(db_cards).length === 0 ? (
            <div className="flex items-center justify-center w-full h-48">
              <Spinner aria-label="Loading..." size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8 lg:mt-12">
              {Object.values(db_cards).map((db, index) => (
                <PlaygroundModal
                  key={index}
                  name={db.name}
                  short_description={db.short_description}
                  imageUrl={db.image}
                  route={db.route}
                  comingSoon={db.comingSoon}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}