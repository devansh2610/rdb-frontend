// ExploreSection

import { Modal } from "flowbite-react";
import recipeDB_logo from "../../assets/recipeDB_logo.png";
import flavorDB_logo from "../../assets/flavorDB_logo.png";
import sustainableDB_logo from "../../assets/sustainableDB_logo.png";
import dietRx_logo from "../../assets/dietRx_logo.png";
import spiceRx_logo from "../../assets/spicerx.jpg.png";
import cocktailDB_logo from "../../assets/cocktailDB.png";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

//add apisList parameter when fetching data from backend
export default function ExploreSection({ content }) {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [showDietRxModal, setShowDietRxModal] = useState(false);
  const [showRecipeDBModal, setShowRecipeDBModal] = useState(false);
  const [showSustainableFoodDBModal, setShowSustainableFoodDBModal] = useState(false);
  const [showFlavorDBModal, setShowFlavorDBModal] = useState(false);
  const [showSpiceRxModal, setShowSpiceRxModal] = useState(false);
  const [showCocktailDBModal, setShowCocktailDBModal] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  // RecipeDB API data for the modal
  const recipeDBData = {
    name: "RecipeDB",
    short_description: "118,000+ recipes from across the globe",
    long_description: "Ingredient composition, quantities, nutrition profiles, cuisines, and other attributes of over 118,000 recipes from 26 world regions.",
    imageUrl: recipeDB_logo,
    link: "#",
    subapis: [
      { name: "recipesinfo" },
      { name: "recipeofday" },
      { name: "recipe-day/with-ingredients-categories" },
      { name: "nutritioninfo" },
      { name: "micronutritioninfo" },
      { name: "recipes/range" },
      { name: "recipes_cuisine/cuisine/{region}" },
      { name: "recipeByTitle" },
      { name: "calories" },
      { name: "region-diet" },
      { name: "recipe-diet" },
      { name: "recipes-by-carbs" },
      { name: "instructions/{recipe_id}" },
      { name: "meal-plan" },
      { name: "ingredients/flavor/{flavor}" },
      { name: "byutensils/utensils" },
      { name: "recipes-method/{method}" },
      { name: "byenergy/energy" },
      { name: "by-ingredients-categories-title" },
      { name: "category" },
      { name: "search-recipe/{id}" },
      { name: "protein-range" },
      { name: "recipe-Day-category" }
    ],
    comingSoon: false
  };

  // FlavorDB API data for the modal
  const flavorDBData = {
    name: "FlavorDB",
    short_description: "Flavors of 24,000+ natural ingredients",
    long_description: "Flavor molecule constitution, taste/odor profiles, nomenclatures, and chemical descriptors of 934 natural ingredients across 36 categories.",
    imageUrl: flavorDB_logo,
    link: "#",
    subapis: [
      { name: "taste-threshold" },
      { name: "synthesis" },
      { name: "by-tradeAssociationGuidelines" },
      { name: "by-naturalOccurrence" },
      { name: "by-nas" },
      { name: "by-jecfa" },
      { name: "by-iofi-categorisation" },
      { name: "by-flNo" },
      { name: "by-fema" },
      { name: "by-einecs" },
      { name: "by-description" },
      { name: "by-coe" },
      { name: "by-coe-approval" },
      { name: "by-aromaThresholdValues" },
      { name: "by-surfaceArea" },
      { name: "by-rotatableBonds" },
      { name: "by-numberOfAtoms" },
      { name: "by-numRings" },
      { name: "by-energy" },
      { name: "by-aromaticRings" },
      { name: "by-aromaticBonds" },
      { name: "by-alogp" },
      { name: "filter-by-weight-range" },
      { name: "filter-by-weight-from" },
      { name: "filter-by-type" },
      { name: "filter-by-hbd-count" },
      { name: "filter-by-hba-count" },
      { name: "by-topologicalPolarSurfaceArea" },
      { name: "by-pubchemId" },
      { name: "by-monoisotopicMass" },
      { name: "by-heavyAtomCount" },
      { name: "by-functionalGroups" },
      { name: "by-flavorProfile" },
      { name: "by-femaFlavorProfile" },
      { name: "by-commonName" },
      { name: "by-natural-source" },
      { name: "by-name-and-category" },
      { name: "by-entity-alias-readable" }
    ],
    comingSoon: false
  };

  // SustainableFoodDB API data for the modal
  const sustainableFoodDBData = {
    name: "SustainableFoodDB",
    short_description: "Environmental impact of 500+ foods",
    long_description: "Detailed data on carbon footprint, water usage, and sustainability indexes for hundreds of food products to promote eco-conscious choices.",
    imageUrl: sustainableDB_logo,
    link: "#",
    subapis: [
      { name: "search" },
      { name: "by-ingredient" },
      { name: "recipe/{id}" },
      { name: "ingredient-cf" },
      { name: "carbon-footprint-sum" },
      { name: "carbon-footprint" },
      { name: "{name}/carbon-footprint-name" }
    ],
    comingSoon: true
  };

  // DietRx API data for the modal
  const dietRxData = {
    name: "DietRx",
    short_description: "Personalized food recommendations for 100+ diseases and health conditions",
    long_description: "A curated database connecting dietary ingredients and food items with clinical evidence for therapeutic use across various health conditions.",
    imageUrl: dietRx_logo,
    link: "#",
    subapis: [
      { name: "gene-source/{foodName}" },
      { name: "all-details" },
      { name: "all-details/{association}" },
      { name: "disease-chemicals/{foodName}" },
      { name: "food/{foodName}" },
      { name: "publication/{foodName}" },
      { name: "food-interactions/{foodName}" },
      { name: "chemical-details/{foodName}" },
      { name: "chemical-lexicon/{foodName}" },
      { name: "disease/ctd_disease/{foodName}" },
      { name: "disease/diseaselexicon/{foodName}" },
      { name: "disease/publicationsDisease/{diseaseName}" },
      { name: "disease/{diseaseName}" }
    ],
    comingSoon: true
  };

  // SpiceRx API data for the modal
  const spiceRxData = {
    name: "SpiceRx",
    short_description: "Phytochemical-disease associations for spices",
    long_description: "Comprehensive database of phytochemical-disease associations, spice-disease relationships, and chemical property data for spices and medicinal plants.",
    imageUrl: spiceRx_logo,
    link: "#",
    subapis: [
      { name: "search_plants" },
      { name: "chemical_details" },
      { name: "get_disease" },
      { name: "search_diseases" },
      { name: "cd_associations" },
      { name: "chemicals" }
    ],
    comingSoon: false
  };

  // CocktailDB API data for the modal
  const cocktailDBData = {
    name: "CocktailDB",
    short_description: "Cocktail recipes with ingredients & nutrition",
    long_description: "Comprehensive database of cocktail recipes with detailed ingredient information, nutritional data, preparation instructions, and filtering capabilities by rating, time, category, and dietary preferences.",
    imageUrl: cocktailDB_logo,
    link: "#",
    subapis: [
      { name: "rating" },
      { name: "votes" },
      { name: "prepTime" },
      { name: "cookTime" },
      { name: "totalTime" },
      { name: "Servings" },
      { name: "Cooking_Action" },
      { name: "categories" },
      { name: "Name" },
      { name: "CocktailId/{id}" },
      { name: "MinMax" },
      { name: "metadata" },
      { name: "AllIngredients" },
      { name: "getNutritonsOfCocktail" },
      { name: "ingredientSearch" },
      { name: "ingredientSubstitutes" },
      { name: "ingredients" },
      { name: "imageID/{imageId}" },
      { name: "diet" }
    ],
    comingSoon: false
  };

  const apisList = [
    {
      _id: "1",
      name: "RecipeDB",
      subapis: [
        { name: "recipesinfo" },
        { name: "recipeofday" },
        { name: "recipe-day/with-ingredients-categories" },
        { name: "nutritioninfo" },
        { name: "micronutritioninfo" },
        { name: "recipes/range" },
        { name: "recipes_cuisine/cuisine/{region}" },
        { name: "recipeByTitle" },
        { name: "calories" },
        { name: "region-diet" },
        { name: "recipe-diet" },
        { name: "recipes-by-carbs" },
        { name: "instructions/{recipe_id}" },
        { name: "meal-plan" },
        { name: "ingredients/flavor/{flavor}" },
        { name: "byutensils/utensils" },
        { name: "recipes-method/{method}" },
        { name: "byenergy/energy" },
        { name: "by-ingredients-categories-title" },
        { name: "category" },
        { name: "search-recipe/{id}" },
        { name: "protein-range" },
        { name: "recipe-Day-category" },
      ],

    },
    {
      _id: "2",
      name: "FlavorDB",
      subapis: [
        { name: "taste-threshold" },
        { name: "synthesis" },
        { name: "by-tradeAssociationGuidelines" },
        { name: "by-naturalOccurrence" },
        { name: "by-nas" },
        { name: "by-jecfa" },
        { name: "by-iofi-categorisation" },
        { name: "by-flNo" },
        { name: "by-fema" },
        { name: "by-einecs" },
        { name: "by-description" },
        { name: "by-coe" },
        { name: "by-coe-approval" },
        { name: "by-aromaThresholdValues" },
        { name: "by-surfaceArea" },
        { name: "by-rotatableBonds" },
        { name: "by-numberOfAtoms" },
        { name: "by-numRings" },
        { name: "by-energy" },
        { name: "by-aromaticRings" },
        { name: "by-aromaticBonds" },
        { name: "by-alogp" },
        { name: "filter-by-weight-range" },
        { name: "filter-by-weight-from" },
        { name: "filter-by-type" },
        { name: "filter-by-hbd-count" },
        { name: "filter-by-hba-count" },
        { name: "by-topologicalPolarSurfaceArea" },
        { name: "by-pubchemId" },
        { name: "by-monoisotopicMass" },
        { name: "by-heavyAtomCount" },
        { name: "by-functionalGroups" },
        { name: "by-flavorProfile" },
        { name: "by-femaFlavorProfile" },
        { name: "by-commonName" },
        { name: "by-natural-source" },
        { name: "by-name-and-category" },
        { name: "by-entity-alias-readable" },
      ],

    },
    {
      _id: "3",
      name: "SustainableFoodDB",
      subapis: [
        { name: "search" },
        { name: "by-ingredient" },
        { name: "recipe/{id}" },
        { name: "ingredient-cf" },
        { name: "carbon-footprint-sum" },
        { name: "carbon-footprint" },
        { name: "{name}/carbon-footprint-name" },
      ],

    },
    {
      _id: "4",
      name: "DietRx",
      subapis: [
        { name: "gene-source/{foodName}" },
        { name: "all-details" },
        { name: "all-details/{association}" },
        { name: "disease-chemicals/{foodName}" },
        { name: "food/{foodName}" },
        { name: "publication/{foodName}" },
        { name: "food-interactions/{foodName}" },
        { name: "chemical-details/{foodName}" },
        { name: "chemical-lexicon/{foodName}" },
        { name: "disease/ctd_disease/{foodName}" },
        { name: "disease/diseaselexicon/{foodName}" },
        { name: "disease/publicationsDisease/{diseaseName}" },
        { name: "disease/{diseaseName}" },
      ],

    },
  ];



  useEffect(() => {
    AOS.init({
      duration: 700,      // animation duration
      offset: 100,        // trigger point from the top
      once: true,         // animate only once
      easing: 'ease-in-out',
    });
  }, []);

  const apiCardsData = [
    {
      id: "recipedb",
      name: "RecipeDB",
      description: "118,000+ recipes from across the globe",
      image: recipeDB_logo,
      bgColor: "bg-white",
      textColor: "text-black",
      accentColor: "bg-green-100",
      comingSoon: false,
      link: ""
    },
    {
      id: "flavordb",
      name: "FlavorDB",
      description: "Flavors of 24,000+ natural ingredients",
      image: flavorDB_logo,
      // bgColor: "bg-gradient-to-br from-green-400 to-green-500",
      // textColor: "text-white",
      // accentColor: "bg-green-600",
      bgColor: "bg-[#BDE958]",   // 👈 solid custom background
      textColor: "text-black",   // 👈 black text for contrast
      accentColor: "bg-black",   // 👈 adjust accent if you want


      comingSoon: false,
      link: ""
    },

    {

      id: "sustainablefooddb",
      name: "SustainableFoodDB",
      description: "Environmental impact of 500+ foods",
      image: sustainableDB_logo,
      bgColor: "bg-[#BDE958]",   // 👈 solid custom background
      textColor: "text-black",   // 👈 black text for contrast
      accentColor: "bg-black",   // 👈 adjust accent if you want
      comingSoon: true,
      link: "#"
    },
    {
      id: "dietrxdb",
      name: "DietRx",
      description: "Food recommendations for 100+ diseases",
      image: dietRx_logo,
      bgColor: "bg-gradient-to-br from-purple-500 to-pink-500",
      textColor: "text-white",
      accentColor: "bg-purple-600",
      comingSoon: true,
      link: "#"
    },
    {
      id: "spicerx",
      name: "SpiceRx",
      description: "Phytochemical-disease associations for spices",
      image: spiceRx_logo,
      bgColor: "bg-gradient-to-br from-orange-400 to-red-500",
      textColor: "text-white",
      accentColor: "bg-orange-600",
      comingSoon: false,
      link: "#"
    },
    {
      id: "cocktaildb",
      name: "CocktailDB",
      description: "Cocktail recipes with ingredients & nutrition",
      image: cocktailDB_logo,
      bgColor: "bg-gradient-to-br from-pink-400 to-purple-500",
      textColor: "text-white",
      accentColor: "bg-pink-600",
      comingSoon: false,
      link: "#"
    }
  ];

  // Handle the "Try it now" button click
  const handleTryItNowClick = (e) => {
    e.preventDefault();

    // Check if user is logged in
    const token = getToken();

    if (token && token !== 0) {
      // User is logged in, navigate to playground
      navigate("/playground");
    } else {
      // Show login message
      setShowLoginMessage(true);

      // Optional: automatically hide message after some time
      setTimeout(() => {
        setShowLoginMessage(false);
      }, 5000); // Hide after 5 seconds
    }
  };

  // Handle the Playground button click in API modals
  const handlePlaygroundClick = (apiName) => {
    const token = getToken();
    const apiNameLower = apiName.toLowerCase();

    // For RecipeDB, FlavorDB, SpiceRx, and CocktailDB - check authentication and navigate
    if (apiNameLower === 'recipedb' || apiNameLower === 'flavordb' || apiNameLower === 'spicerx' || apiNameLower === 'cocktaildb') {
      if (token && token !== 0) {
        // User is logged in, navigate to specific playground
        navigate(`/playground/${apiNameLower}`);
      } else {
        // User is not logged in, redirect to login page
        navigate('/login');
      }
    }
    // For SustainableFoodDB and DietRxDB - show coming soon modal
    else if (apiNameLower === 'sustainablefooddb' || apiNameLower === 'dietrxdb') {
      setShowComingSoonModal(true);
    }
  };

  return (
    <section id="about" className="bg-white py-12 sm:py-16 lg:py-20 xl:py-24">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-[1600px]">
        <div data-aos="fade-up">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mb-16 text-center lg:text-left">
            {/* Heading */}
            <h1
              className="font-bold text-[#213d34]"
              style={{
                fontFamily: "'Sometype Mono', monospace",
                fontSize: '48px',
                lineHeight: 'normal',
                letterSpacing: 'normal'
              }}
            >
              Explore APIs
            </h1>

            {/* Diagonal Line Separator */}
            <div className="hidden lg:block text-4xl text-gray-300 mx-4">/</div>

            {/* Description */}
            <p
              className="text-[#213d34] max-w-full lg:max-w-[500px]"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '16px',
                lineHeight: '1.5',
                fontWeight: '400'
              }}
            >
              Extensive APIs for traditional recipes, nutrition profiles, flavor molecules of natural ingredients, health associations, and carbon footprints.
            </p>
          </div>

          {/* API Cards Grid */}
          <div className="flex flex-col gap-8 sm:gap-10 lg:gap-12 xl:gap-14 items-center">
            {/* First Row - RecipeDB and FlavorDB */}
            <div className="flex flex-col md:flex-row gap-8 sm:gap-10 lg:gap-12 xl:gap-14 w-full justify-center items-stretch">
              {/* RecipeDB Card */}
              <motion.div
                data-aos="fade-up"
                className="bg-white border-[3px] border-[#191a23] rounded-[35px] lg:rounded-[40px] p-8 lg:p-10 flex flex-col-reverse sm:flex-row items-center justify-between overflow-hidden cursor-pointer w-full max-w-[480px] hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                onClick={() => setShowRecipeDBModal(true)}
              >
                {/* Left Content */}
                <div className="flex flex-col gap-4 w-full sm:w-auto flex-1">
                  {/* Heading */}
                  <div className="flex flex-col gap-2">
                    <p className="font-medium text-[24px] text-black" style={{ fontFamily: "'Jost', sans-serif" }}>
                      RecipeDB
                    </p>
                    <p className="font-normal text-[14px] text-black leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      118,000+ recipes from<br className="hidden sm:block" />across the globe
                    </p>
                  </div>
                  {/* Learn More Button */}
                  <div className="flex items-center gap-3">
                    <div className="w-[40px] h-[40px] rounded-full bg-[#191a23] flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-[#BDE958] -rotate-45" />
                    </div>
                    <p className="font-normal text-[14px] text-black" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Learn more
                    </p>
                  </div>
                </div>
                {/* Right Image */}
                <div className="w-[140px] h-[140px] lg:w-[160px] lg:h-[160px] rounded-[20px] overflow-hidden bg-white flex items-center justify-center mb-6 sm:mb-0 sm:ml-4">
                  <img src={recipeDB_logo} alt="RecipeDB" className="w-full h-full object-contain p-3" />
                </div>
              </motion.div>

              {/* FlavorDB Card */}
              <motion.div
                data-aos="fade-up"
                data-aos-delay="100"
                className="bg-[#BDE958] border-[3px] border-[#191a23] rounded-[35px] lg:rounded-[40px] p-8 lg:p-10 flex flex-col-reverse sm:flex-row items-center justify-between overflow-hidden cursor-pointer w-full max-w-[480px] hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                onClick={() => setShowFlavorDBModal(true)}
              >
                {/* Left Content */}
                <div className="flex flex-col gap-4 w-full sm:w-auto flex-1">
                  {/* Heading */}
                  <div className="flex flex-col gap-2">
                    <div className="bg-white px-2 rounded-lg w-fit">
                      <p className="font-medium text-[24px] text-black" style={{ fontFamily: "'Jost', sans-serif" }}>
                        FlavorDB
                      </p>
                    </div>
                    <div className="bg-white px-2 rounded-lg w-fit">
                      <p className="font-normal text-[14px] text-black leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        Flavors of 24,000+<br className="hidden sm:block" />natural ingredients
                      </p>
                    </div>
                  </div>
                  {/* Learn More Button */}
                  <div className="flex items-center gap-3">
                    <div className="w-[40px] h-[40px] rounded-full bg-[#191a23] flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-[#BDE958] -rotate-45" />
                    </div>
                    <p className="font-normal text-[14px] text-black" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Learn more
                    </p>
                  </div>
                </div>
                {/* Right Image */}
                <div className="w-[140px] h-[140px] lg:w-[160px] lg:h-[160px] rounded-[20px] overflow-hidden bg-white flex items-center justify-center mb-6 sm:mb-0 sm:ml-4">
                  <img src={flavorDB_logo} alt="FlavorDB" className="w-full h-full object-contain p-3" />
                </div>
              </motion.div>
            </div>

            {/* Second Row - SustainableFoodDB and DietRxDB */}
            <div className="flex flex-col md:flex-row gap-8 sm:gap-10 lg:gap-12 xl:gap-14 w-full justify-center items-stretch">
              {/* SustainableFoodDB Card */}
              <motion.div
                data-aos="fade-up"
                data-aos-delay="200"
                className="bg-[#BDE958] border-[3px] border-[#191a23] rounded-[35px] lg:rounded-[40px] p-8 lg:p-10 flex flex-col-reverse sm:flex-row items-center justify-between overflow-hidden cursor-pointer w-full max-w-[480px] hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                onClick={() => setShowSustainableFoodDBModal(true)}
              >
                {/* Left Content */}
                <div className="flex flex-col gap-4 w-full sm:w-auto flex-1">
                  {/* Heading */}
                  <div className="flex flex-col gap-2">
                    <div className="bg-white px-2 rounded-lg w-fit">
                      <p className="font-medium text-[24px] text-black" style={{ fontFamily: "'Jost', sans-serif" }}>
                        SustainableFoodDB
                      </p>
                    </div>
                    <div className="bg-white px-2 rounded-lg w-fit">
                      <p className="font-normal text-[14px] text-black leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        Environmental impact<br className="hidden sm:block" />of 500+ foods
                      </p>
                    </div>
                  </div>
                  {/* Coming Soon */}
                  <div>
                    <p className="font-normal text-[14px] text-black" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Coming Soon
                    </p>
                  </div>
                </div>
                {/* Right Image */}
                <div className="w-[140px] h-[140px] lg:w-[160px] lg:h-[160px] rounded-[20px] overflow-hidden bg-white flex items-center justify-center mb-6 sm:mb-0 sm:ml-4">
                  <img src={sustainableDB_logo} alt="SustainableFoodDB" className="w-full h-full object-contain p-3" />
                </div>
              </motion.div>

              {/* DietRxDB Card */}
              <motion.div
                data-aos="fade-up"
                data-aos-delay="300"
                className="bg-[#191a23] border-[3px] border-[#191a23] rounded-[35px] lg:rounded-[40px] p-8 lg:p-10 flex flex-col-reverse sm:flex-row items-center justify-between overflow-hidden cursor-pointer w-full max-w-[480px] hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                onClick={() => setShowDietRxModal(true)}
              >
                {/* Left Content */}
                <div className="flex flex-col gap-4 w-full sm:w-auto flex-1">
                  {/* Heading */}
                  <div className="flex flex-col gap-2">
                    <div className="bg-white px-2 rounded-lg w-fit">
                      <p className="font-medium text-[24px] text-black" style={{ fontFamily: "'Jost', sans-serif" }}>
                        DietRxDB
                      </p>
                    </div>
                    <div className="bg-white px-2 rounded-lg w-fit">
                      <p className="font-normal text-[14px] text-black leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        Food recommendations<br className="hidden sm:block" />for 100+ diseases
                      </p>
                    </div>
                  </div>
                  {/* Coming Soon */}
                  <div>
                    <p className="font-normal text-[14px] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Coming Soon
                    </p>
                  </div>
                </div>
                {/* Right Image */}
                <div className="w-[140px] h-[140px] lg:w-[160px] lg:h-[160px] rounded-[20px] overflow-hidden bg-white flex items-center justify-center mb-6 sm:mb-0 sm:ml-4">
                  <img src={dietRx_logo} alt="DietRxDB" className="w-full h-full object-contain p-3" />
                </div>
              </motion.div>
            </div>

            {/* Third Row - SpiceRx */}
            <div className="flex flex-col lg:flex-row justify-center items-center gap-6 lg:gap-8 w-full">
              {/* SpiceRx Card */}
              <motion.div
                data-aos="fade-up"
                data-aos-delay="100"
                className="bg-gradient-to-br from-orange-400 to-red-500 border-[3px] border-[#191a23] rounded-[35px] lg:rounded-[40px] p-8 lg:p-10 flex flex-col-reverse sm:flex-row items-center justify-between overflow-hidden cursor-pointer w-full max-w-[480px] hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                onClick={() => setShowSpiceRxModal(true)}
              >
                {/* Left Content */}
                <div className="flex flex-col gap-4 w-full sm:w-auto flex-1">
                  {/* Heading */}
                  <div className="flex flex-col gap-2">
                    <div className="bg-white px-2 rounded-lg w-fit">
                      <p className="font-medium text-[24px] text-black" style={{ fontFamily: "'Jost', sans-serif" }}>
                        SpiceRx
                      </p>
                    </div>
                    <div className="bg-white px-2 rounded-lg w-fit">
                      <p className="font-normal text-[14px] text-black leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        Phytochemical-disease<br className="hidden sm:block" />associations for spices
                      </p>
                    </div>
                  </div>
                  {/* Learn more link */}
                  <div className="flex items-center gap-1 hover:underline hover:underline-offset-4 w-fit">
                    <p className="font-normal text-[14px] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Learn more
                    </p>
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                </div>
                {/* Right Image */}
                <div className="w-[140px] h-[140px] lg:w-[160px] lg:h-[160px] rounded-[20px] overflow-hidden bg-white flex items-center justify-center mb-6 sm:mb-0 sm:ml-4">
                  <img src={spiceRx_logo} alt="SpiceRx" className="w-full h-full object-contain p-3" />
                </div>
              </motion.div>

              {/* CocktailDB Card */}
              <motion.div
                data-aos="fade-up"
                data-aos-delay="200"
                className="bg-gradient-to-br from-pink-400 to-purple-500 border-[3px] border-[#191a23] rounded-[35px] lg:rounded-[40px] p-8 lg:p-10 flex flex-col-reverse sm:flex-row items-center justify-between overflow-hidden cursor-pointer w-full max-w-[480px] hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                onClick={() => setShowCocktailDBModal(true)}
              >
                {/* Left Content */}
                <div className="flex flex-col gap-4 w-full sm:w-auto flex-1">
                  {/* Heading */}
                  <div className="flex flex-col gap-2">
                    <div className="bg-white px-2 rounded-lg w-fit">
                      <p className="font-medium text-[24px] text-black" style={{ fontFamily: "'Jost', sans-serif" }}>
                        CocktailDB
                      </p>
                    </div>
                    <div className="bg-white px-2 rounded-lg w-fit">
                      <p className="font-normal text-[14px] text-black leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        8,600+ cocktail recipes with<br className="hidden sm:block" />ingredients & nutrition
                      </p>
                    </div>
                  </div>
                  {/* Learn more link */}
                  <div className="flex items-center gap-1 hover:underline hover:underline-offset-4 w-fit">
                    <p className="font-normal text-[14px] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Learn more
                    </p>
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                </div>
                {/* Right Image */}
                <div className="w-[140px] h-[140px] lg:w-[160px] lg:h-[160px] rounded-[20px] overflow-hidden bg-white flex items-center justify-center mb-6 sm:mb-0 sm:ml-4">
                  <img src={cocktailDB_logo} alt="CocktailDB" className="w-full h-full object-contain p-3" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* DietRx Modal */}
      <Modal
        show={showDietRxModal}
        onClose={() => setShowDietRxModal(false)}
        size="7xl"
        dismissible
        className="backdrop-blur-md"
      >
        <div className="p-0 bg-black rounded-lg max-h-[90vh] flex flex-col overflow-hidden">
          {/* Close button */}
          <button
            onClick={() => setShowDietRxModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            style={{ fontSize: '40px', lineHeight: '1' }}
          >
            ×
          </button>

          {/* Header with DietRxDB title on black background */}
          <div className="bg-black px-4 sm:px-6 md:px-8 py-4 md:py-6 text-center flex-shrink-0">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold"
              style={{
                color: '#BDE958',
                fontFamily: "'Sometype Mono', monospace"
              }}
            >
              DietRxDB
            </h1>
          </div>

          <div className="bg-black px-4 sm:px-6 md:px-8 pb-6 md:pb-8 overflow-y-auto flex-1">

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">

              {/* Left side */}
              <div className="lg:col-span-2 space-y-3 md:space-y-4">
                {/* Header Card with Logo and Title */}
                <div className="flex items-center gap-3 p-3 md:p-4 rounded-2xl md:rounded-3xl" style={{ backgroundColor: '#BDE958' }}>
                  <div className="bg-white p-2 rounded-full">
                    <img src={dietRx_logo} alt="DietRxDB" className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <span className="text-sm md:text-base font-semibold" style={{ color: '#2d3748', fontFamily: "system-ui, -apple-system, sans-serif" }}>
                    DietRxDB API
                  </span>
                </div>

                {/* Try demo section */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3">
                    Try the demo of DietRxDB API
                  </h3>
                  <button
                    onClick={() => handlePlaygroundClick('dietrxdb')}
                    className="px-4 md:px-5 py-2 rounded-full font-semibold transition-all duration-200 text-xs md:text-sm"
                    style={{ backgroundColor: '#BDE958', color: '#2d3748' }}
                  >
                    Playground →
                  </button>
                </div>

                {/* Description section */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5">
                  <p className="text-gray-700 leading-relaxed text-xs md:text-sm">
                    {dietRxData.long_description}
                  </p>
                </div>
              </div>

              {/* Right side - API Endpoints section */}
              <div className="lg:col-span-3 bg-white rounded-2xl md:rounded-3xl p-4 md:p-6" style={{ backgroundColor: '#f5f5f5' }}>
                <h3 className="text-sm md:text-base font-semibold mb-4 md:mb-5 text-center" style={{ color: '#5a5a5a' }}>
                  API Endpoints
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-2.5 max-h-[400px] overflow-y-auto pr-2">
                  {dietRxData.subapis.map((api, index) => (
                    <button
                      key={index}
                      className="px-2 py-2 text-xs border rounded-lg hover:border-gray-400 transition-colors duration-200 text-center"
                      style={{
                        minHeight: '38px',
                        fontSize: '10px',
                        lineHeight: '1.3',
                        backgroundColor: '#ffffff',
                        borderColor: '#d0d0d0',
                        color: '#3a3a3a',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        overflow: 'hidden'
                      }}
                      title={api.name}
                    >
                      {api.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* SpiceRx Modal */}
      <Modal
        show={showSpiceRxModal}
        onClose={() => setShowSpiceRxModal(false)}
        size="7xl"
        dismissible
        className="backdrop-blur-md"
      >
        <div className="p-0 bg-black rounded-lg">
          {/* Close button */}
          <button
            onClick={() => setShowSpiceRxModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            style={{ fontSize: '40px', lineHeight: '1' }}
          >
            ×
          </button>

          {/* Header with SpiceRx title on black background */}
          <div className="bg-black px-4 sm:px-6 md:px-8 py-6 md:py-8 text-center">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-8"
              style={{
                color: '#BDE958',
                fontFamily: "'Sometype Mono', monospace"
              }}
            >
              SpiceRx
            </h1>
          </div>

          <div className="bg-black px-4 sm:px-6 md:px-8 pb-6 md:pb-8">

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 h-full">

              {/* Left side */}
              <div className="lg:col-span-2 space-y-3 md:space-y-4">
                {/* Header Card with Logo and Title */}
                <div className="flex items-center gap-3 p-3 md:p-4 rounded-2xl md:rounded-3xl" style={{ backgroundColor: '#BDE958' }}>
                  <div className="bg-white p-2 rounded-full">
                    <img src={spiceRx_logo} alt="SpiceRx" className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <span className="text-sm md:text-base font-semibold" style={{ color: '#2d3748', fontFamily: "system-ui, -apple-system, sans-serif" }}>
                    SpiceRx API
                  </span>
                </div>

                {/* Try demo section */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3">
                    Try the demo of SpiceRx API
                  </h3>
                  <button
                    onClick={() => handlePlaygroundClick('spicerx')}
                    className="px-4 md:px-5 py-2 rounded-full font-semibold transition-all duration-200 text-xs md:text-sm"
                    style={{ backgroundColor: '#BDE958', color: '#2d3748' }}
                  >
                    Playground →
                  </button>
                </div>

                {/* Description section */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5">
                  <p className="text-gray-700 leading-relaxed text-xs md:text-sm">
                    {spiceRxData.long_description}
                  </p>
                </div>
              </div>

              {/* Right side - API Endpoints section */}
              <div className="lg:col-span-3 bg-white rounded-2xl md:rounded-3xl p-4 md:p-6" style={{ backgroundColor: '#f5f5f5' }}>
                <h3 className="text-sm md:text-base font-semibold mb-4 md:mb-5 text-center" style={{ color: '#5a5a5a' }}>
                  API Endpoints
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-2.5">
                  {spiceRxData.subapis.map((api, index) => (
                    <button
                      key={index}
                      className="px-2 py-2 text-xs border rounded-lg hover:border-gray-400 transition-colors duration-200 text-center"
                      style={{
                        minHeight: '38px',
                        fontSize: '10px',
                        lineHeight: '1.3',
                        backgroundColor: '#ffffff',
                        borderColor: '#d0d0d0',
                        color: '#3a3a3a',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        overflow: 'hidden'
                      }}
                      title={api.name}
                    >
                      {api.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* RecipeDB Modal */}
      <Modal
        show={showRecipeDBModal}
        onClose={() => setShowRecipeDBModal(false)}
        size="6xl"
        dismissible
      >
        <div className="bg-black rounded-lg overflow-hidden relative max-h-[90vh] flex flex-col">
          {/* Close Button - Top Right Corner - White X without background circle */}
          <button
            onClick={() => setShowRecipeDBModal(false)}
            className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-all duration-200"
            aria-label="Close modal"
            style={{
              fontSize: '40px',
              lineHeight: '1',
              fontWeight: 'bold',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ×
          </button>

          {/* Header with RecipeDB title on black background */}
          <div className="bg-black px-4 sm:px-6 md:px-8 py-4 md:py-6 text-center flex-shrink-0">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold"
              style={{
                color: '#BDE958',
                fontFamily: "'Sometype Mono', monospace"
              }}
            >
              RecipeDB
            </h1>
          </div>

          {/* Scrollable Main content area */}
          <div className="bg-black px-4 sm:px-6 md:px-8 pb-6 md:pb-8 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">

              {/* Left side - Green section with rounded corners (2/5 width) */}
              <div className="lg:col-span-2 space-y-3 md:space-y-4">
                {/* Logo and title section */}
                <div
                  className="flex items-center gap-3 p-3 md:p-4 rounded-2xl md:rounded-3xl"
                  style={{ backgroundColor: '#BDE958' }}
                >
                  <div className="bg-white p-2 rounded-full">
                    <img src={recipeDB_logo} alt="RecipeDB" className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <span
                    className="text-sm md:text-base font-semibold"
                    style={{
                      color: '#2d3748',
                      fontFamily: "system-ui, -apple-system, sans-serif"
                    }}
                  >
                    RecipeDB API
                  </span>
                </div>

                {/* Try demo section */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3">
                    Try the demo of RecipeDB API
                  </h3>
                  <button
                    onClick={() => handlePlaygroundClick('recipedb')}
                    className="px-4 md:px-5 py-2 rounded-full font-semibold transition-all duration-200 text-xs md:text-sm"
                    style={{
                      backgroundColor: '#BDE958',
                      color: '#2d3748'
                    }}
                  >
                    Playground →
                  </button>
                </div>

                {/* Description section */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5">
                  <p className="text-gray-700 leading-relaxed text-xs md:text-sm">
                    Ingredient composition, quantities, nutrition profiles, cuisines, and other attributes of over 118,000 recipes from 26 world regions.
                  </p>
                </div>
              </div>

              {/* Right side - API Endpoints section (3/5 width) */}
              <div className="lg:col-span-3 bg-white rounded-2xl md:rounded-3xl p-4 md:p-6" style={{ backgroundColor: '#f5f5f5' }}>
                <h3 className="text-sm md:text-base font-semibold mb-4 md:mb-5 text-center" style={{ color: '#5a5a5a' }}>
                  API Endpoints
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-2.5 max-h-[400px] overflow-y-auto pr-2">
                  {recipeDBData.subapis.map((api, index) => (
                    <button
                      key={index}
                      className="px-2 py-2 text-xs border rounded-lg hover:border-gray-400 transition-colors duration-200 text-center"
                      style={{
                        minHeight: '38px',
                        fontSize: '10px',
                        lineHeight: '1.3',
                        backgroundColor: '#ffffff',
                        borderColor: '#d0d0d0',
                        color: '#3a3a3a',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        overflow: 'hidden'
                      }}
                      title={api.name}
                    >
                      {api.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* SustainableFoodDB Modal */}
      <Modal
        show={showSustainableFoodDBModal}
        onClose={() => setShowSustainableFoodDBModal(false)}
        size="7xl"
        dismissible
        className="backdrop-blur-md"
      >
        <div className="p-0 bg-black rounded-lg max-h-[90vh] flex flex-col overflow-hidden">
          {/* Close button */}
          <button
            onClick={() => setShowSustainableFoodDBModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            style={{ fontSize: '40px', lineHeight: '1' }}
          >
            ×
          </button>

          {/* Header with SustainableFoodDB title */}
          <div className="bg-black px-4 sm:px-6 md:px-8 py-4 md:py-6 text-center flex-shrink-0">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold"
              style={{
                color: '#BDE958',
                fontFamily: "'Sometype Mono', monospace"
              }}
            >
              SustainableFoodDB
            </h1>
          </div>

          <div className="bg-black px-4 sm:px-6 md:px-8 pb-6 md:pb-8 overflow-y-auto flex-1">

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">

              {/* Left side */}
              <div className="lg:col-span-2 space-y-3 md:space-y-4">
                {/* Header Card */}
                <div className="flex items-center gap-3 p-3 md:p-4 rounded-2xl md:rounded-3xl" style={{ backgroundColor: '#BDE958' }}>
                  <div className="bg-white p-2 rounded-full">
                    <img src={sustainableDB_logo} alt="SustainableFoodDB" className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <span className="text-sm md:text-base font-semibold" style={{ color: '#2d3748', fontFamily: "system-ui, -apple-system, sans-serif" }}>
                    SustainableFoodDB API
                  </span>
                </div>

                {/* Try demo section */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3">
                    Try the demo of SustainableFoodDB API
                  </h3>
                  <button
                    onClick={() => handlePlaygroundClick('sustainablefooddb')}
                    className="px-4 md:px-5 py-2 rounded-full font-semibold transition-all duration-200 text-xs md:text-sm"
                    style={{ backgroundColor: '#BDE958', color: '#2d3748' }}
                  >
                    Playground →
                  </button>
                </div>

                {/* Description section */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5">
                  <p className="text-gray-700 leading-relaxed text-xs md:text-sm">
                    {sustainableFoodDBData.long_description}
                  </p>
                </div>
              </div>

              {/* Right side - API Endpoints section */}
              <div className="lg:col-span-3 bg-white rounded-2xl md:rounded-3xl p-4 md:p-6" style={{ backgroundColor: '#f5f5f5' }}>
                <h3 className="text-sm md:text-base font-semibold mb-4 md:mb-5 text-center" style={{ color: '#5a5a5a' }}>
                  API Endpoints
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-2.5 max-h-[400px] overflow-y-auto pr-2">
                  {sustainableFoodDBData.subapis.map((api, index) => (
                    <button
                      key={index}
                      className="px-2 py-2 text-xs border rounded-lg hover:border-gray-400 transition-colors duration-200 text-center"
                      style={{
                        minHeight: '38px',
                        fontSize: '10px',
                        lineHeight: '1.3',
                        backgroundColor: '#ffffff',
                        borderColor: '#d0d0d0',
                        color: '#3a3a3a',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        overflow: 'hidden'
                      }}
                      title={api.name}
                    >
                      {api.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* FlavorDB Modal */}
      <Modal
        show={showFlavorDBModal}
        onClose={() => setShowFlavorDBModal(false)}
        size="7xl"
        dismissible
        className="backdrop-blur-md"
      >
        <div className="p-0 bg-black rounded-lg max-h-[90vh] flex flex-col overflow-hidden">
          {/* Close button */}
          <button
            onClick={() => setShowFlavorDBModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            style={{ fontSize: '40px', lineHeight: '1' }}
          >
            ×
          </button>

          <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1">
            {/* Title - Center Aligned */}
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#BDE958] mb-6 md:mb-8 text-center flex-shrink-0"
              style={{ fontFamily: 'Sometype Mono, monospace' }}
            >
              FlavorDB
            </h2>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
              {/* Left Column - Header Card with Logo & Demo */}
              <div className="lg:col-span-2 space-y-3 md:space-y-4">
                {/* Header Card with Logo and Title */}
                <div className="rounded-2xl md:rounded-3xl p-4 md:p-6 flex items-center gap-3 md:gap-4" style={{ backgroundColor: '#BDE958' }}>
                  <img src={flavorDB_logo} alt="FlavorDB" className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white p-2" />
                  <span className="text-lg md:text-2xl font-bold text-gray-800">FlavorDB API</span>
                </div>

                {/* Demo Card */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6">
                  <h3 className="text-center text-sm md:text-lg font-medium mb-3 md:mb-4" style={{ color: '#5a5a5a' }}>
                    Try the demo of FlavorDB API
                  </h3>
                  <div className="flex justify-center">
                    <button
                      onClick={() => handlePlaygroundClick('flavordb')}
                      className="px-4 md:px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:opacity-90 transition-opacity text-xs md:text-sm"
                      style={{ backgroundColor: '#BDE958', color: '#2d2d2d' }}
                    >
                      Playground →
                    </button>
                  </div>
                </div>

                {/* Description Card */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5">
                  <p className="text-xs md:text-sm leading-relaxed" style={{ color: '#5a5a5a' }}>
                    {flavorDBData.long_description}
                  </p>
                </div>
              </div>

              {/* Right Column - API Endpoints */}
              <div className="lg:col-span-3">
                <div className="rounded-xl md:rounded-2xl p-4 md:p-6" style={{ backgroundColor: '#f5f5f5' }}>
                  <h3 className="text-sm md:text-lg font-semibold mb-3 md:mb-4 text-center" style={{ color: '#5a5a5a' }}>
                    API Endpoints
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-2.5 max-h-[400px] overflow-y-auto pr-2">
                    {flavorDBData.subapis.map((api, index) => (
                      <button
                        key={index}
                        className="text-left px-2 md:px-3 py-2 rounded-lg border transition-colors hover:shadow-sm"
                        style={{
                          backgroundColor: '#ffffff',
                          borderColor: '#d0d0d0',
                          color: '#3a3a3a',
                          fontSize: '10px',
                          minHeight: '38px',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word'
                        }}
                      >
                        {api.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* CocktailDB Modal */}
      <Modal
        show={showCocktailDBModal}
        onClose={() => setShowCocktailDBModal(false)}
        size="7xl"
        dismissible
        className="backdrop-blur-md"
      >
        <div className="p-0 bg-black rounded-lg">
          {/* Close button */}
          <button
            onClick={() => setShowCocktailDBModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            style={{ fontSize: '40px', lineHeight: '1' }}
          >
            ×
          </button>

          {/* Header with CocktailDB title on black background */}
          <div className="bg-black px-4 sm:px-6 md:px-8 py-6 md:py-8 text-center">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-8"
              style={{
                color: '#FF6B9D',
                fontFamily: "'Sometype Mono', monospace"
              }}
            >
              CocktailDB
            </h1>
          </div>

          <div className="bg-black px-4 sm:px-6 md:px-8 pb-6 md:pb-8">

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 h-full">

              {/* Left side */}
              <div className="lg:col-span-2 space-y-3 md:space-y-4">
                {/* Header Card with Logo and Title */}
                <div className="flex items-center gap-3 p-3 md:p-4 rounded-2xl md:rounded-3xl" style={{ backgroundColor: '#FF6B9D' }}>
                  <div className="bg-white p-2 rounded-full">
                    <img src={cocktailDB_logo} alt="CocktailDB" className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <span className="text-sm md:text-base font-semibold" style={{ color: 'white', fontFamily: "system-ui, -apple-system, sans-serif" }}>
                    CocktailDB API
                  </span>
                </div>

                {/* Try demo section */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3">
                    Try the demo of CocktailDB API
                  </h3>
                  <button
                    onClick={() => handlePlaygroundClick('cocktaildb')}
                    className="px-4 md:px-5 py-2 rounded-full font-semibold transition-all duration-200 text-xs md:text-sm text-white"
                    style={{ backgroundColor: '#FF6B9D' }}
                  >
                    Playground →
                  </button>
                </div>

                {/* Description section */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5">
                  <p className="text-gray-700 leading-relaxed text-xs md:text-sm">
                    {cocktailDBData.long_description}
                  </p>
                </div>
              </div>

              {/* Right side - API Endpoints section */}
              <div className="lg:col-span-3 bg-white rounded-2xl md:rounded-3xl p-4 md:p-6" style={{ backgroundColor: '#f5f5f5' }}>
                <h3 className="text-sm md:text-base font-semibold mb-4 md:mb-5 text-center" style={{ color: '#5a5a5a' }}>
                  API Endpoints
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-2.5">
                  {cocktailDBData.subapis.map((api, index) => (
                    <button
                      key={index}
                      className="px-2 py-2 text-xs border rounded-lg hover:border-gray-400 transition-colors duration-200 text-center"
                      style={{
                        minHeight: '38px',
                        fontSize: '10px',
                        lineHeight: '1.3',
                        backgroundColor: '#ffffff',
                        borderColor: '#d0d0d0',
                        color: '#3a3a3a',
                        fontFamily: "'DM Sans', sans-serif",
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        wordBreak: 'break-word',
                        overflow: 'hidden'
                      }}
                      title={api.name}
                    >
                      {api.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Coming Soon Modal */}
      <Modal
        show={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        size="md"
        dismissible
        className="backdrop-blur-sm"
      >
        <div className="p-0 bg-white rounded-2xl">
          {/* Close button */}
          <button
            onClick={() => setShowComingSoonModal(false)}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors z-10"
            style={{ fontSize: '32px', lineHeight: '1' }}
          >
            ×
          </button>

          <div className="p-10">
            {/* Icon/Illustration */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#BDE958] flex items-center justify-center">
                <svg className="w-10 h-10 text-[#191a23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2
              className="text-3xl font-bold text-[#191a23] mb-4 text-center"
              style={{ fontFamily: "'Sometype Mono', monospace" }}
            >
              Coming Soon
            </h2>

            {/* Message */}
            <p className="text-gray-600 text-base leading-relaxed text-center mb-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              This API playground is currently under development and will be available soon.
              Stay tuned for updates!
            </p>

            {/* Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowComingSoonModal(false)}
                className="px-8 py-3 rounded-full font-semibold transition-all duration-200 hover:opacity-90 hover:scale-105"
                style={{ backgroundColor: '#BDE958', color: '#191a23', fontFamily: "'DM Sans', sans-serif" }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </section >
  );
}
