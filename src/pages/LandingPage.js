import React, { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import { Spinner } from "flowbite-react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { scroller, Element } from "react-scroll";
import { useLocation } from "react-router-dom";
// Section import
import ExploreSection from "../components/LandingPageComponents/ExploreSection";
import ContactSection from "../components/LandingPageComponents/ContactSection";
import PricingSection from "../components/LandingPageComponents/PricingSection";
import FAQSection from "../components/LandingPageComponents/FAQSection";
import HeroSection from "../components/LandingPageComponents/HeroSection";
import FooterSection from "../components/LandingPageComponents/FooterSection";
import InfoBar from "../components/LandingPageComponents/InfoBar";
import DataStandsApartSection from "../components/LandingPageComponents/DataStandsApartSection";
import UseCasesSection from "../components/LandingPageComponents/UseCasesSection";


export default function LandingPage() {
  // REACT HOOKS
  const [content, setContent] = useState({}); // content to be filled on landing page
  const [apisList, setApisList] = useState([]);
  const [showInfoBar, setShowInfoBar] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();


  // FUNCITONS
  // fetches the list of apis
  const fetchApiList = async () => {
    const result = await axios.get("/apis/list").catch(async (error) => {
      if (error.response.status === 401) {
        logout();
      } else {
        console.log(error.response);
        console.log("Unable to fetch APIs");
      }
    });

    setApisList(result.data.apis);
  };

  // fetches content
  const fetchContent = async () => {
    fetch("./LANDING_PAGE_CONTENT.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        setContent(json);
        setShowInfoBar(json.infoBar.show);
      });
  };

  // USE EFFECT
  useEffect(() => {
    fetchApiList();
    fetchContent();
  }, []);

  useEffect(() => {
  if (location.state && location.state.scrollTo) {
    // Try to scroll after a short delay to ensure sections are rendered
    const scrollToSection = () => {
      const el = document.querySelector(`[name='${location.state.scrollTo}']`);
      if (el) {
        scroller.scrollTo(location.state.scrollTo, {
          duration: 600,
          delay: 0,
          smooth: "easeInOutQuart",
          offset: location.state.scrollTo === "contact" ? -38 : -87,
        });
      } else {
        // If not found, try again shortly (max 10 tries)
        if (scrollToSection.tries < 10) {
          scrollToSection.tries++;
          setTimeout(scrollToSection, 100);
        }
      }
    };
    scrollToSection.tries = 0;
    scrollToSection();
  }
}, [location.state]);
  return (
    <>
      {!content || Object.keys(content) == 0 ? (
        <div className="flex items-center justify-center w-screen h-screen">
          <Spinner aria-label="Left-aligned spinner" size="lg" />
        </div>
      ) : (
        <main className="min-h-screen flex flex-col">
          <Navigation stay={true} />
          {showInfoBar && <InfoBar content={content} setShowInfoBar={setShowInfoBar} />}
          {/* Following are a list of components of the landing page sections */}
          <Element name="hero">
            <HeroSection content={content} />
          </Element>

          <Element name="explore">
            <ExploreSection content={content} apisList={apisList} />
          </Element>

          <Element name="datastandsapart">
            <DataStandsApartSection content={content} />
          </Element>

          <Element name="usecases">
            <UseCasesSection />
          </Element>


          <Element name="pricing">
            <PricingSection content={content} />
          </Element>

          <Element name="faq">
            <FAQSection content={content} />
          </Element>

          <Element name="contact">
            <ContactSection content={content} />
          </Element>
          <FooterSection content={content} />
        </main>
      )}
    </>
  );
}
