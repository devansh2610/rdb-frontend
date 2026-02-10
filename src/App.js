// App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import { createBrowserHistory } from "history";
import { NotificationsProvider } from "./context/NotificationsContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CancellationRefundPage from "./pages/CancellationRefundPage";

// Public Info Pages
import PricingPlansPage from "./pages/PricingPlansPage"; 
import ContactUsPage from "./pages/ContactUsPage";
import AboutPage from "./pages/AboutPage";
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ShippingPolicyPage from "./pages/ShippingPolicyPage";

// Auth & Core Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminDashboard from "./pages/AdminDashboard";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ForgotPage from "./pages/ForgotPage";
import VerificationPage from "./pages/VerificationPage";
import ProfilePage from "./pages/ProfilePage";

// Apps & Tools
import Playground from "./pages/Playground";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import RecipeDbPlayground from "./pages/RecipeDbPlayground";
import FlavorDbPlayground from "./pages/FlavorDbPlayground";
import SpiceRxPlayground from "./pages/SpiceRxPlayground";
import CocktailDbPlayground from "./pages/CocktailDbPlayground";
import RecipeDb2 from "./pages/RecipeDb2.0";
import SustainableDb from "./pages/SustainableDb";
import FlavorDb2 from "./pages/FlavorDb2.0";
import DietRx from "./pages/DietRx";
import ScrollToTop from "./components/ScrollToTop";

// Auth Route Protection
import PrivateRoute from "./functions/PrivateRoute";

export const history = createBrowserHistory({
  basename: process.env.PUBLIC_URL,
});

function App() {
  return (
    <>
      <ScrollToTop />
      <NotificationsProvider>
        <div>
          <Routes>
            {/* 🔓 Public Static Pages */}

            <Route path="/pricing" element={<PricingPlansPage />} />
            <Route path="/shipping-policy" element={<ShippingPolicyPage />} />

            <Route path="/contact-us" element={<ContactUsPage />} />
            <Route
              path="/cancellation-refund"
              element={<CancellationRefundPage />}
            />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/termsandcondition"
              element={<TermsAndConditionsPage />}
            />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />

            {/* 🔒 Authenticated Pages */}
            <Route element={<PrivateRoute />}>
              {/* <Route path="user" element={<UserDashboard />} exact /> */}
              <Route path="admin" element={<AdminDashboard />} exact />
              <Route path="profile" element={<ProfilePage />} exact />
              <Route path="playground" element={<Playground />} exact />
              <Route path="analytics" element={<AnalyticsDashboard />} exact />
              <Route
                path="playground/recipedb/*"
                element={<RecipeDb2 />}
                exact
              />
              <Route
                path="playground/flavordb/*"
                element={<FlavorDb2 />}
                exact
              />
              <Route
                path="playground/spicerx"
                element={<SpiceRxPlayground />}
                exact
              />
              <Route
                path="playground/cocktaildb"
                element={<CocktailDbPlayground />}
                exact
              />
              {/* Optional routes below */}
              {/* <Route path="playground/recipedb/*" element={<RecipeDbPlayground />} exact /> */}
              {/* <Route path="playground/sustainabledb/*" element={<SustainableDb />} exact /> */}
              {/* <Route path="playground/flavordb/*" element={<FlavorDbPlayground />} exact /> */}
              {/* <Route path="playground/dietrx/*" element={<DietRx />} exact /> */}
            </Route>

            {/* 🔓 Auth & Landing Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="verify/*" element={<VerificationPage />} />
            <Route path="resetpassword/*" element={<ResetPasswordPage />} />
            <Route path="forgot/" element={<ForgotPage />} />
            <Route path="notfound" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{ zIndex: 9999 }}
          />
        </div>
      </NotificationsProvider>
    </>
  );
}

export default App;
