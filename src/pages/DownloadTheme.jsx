import React, { useState } from "react";
import PublicIcon from "@mui/icons-material/Public";
import CodeIcon from "@mui/icons-material/Code";
import PeopleIcon from "@mui/icons-material/People";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import Container from "../components/Container";
import JSZip from "jszip";

const DownloadTheme = () => {
  const [step, setStep] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [logo, setLogo] = useState(null);
  const [colors, setColors] = useState({
    primary: "#14213D",
    secondary: "#EF233C",
    accent: "#D90429",
    background: "#F8F9FA",
  });

  const products = [
    {
      id: "api",
      name: "API",
      icon: CodeIcon,
      description: "For API integration into their existing system",
      learnMore: "#",
    },
    {
      id: "mobile",
      name: "Mobile App",
      icon: LocalPhoneIcon,
      description: "For mobile applications (iOS/Android)",
      learnMore: "#",
    },
    {
      id: "web",
      name: "Web App",
      icon: PublicIcon,
      description: "For web applications (browsers)",
      learnMore: "#",
    },
    {
      id: "reseller",
      name: "Reseller",
      icon: PeopleIcon,
      description: "For setting up reseller-specific configurations",
      learnMore: "#",
    },
  ];

  const handleProductSelect = (product) => {
    setSelectedProducts((prev) => {
      const isSelected = prev.some((p) => p.id === product.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo({ file, preview: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (key, value) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleDownload = async () => {
    const zip = new JSZip();

    // Add package.json with all required dependencies
    zip.file(
      "package.json",
      JSON.stringify(
        {
          name: "monty-esim-website",
          private: true,
          version: "1.0.0",
          type: "module",
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview",
          },
          dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0",
            "react-router-dom": "^6.8.0",
            "@headlessui/react": "^1.7.18",
            i18next: "^23.10.1",
            "i18next-browser-languagedetector": "^7.2.0",
            "react-i18next": "^14.1.0",
            formik: "^2.4.5",
            yup: "^1.3.3",
            "date-fns": "^3.3.1",
          },
          devDependencies: {
            "@vitejs/plugin-react": "^4.0.0",
            autoprefixer: "^10.4.18",
            postcss: "^8.4.35",
            tailwindcss: "^3.4.1",
            vite: "^5.0.0",
          },
        },
        null,
        2
      )
    );

    // Add configuration files
    zip.file(
      "vite.config.js",
      `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()]
});`
    );

    zip.file(
      "tailwind.config.js",
      `
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '${colors.primary}',
        secondary: '${colors.secondary}',
        accent: '${colors.accent}',
        background: '${colors.background}',
      },
    },
  },
  plugins: [],
};`
    );

    zip.file(
      "postcss.config.js",
      `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`
    );

    // Add .env file with necessary variables
    zip.file(
      ".env",
      `
VITE_APP_TITLE=Monty eSIM
VITE_API_URL=https://api.example.com
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_GA_TRACKING_ID=your_ga_tracking_id
`
    );

    // Add .env.example file
    zip.file(
      ".env.example",
      `
VITE_APP_TITLE=Monty eSIM
VITE_API_URL=https://api.example.com
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_GA_TRACKING_ID=your_ga_tracking_id
`
    );

    // Add comprehensive README with detailed instructions
    zip.file(
      "README.md",
      `
# Monty eSIM Website

A modern, responsive web application for managing eSIM services built with React, Vite, and TailwindCSS.

## Features

- 🎨 Custom theme with your brand colors
- 📱 Fully responsive design
- 🌐 Multi-language support
- 🔒 Authentication system
- 💳 eSIM management
- 📊 Dashboard interface

## Tech Stack

- React 18
- Vite
- TailwindCSS
- React Router
- i18next
- Formik & Yup


## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v16 or higher)
- npm (v7 or higher)

## Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd monty-esim-website
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Update the .env file with your configuration

5. Start development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open http://localhost:5173 in your browser

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build

## Project Structure

\`\`\`
monty-esim-website/
├── public/              # Static files
│   ├── components/     # Reusable components
│   │   └── Icons.jsx  # Icons for the components
│   ├── pages/         # Page components
│   │   └── dashboard/ # Dashboard pages
│   │       └── Home.jsx  # Home page component
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # Entry point
│   └── index.css      # Global styles
├── .env               # Environment variables
├── package.json       # Dependencies and scripts
├── tailwind.config.js # TailwindCSS configuration
└── vite.config.js     # Vite configuration
\`\`\`

## Customization

### Colors
The theme uses these custom colors that you selected:
- Primary: ${colors.primary}
- Secondary: ${colors.secondary}
- Accent: ${colors.accent}
- Background: ${colors.background}

You can modify these in \`tailwind.config.js\`.

### Logo
${
  logo
    ? `Your custom logo is located in \`public/logo.${logo.file.name
        .split(".")
        .pop()}\``
    : "You can add your logo in the public directory"
}

## Development

### Adding New Pages
1. Create new page component in \`src/pages\`
2. Add route in \`src/App.jsx\`
3. Update navigation if needed

### Styling
- Uses TailwindCSS for styling
- Custom classes can be added in \`src/index.css\`
- Theme customization in \`tailwind.config.js\`

## Deployment

Build for production:
\`\`\`bash
npm run build
\`\`\`

The \`dist\` directory will contain the built files ready for deployment.

## Support

For support, email support@example.com or create an issue in the repository.

## License

MIT License - feel free to use this code for your own projects.
`
    );

    // Add source files
    const src = zip.folder("src");

    // Add logo if exists
    if (logo?.file) {
      const logoExt = logo.file.name.split(".").pop();
      const logoBuffer = await logo.file.arrayBuffer();
      zip.file(`public/logo.${logoExt}`, logoBuffer);
    }

    // Add index.html with dynamic title and logo
    zip.file(
      "index.html",
      `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="${
      logo ? `/logo.${logo.file.name.split(".").pop()}` : "/vite.svg"
    }" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Monty eSIM</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
    );

    // Add main entry files
    src.file(
      "App.jsx",
      `
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Plans from './pages/Plans';
import HowItWorks from './pages/HowItWorks';
import Partnership from './pages/Partnership';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import SignIn from './pages/SignIn';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Dashboard pages
import Esim from './pages/dashboard/Esim';
import Orders from './pages/dashboard/Orders';
import Wallet from './pages/dashboard/Wallet';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/partnership" element={<Partnership />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          
          {/* Dashboard routes */}
          <Route path="/dashboard/esim" element={<Esim />} />
          <Route path="/dashboard/orders" element={<Orders />} />
          <Route path="/dashboard/wallet" element={<Wallet />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;`
    );

    src.file(
      "main.jsx",
      `
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)`
    );

    src.file(
      "index.css",
      `
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background-color: ${colors.background};
}
`
    );

    // Add all components
    const components = src.folder("components");

    // Add all the component files from the current project
    [
      "AuthLayout.jsx",
      "AuthNavbar.jsx",
      "Container.jsx",
      "Footer.jsx",
      "LanguageSwitcher.jsx",
      "Navbar.jsx",
      "NotificationsMenu.jsx",
      "OtpVerification.jsx",
      "UserMenu.jsx",
    ].forEach((file) => {
      components.file(
        file,
        document.querySelector(`[data-file="src/components/${file}"]`)
          ?.textContent || ""
      );
    });

    // Add all pages
    const pages = src.folder("pages");
    const dashboardPages = pages.folder("dashboard");

    // Add all the page files from the current project
    [
      "AboutUs.jsx",
      "ContactUs.jsx",
      "Home.jsx",
      "HowItWorks.jsx",
      "Partnership.jsx",
      "Plans.jsx",
      "Privacy.jsx",
      "SignIn.jsx",
      "Terms.jsx",
    ].forEach((file) => {
      pages.file(
        file,
        document.querySelector(`[data-file="src/pages/${file}"]`)
          ?.textContent || ""
      );
    });

    // Add dashboard pages
    ["Esim.jsx", "Orders.jsx", "Wallet.jsx"].forEach((file) => {
      dashboardPages.file(
        file,
        `
import React from 'react';
import Container from '../../components/Container';

const ${file.replace(".jsx", "")} = () => {
  return (
    <Container>
      <h1 className="text-2xl font-bold my-8">${file.replace(".jsx", "")}</h1>
    </Container>
  );
};

export default ${file.replace(".jsx", "")};`
      );
    });

    // Update Navbar with custom colors
    components.file(
      "Navbar.jsx",
      `
import React from 'react';
import { Link } from 'react-router-dom';
import Container from './Container';

const Navbar = () => {
  return (
    <nav className="bg-primary text-white shadow">
      <Container>
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            ${
              logo
                ? `<img src="/logo.${logo.file.name
                    .split(".")
                    .pop()}" alt="Logo" className="h-8 w-auto" />`
                : ""
            }
            Monty eSIM
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link to="/plans" className="text-white/80 hover:text-white">Plans</Link>
            <Link to="/how-it-works" className="text-white/80 hover:text-white">How It Works</Link>
            <Link to="/about-us" className="text-white/80 hover:text-white">About Us</Link>
            <Link to="/contact-us" className="text-white/80 hover:text-white">Contact</Link>
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;`
    );

    // Update Footer with custom colors
    components.file(
      "Footer.jsx",
      `
import React from 'react';
import { Link } from 'react-router-dom';
import Container from './Container';

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              ${
                logo
                  ? `<img src="/logo.${logo.file.name
                      .split(".")
                      .pop()}" alt="Logo" className="h-8 w-auto" />`
                  : ""
              }
              Monty eSIM
            </h3>
            <p className="text-white/80">Connect globally with ease</p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-white/80 hover:text-white">Home</Link></li>
              <li><Link to="/plans" className="text-white/80 hover:text-white">Plans</Link></li>
              <li><Link to="/about-us" className="text-white/80 hover:text-white">About Us</Link></li>
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;`
    );

    // Update Home page with custom colors and styling
    pages.file(
      "Home.jsx",
      `
import React from 'react';
import Container from '../components/Container';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose your Apps</h1>
          <p className="text-lg text-gray-600">Free instant access, no credit card required.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Product selection */}
          <div className="space-y-4">
            {[
              {
                id: 'api',
                name: 'API',
                icon: 'CodeIcon',
                description: 'For API integration into their existing system',
                learnMore: '#'
              },
              {
                id: 'mobile',
                name: 'Mobile App',
                icon: 'LocalPhoneIcon',
                description: 'For mobile applications (iOS/Android)',
                learnMore: '#'
              },
              {
                id: 'web',
                name: 'Web App',
                icon: 'Globe',
                description: 'For web applications (browsers)',
                learnMore: '#'
              },
              {
                id: 'reseller',
                name: 'Reseller',
                icon: 'PeopleIcon',
                description: 'For setting up reseller-specific configurations',
                learnMore: '#'
              }
            ].map((product) => (
              <div
                key={product.id}
                className="relative bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="absolute top-4 left-4">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="cursor-pointer p-6 pl-14 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="w-6 h-6 text-blue-500">{product.icon}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-2">{product.description}</p>
                  <a href={product.learnMore} className="text-blue-500 hover:text-blue-600 text-sm">
                    Learn more
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Right side - Preview */}
          <div className="bg-black rounded-3xl p-4">
            <img
              src="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1200"
              alt="Dashboard Preview"
              className="w-full rounded-2xl"
            />
          </div>
        </div>

        {/* Build Website Button */}
        <div className="mt-8 text-center">
          <button
            className="px-8 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Build my website
          </button>
        </div>
      </Container>
    </div>
  );
};

export default Home;`
    );

    // Add Container component with proper styling
    components.file(
      "Container.jsx",
      `
import React from 'react';

const Container = ({ children, className = '' }) => {
  return (
    <div className={\`max-w-xxl mx-auto px-4 sm:px-6 lg:px-8 \${className}\`}>
      {children}
    </div>
  );
};

export default Container;`
    );

    // Add necessary icons
    zip.file(
      "src/components/Icons.jsx",
      `
import PublicIcon from "@mui/icons-material/Public";
import CodeIcon from "@mui/icons-material/Code";
import PeopleIcon from "@mui/icons-material/People";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";

export const Icons = {
  PublicIcon,
 LocalPhoneIcon,
  CodeIcon,
 PeopleIcon
};

export default Icons;`
    );

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "monty-esim-website.zip";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating zip file:", error);
      alert("There was an error creating the zip file. Please try again.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Choose your Apps
              </h1>
              <p className="text-lg text-gray-600">
                Free instant access, no credit card required.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left side - Product selection */}
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="relative bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="absolute top-4 left-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.some(
                          (p) => p.id === product.id
                        )}
                        onChange={() => handleProductSelect(product)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div
                      onClick={() => handleProductSelect(product)}
                      className={`cursor-pointer p-6 pl-14 transition-colors ${
                        selectedProducts.some((p) => p.id === product.id)
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <product.icon className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-2">
                        {product.description}
                      </p>
                      <a
                        href={product.learnMore}
                        className="text-blue-500 hover:text-blue-600 text-sm"
                      >
                        Learn more
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right side - Preview */}
              <div className="bg-black rounded-3xl p-4">
                <img
                  src="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1200"
                  alt="Dashboard Preview"
                  className="w-full rounded-2xl"
                />
              </div>
            </div>

            {/* Build Website Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => selectedProducts.length > 0 && setStep(2)}
                disabled={selectedProducts.length === 0}
                className={`px-8 py-3 rounded-lg text-white transition-colors ${
                  selectedProducts.length > 0
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Build my website
              </button>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Ready to build the perfect website?
              </h1>
              <p className="text-lg text-gray-600">
                We'll set you up and running in 4 steps. Let's do it
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto">
              {/* Left side - Logo Upload */}
              <div>
                <div
                  onClick={() => document.getElementById("logo-upload").click()}
                  className="cursor-pointer"
                >
                  <button
                    type="button"
                    className="mb-6 inline-flex px-6 py-3 bg-[#1e3a8a] text-white rounded-lg"
                  >
                    Upload your logo
                  </button>
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                    {logo ? (
                      <img
                        src={logo.preview}
                        alt="Logo preview"
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <div className="text-gray-400">
                        <svg
                          className="w-24 h-24 mx-auto"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="text-center mt-2">Click to upload logo</p>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>

              {/* Right side - Color Selection */}
              <div>
                <h3 className="text-xl font-semibold mb-6">
                  Choose your colors
                </h3>
                <div className="space-y-6">
                  {Object.entries(colors).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-4">
                      <label className="w-24 text-sm font-medium capitalize">
                        {key}
                      </label>
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="h-10 w-20"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={() => setStep(3)}
                className="px-8 py-3 bg-[#1e3a8a] text-white rounded-lg hover:bg-[#1e3a8a]/90 transition-colors"
              >
                Build my website
              </button>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Here is your e sim product
              </h1>
              <p className="text-lg text-gray-600">
                We'll set you up and running in 4 steps. Let's do it
              </p>
            </div>

            {/* Theme Pills */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 bg-white"
                >
                  {product.name}
                </div>
              ))}
            </div>

            {/* Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Home Preview */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&h=600"
                  alt="Home Preview"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>

              {/* Plans Preview */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&h=600"
                  alt="Plans Preview"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>

              {/* About Preview */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&h=600"
                  alt="About Preview"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            </div>

            {/* Download Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleDownload}
                className="px-8 py-3 rounded-full bg-[#14213D] text-white hover:bg-[#1a2a4d] transition-colors"
              >
                Download
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <Container>
        {/* Back button */}
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mb-8 flex items-center text-gray-600 hover:text-gray-900"
          >
            <KeyboardArrowLeftIcon className="w-5 h-5 mr-2" />
            Back
          </button>
        )}

        {renderStep()}
      </Container>
    </div>
  );
};

export default DownloadTheme;
