import logo_2 from "../../assets/logo_2.png";
import { Link } from "react-router-dom";

export default function FooterSection() {
  return (
    <footer className="bg-[#1D1D1D] py-8 w-full font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-10 md:gap-y-0 md:gap-x-20 items-start">
          {/* Logo + Description */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <img src={logo_2} className="h-12 w-auto mr-3 bg-[#1c1c1c] rounded-lg p-1" alt="Foodoscope Logo" />
              <span className="text-2xl font-bold flex items-center" style={{fontFamily: 'Inter, sans-serif'}}>
                <span style={{ color: "#04c389" }}>Foodo</span>
                <span className="ml-0.5" style={{ color: "#fff" }}>scope</span>
                <span style={{ color: "#04c389" }}>.</span>
              </span>
            </div>
            <p className="text-sm text-white tracking-tight leading-snug max-w-[270px] md:max-w-[320px]">
              We are a deep-tech company making food computable through science and structured data. Our APIs power innovation across food, recipes, flavor, nutrition, health, and sustainability.
            </p>
          </div>

          {/* Legal */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-base mb-2 text-white">Legal</h3>
            <ul className="space-y-1 text-base">
              <li>
                <Link to="/termsandcondition" className="text-white hover:text-[#04c389] transition-colors font-normal">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white hover:text-[#04c389] transition-colors font-normal">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-white hover:text-[#04c389] transition-colors font-normal">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/cancellation-refund" className="text-white hover:text-[#04c389] transition-colors font-normal">Cancellation & Refunds</Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-base mb-2 text-white">Company</h3>
            <ul className="space-y-1 text-base">
              <li>
                <a href="https://cosylab.iiitd.edu.in/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#04c389] transition-colors font-normal">CoSyLab</a>
              </li>
              <li>
                <Link to="/about" className="text-white hover:text-[#04c389] transition-colors font-normal">About Us</Link>
              </li>
              <li>
                <Link to="/contact-us" className="text-white hover:text-[#04c389] transition-colors font-normal">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-base mb-2 text-white">Socials</h3>
            <div className="flex flex-col gap-4 mt-1">
              <a href="https://linkedin.com/company/foodoscope" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#04c389] transition-colors flex items-center">
                <svg width="28" height="28" viewBox="0 0 24 24" className="mr-0 md:mr-2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/foodoscope_api/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#04c389] transition-colors flex items-center">
                <svg width="28" height="28" viewBox="0 0 24 24" className="mr-0 md:mr-2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="currentColor"/>
                </svg>
              </a>
              <a href="https://x.com/foodoscopetech" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#04c389] transition-colors flex items-center">
                <svg width="28" height="28" viewBox="0 0 24 24" className="mr-0 md:mr-2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        {/* Footer Bottom */}
        <div className="mt-10 text-center text-xs text-gray-400">
          © 2025 Foodoscope Technologies Pvt. Ltd.
        </div>
      </div>
    </footer>
  );
}
