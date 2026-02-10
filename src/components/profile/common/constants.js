// Define country codes for dropdown
export const countryCodes = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+52", flag: "🇲🇽", name: "Mexico" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+66", flag: "🇹🇭", name: "Thailand" },
  { code: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "+56", flag: "🇨🇱", name: "Chile" },
  { code: "+57", flag: "🇨🇴", name: "Colombia" },
  { code: "+64", flag: "🇳🇿", name: "New Zealand" },
  { code: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" }
];

// Map of ISO country codes to dialing codes for use with PhoneNumberInput
export const countryISO = {
  IN: "+91", // India
  US: "+1", // United States
  GB: "+44", // United Kingdom
  AU: "+61", // Australia
  CN: "+86", // China
  FR: "+33", // France
  DE: "+49", // Germany
  JP: "+81", // Japan
  RU: "+7", // Russia
  BR: "+55", // Brazil
  AE: "+971", // UAE
  SG: "+65", // Singapore
  KR: "+82", // South Korea
  IT: "+39", // Italy
  ES: "+34", // Spain
  MX: "+52", // Mexico
  SA: "+966", // Saudi Arabia
  ZA: "+27", // South Africa
  NG: "+234", // Nigeria
  EG: "+20", // Egypt
  MY: "+60", // Malaysia
  TH: "+66", // Thailand
  ID: "+62", // Indonesia
  AR: "+54", // Argentina
  CL: "+56", // Chile
  CO: "+57", // Colombia
  NZ: "+64", // New Zealand
  PH: "+63", // Philippines
  PK: "+92", // Pakistan
  BD: "+880" // Bangladesh
};

// Helper function to get country code from phone number
export const getCountryFromPhone = (phoneNumber) => {
  if (!phoneNumber) return null;
  
  // Try to find a matching country code
  const foundCountry = countryCodes.find(country => 
    phoneNumber.startsWith(country.code)
  );
  
  if (foundCountry) {
    // Convert to ISO format for the PhoneInput component
    for (const [key, value] of Object.entries(countryISO)) {
      if (value === foundCountry.code) {
        return key;
      }
    }
  }
  
  return "IN"; // Default to India if no match found
}; 