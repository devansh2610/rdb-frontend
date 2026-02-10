// 
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { submitDeveloperContact, createOrder } from "../../api/profileService";
import PhoneNumberInput from "../profile/common/PhoneNumberInput";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { X, CreditCard, Zap, Shield, Star } from 'lucide-react';
import plansBackground from '../../assets/Plans (1).png';

export default function PricingSection({ content }) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const token = getToken();
  const isLoggedIn = !!token;



  // Subscription state
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [tokenCount, setTokenCount] = useState(1000);
  const [isAnimating, setIsAnimating] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);



  const openSubscribeModal = () => {
    setTokenCount(20000);
    setSubscribeModalOpen(true);
    setIsAnimating(false);
  };

  // Handler for closing subscribe modal with animation
  const closeSubscribeModal = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setSubscribeModalOpen(false);
      setIsAnimating(false);
    }, 300);
  };

  // Handler for Pay Now (Razorpay integration placeholder)
  // const handlePayNow = () => {
  //   const finalPrice = tokenCount * 3;
  //   // Integrate Razorpay here
  //   alert(`Proceeding to pay $${finalPrice} for ${tokenCount} tokens`);
  // };

  const handlePayNow = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    try {
      // Ensure Razorpay script is loaded
      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Please check your internet connection.");
        return;
      }
      const order = await createOrder(finalPrice);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const userEmail = userInfo?.email || "";
      const options = {
        key: order.keyId,
        amount: order.amount, // in paise
        currency: order.currency,
        name: "Foodoscope",
        description: "Developer Plus Plan",
        order_id: order.orderId,
        handler: function (response) {
          // Optionally, poll backend for payment status here
          // alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
          setPaymentSuccess(true);
          try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
            const prevTokens = parseInt(userInfo.tokens) || 0;
            const newTokens = prevTokens + tokenCount;
            userInfo.tokens = newTokens;
            localStorage.setItem("userInfo", JSON.stringify(userInfo));
            localStorage.setItem("current_tokens", newTokens);

            // Dispatch token update event
            const event = new CustomEvent("TOKEN_UPDATE_EVENT", {
              detail: { tokens: newTokens }
            });
            window.dispatchEvent(event);
          } catch (e) {
            // Fallback: just dispatch event
            const event = new CustomEvent("TOKEN_UPDATE_EVENT", {});
            window.dispatchEvent(event);
          }
        },
        prefill: {
          email: userEmail,
        },
        theme: { color: "#3399cc" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Failed to initiate payment: " + (err?.response?.data?.error || err.message));
    }
  };

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organizationName: "",
    contactNumber: "",
    query: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Basic email regex for validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Phone number validation
  const phoneRegex = /^\d{10}$/;

  // Validate required fields
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.organizationName.trim()) newErrors.organizationName = "Organisation Name is required";

    if (!formData.query.trim()) newErrors.query = "Query is required";

    return newErrors;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setApiError("");
    setIsSubmitting(true);

    try {
      // Call the API
      await submitDeveloperContact(
        formData.name,
        formData.email,
        formData.organizationName,
        formData.contactNumber,
        formData.query
      );

      // Show success message
      setSubmitted(true);
      setIsSubmitting(false);
    } catch (error) {
      // Handle API error
      setIsSubmitting(false);
      if (error.response && error.response.data && error.response.data.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError("Failed to submit your query. Please try again later.");
      }
    }
  };

  // Open modal handler for Contact Us button
  const openContactModal = () => {
    setFormData({
      name: "",
      email: "",
      organizationName: "",
      contactNumber: "",
      query: "",
    });
    setErrors({});
    setSubmitted(false);
    setApiError("");
    setModalOpen(true);
  };

  // Close modal handler
  const closeModal = () => {
    setModalOpen(false);
  };

  // Subscribe modal features
  const features = [
    { icon: Zap, text: "Lightning-fast API responses" },
    { icon: Shield, text: "Priority support & reliability" },
    { icon: Star, text: "Advanced model access" }
  ];

  // Calculate pricing for subscribe modal
  const basePrice = tokenCount * 0.05;
  // const discount = getDiscountPercentage();
  // const discountAmount = (basePrice * discount) / 100;
  // const finalPrice = basePrice - discountAmount;
  const finalPrice = basePrice;

  return (
    <section
      id="pricing"
      className="py-20 px-4 relative min-h-screen"
      style={{
        backgroundImage: `url("${plansBackground}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#111112',
        // overlay using backgroundBlendMode via inline style requires layering; we'll add a subtle overlay div inside for reliability
      }}
    >
  {/* overlay removed to allow background image to show through */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <h2 
              className="text-5xl md:text-6xl font-bold"
              style={{ fontFamily: 'Sometype Mono, monospace', color: '#BDE958' }}
            >
              Plans
            </h2>
          </div>
          <p 
            className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Find your perfect plan;<br />tailored for every need
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-white rounded-3xl p-8 shadow-lg transform transition-all duration-300 hover:scale-105"
               style={{ border: '1px solid #0f2b20' }}>
            <div className="text-center mb-6">
              <h3
                className="text-2xl font-semibold text-[#0f2b20] mb-2"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Starter Plan
              </h3>
              <p className="text-sm text-[#0f2b20]/70 mb-4">Trial For Everyone</p>
              <div className="text-4xl font-bold text-[#0f2b20] mb-1">₹0</div>
            </div>

            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-[#0f2b20]/70">
                Best For: <span className="text-green-500">Trial For Everyone</span>
              </p>
            </div>

            <ul className="space-y-3 mb-8 text-[#0f2b20]">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                200 complimentary tokens
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Rate Limiting : 25 req/min
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Limited usage per month
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Basic support
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Not intended for commercial use
              </li>
            </ul>

            <button
              onClick={() => isLoggedIn ? null : navigate("/login")}
              className="mx-auto block px-8 py-3 bg-green-500 text-white rounded-lg font-semibold shadow hover:bg-green-600 transition duration-200"
              style={{ fontFamily: 'DM Sans, sans-serif', minWidth: '160px' }}
            >
              {isLoggedIn ? 'Current Plan' : 'Start Free Trial'}
            </button>
          </div>

          {/* Developer Plus - Highlighted */}
          <div 
            className="rounded-3xl p-8 shadow-2xl transform transition-all duration-300 hover:scale-105 relative flex flex-col justify-between"
            style={{ backgroundColor: '#BDE958', border: '2px solid #0f2b20' }}
          >
            <div className="text-center mb-6">
              <h3 
                className="text-2xl font-semibold text-[#0f2b20] mb-2"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Developer Plus
              </h3>
              <p className="text-sm text-[#0f2b20]/70 mb-4">For Researchers and Developers</p>
 <div className="text-3xl font-bold text-[#0f2b20] mb-1">₹1000 </div>
              <p className="text-[#0f2b20]/80">per 20000 token</p>
            </div>

            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-[#0f2b20]/70">
                Best For: <span className="text-green-500">Developers and researchers who wants to use the API for personal use</span>
              </p>
            </div>

            <ul className="space-y-4 mb-8 text-[#0f2b20] text-sm">
              <li className="flex items-start">
                <span className="text-green-500 mr-3">✓</span>
                Pay-as-you-go tokens
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3">✓</span>
                Limited usage per month
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3">✓</span>
                Rate Limiting : 50 req/min
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3">✓</span>
                Analytics and usage insights upto 2 weeks
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3">✓</span>
                Dedicated support via email and phone
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3">✓</span>
                Not permitted for commercial redistribution or production use
              </li>
            </ul>

            <div className="mt-4">
              <button 
                onClick={openSubscribeModal}
                className="mx-auto block px-8 py-3 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white rounded-lg font-semibold transition duration-150"
                style={{ fontFamily: 'DM Sans, sans-serif', minWidth: '180px' }}
              >
                Subscribe Now
              </button>
            </div>
          </div>

          {/* Enterprise Suite */}
          <div className="bg-white rounded-3xl p-8 shadow-lg transform transition-all duration-300 hover:scale-105"
               style={{ border: '1px solid #0f2b20' }}>
            <div className="text-center mb-6">
              <h3
                className="text-2xl font-semibold text-[#0f2b20] mb-2"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Enterprise Suite
              </h3>
              <p className="text-sm text-[#0f2b20]/70 mb-4">For Businesses and Enterprises</p>
              
            </div>

            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-[#0f2b20]/70">
                Best For: <span className="text-green-500">Large business and enterprises</span>
              </p>
            </div>

            <ul className="space-y-3 mb-8 text-[#0f2b20]">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Pay-as-you-go tokens with custom high volume plans
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                No Rate Limiting
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Analytics and usage insights upto 4 weeks
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Custom usage limits based on requirements
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Dedicated support via email, phone and video conference
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Custom feature development and onboarding assistance
              </li>
            </ul>

            <button
              onClick={isLoggedIn ? openContactModal : () => navigate("/login")}
              className="mx-auto block px-8 py-3 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white rounded-lg font-semibold transition duration-200"
              style={{ fontFamily: 'DM Sans, sans-serif', minWidth: '160px' }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Contact Us Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md p-4 relative shadow-lg shadow-gray-300/50 dark:shadow-black/50">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
              aria-label="Close modal"
            >
              &#x2715;
            </button>

            {!submitted ? (
              <>
                <h1 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">
                  Contact Us
                </h1>

                {apiError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                    {apiError}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4 text-sm">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block mb-1 text-gray-700 dark:text-gray-300">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full rounded-lg border ${errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "" : ""}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block mb-1 text-gray-700 dark:text-gray-300">
                      Email ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "" : ""}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Organisation */}
                  <div>
                    <label htmlFor="organizationName" className="block mb-1 text-gray-700 dark:text-gray-300">
                      Organisation Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Your Organisation"
                      id="organizationName"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      className={`w-full rounded-lg border ${errors.organizationName ? "border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.organizationName ? "" : ""}`}
                    />
                    {errors.organizationName && <p className="text-red-500 text-xs mt-1">{errors.organizationName}</p>}
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label htmlFor="contactNumber" className="block mb-1 text-gray-700 dark:text-gray-300">
                      Contact Number
                    </label>
                    <PhoneNumberInput
                      value={formData.contactNumber}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          contactNumber: value || "",
                        }))
                      }
                      defaultCountry="IN"
                      placeholder="Your mobile number"
                      className={errors.contactNumber ? "border-red-500" : ""}
                    />
                    {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
                  </div>

                  {/* Query */}
                  <div>
                    <label htmlFor="query" className="block mb-1 text-gray-700 dark:text-gray-300">
                      Your Query <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Type your query here..."
                      id="query"
                      name="query"
                      rows="3"
                      value={formData.query}
                      onChange={handleChange}
                      className={`w-full rounded-lg border ${errors.query ? "border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.query ? "" : ""}`}
                    ></textarea>
                    {errors.query && <p className="text-red-500 text-xs mt-1">{errors.query}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-2 px-4 text-center bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </form>
              </>
            ) : (
              <div className="py-8 text-center">
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-4 inline-block">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Thank You!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your query has been submitted successfully. Our team will contact you shortly.
                </p>
                <button
                  onClick={closeModal}
                  className="py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Improved Subscribe Modal */}
      {subscribeModalOpen && (
        
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-300 ${isAnimating ? 'bg-opacity-0' : 'bg-opacity-60'
          }`}>
          <div 
            className={`rounded-2xl w-full max-w-lg mx-4 relative overflow-hidden transition-all duration-300 transform ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}
            style={{ backgroundColor: '#2d2d2d' }}
          >

            {/* Gradient Header */}
            <div className="p-6 text-white relative" style={{ background: 'linear-gradient(135deg, #1D1D1D 0%, #3a3a3a 100%)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <div className="w-full h-full rounded-full transform translate-x-8 -translate-y-8" style={{ backgroundColor: '#BDE958' }}></div>
              </div>
              <button
                onClick={closeSubscribeModal}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <h2 
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: 'Sometype Mono, monospace', color: '#BDE958' }}
              >
                Developer Plus
              </h2>
              <p 
                className="text-gray-300 text-sm"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Supercharge your development workflow
              </p>
            </div>

            <div className="p-6">
              {/* Features */}
              <div className="mb-6">
                <div className="grid gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#BDE958' }}
                      >
                        <feature.icon size={16} style={{ color: '#1D1D1D' }} />
                      </div>
                      <span 
                        className="text-gray-300"
                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Token Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label 
                    className="text-gray-300 font-medium"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    Select Tokens
                  </label>
                  {/* Remove discount badge */}
                </div>

                {/* Custom Slider */}
                <div className="relative mb-4">
                  <input
                    type="range"
                    min="20000"
                    max="30000"
                    step="1000"
                    value={tokenCount}
                    onChange={(e) => setTokenCount(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #BDE958 0%, #BDE958 ${((tokenCount - 20000) / 10000) * 100}%, #4a4a4a ${((tokenCount - 20000) / 10000) * 100}%, #4a4a4a 100%)`
                    }}
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>20000</span>
                    <span>25000</span>
                    <span>30000</span>
                  </div>
                </div>

                <div 
                  className="rounded-lg p-4 text-center"
                  style={{ backgroundColor: '#3a3a3a' }}
                >
                  <div 
                    className="text-3xl font-bold text-white mb-1"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {tokenCount.toLocaleString()} tokens
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: '#BDE958', fontFamily: 'DM Sans, sans-serif' }}
                    >
                      ₹{finalPrice}
                    </span>
                  </div>
                  {/* Remove discount info */}
                  <div 
                    className="text-xs text-gray-400 mt-1"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    ₹0.05 per token
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayNow}
                className="w-full py-3 text-black rounded-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  backgroundColor: '#BDE958',
                  fontFamily: 'DM Sans, sans-serif'
                }}
              >
                <CreditCard size={18} />
                Pay Now
              </button>

              {/* Trust Indicators */}
              <div 
                className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                <div className="flex items-center gap-1">
                  <Shield size={12} />
                  <span>Secure Payment</span>
                </div>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <span>Cancel Anytime</span>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <span>Dedicated Support</span>
              </div>
            </div>
          </div>

          <style jsx>{`
            .slider::-webkit-slider-thumb {
              appearance: none;
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: #3b82f6;
              cursor: pointer;
              box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
              transition: all 0.2s ease;
            }
            
            .slider::-webkit-slider-thumb:hover {
              transform: scale(1.1);
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
            }
            
            .slider::-moz-range-thumb {
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: #3b82f6;
              cursor: pointer;
              border: none;
              box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
            }
          `}</style>
        </div>
      )}

      {paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md p-4 relative shadow-lg shadow-gray-300/50 dark:shadow-black/50">
            <button
              onClick={() => setPaymentSuccess(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
              aria-label="Close modal"
            >
              &#x2715;
            </button>
            <div className="py-8 text-center">
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-4 inline-block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Payment of ₹{finalPrice} has been Successful!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {tokenCount} tokens has been credited to your account.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Thank you for your purchase. You can now use your tokens.
              </p>
              <button
                onClick={() => setPaymentSuccess(false)}
                className="py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}