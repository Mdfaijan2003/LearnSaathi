import React, { useState } from "react";
import { Layers, Bell, User, Search, ChevronDown, X } from "lucide-react";
import { Heading, Text, TextLink } from "../ui/Typography";
import { Link, useNavigate,useLocation  } from "react-router-dom";
// Dummy data for the mega menu categories
const tutorialCategories = [
  {
    title: "School Exams",
    links: [
      "Class VI Board Exams",
      "Class VII Board Exams",
      "Class VIII Board Exams",
      "Class IX Board Exams",
      "Class XI Board Exams",
      "Class X Board Exams",
      "Class XII Board Exams",
    ],
  },
  {
    title: "Boards",
    links: [
      "CBSE",
      "ICSE",
      "WBCHSE",
      "WBBSE",
      "State Boards",
      "IB (International Baccalaureate)",
      "IGCSE (International General Certificate of Secondary Education)",
    ],
  },
  {
    title: "Universities & Colleges",
    links: [
      "MAKAUT",
      "IITs (Indian Institutes of Technology)",
      "NITs (National Institutes of Technology)",
      "IIITS (Indian Institutes of Information Technology)",
      "State University",
      "DU (Delhi University)",
      "CU (Calcutta University)",
    ],
  },
  {
    title: "Subjects & Concepts",
    links: [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Science",
      "Computer Science",
      "Information Technology",
      "English Language",
      "English Literature",
      "History",
      "Geography",
      "Civics",
      "Political Science",
      "Economics",
      "Business Studies",
      "Accountancy",
      "Environmental Science",
      "General Knowledge",
    ],
  },
  {
    title: "Programming Languages",
    links: [
      "C",
      "C++",
      "Java",
      "Python",
      "JavaScript",
      "TypeScript",
      "Go (Golang)",
      "Rust",
      "C#",
      "Kotlin",
      "Swift",
      "Dart",
      "PHP",
      "Ruby",
      "R",
      "MATLAB",
    ],
  },
  {
    title: "Competitive Exams",
    links: [
      "JEE Main",
      "JEE Advanced",
      "NEET",
      "NDA",
      "GATE",
      "CAT",
      "UPSC Civil Services",
      "SSC CGL",
      "WBJEE",
      "BITSAT",
      "VITEEE",
      "CUET",
    ],
  },
  {
    title: "Hackathons",
    links: [
      "Smart India Hackathon (SIH)",
      "Google Solution Challenge",
      "Microsoft Imagine Cup",
      "Flipkart Grid",
      "Amazon ML Challenge",
      "Meta Hacker Cup",
      "ICPC (International Collegiate Programming Contest)",
      "CodeChef SnackDown",
      "Google Code Jam",
      "TCS CodeVita",
      "HackWithInfy (Infosys)",
      "JP Morgan Code for Good",
      "MLH Global Hackathons",
      "ETHIndia Hackathon",
    ],
  },
];
const studyMaterials = [
  {
    title: "Class 6–7",
    links: [
      "Mathematics",
      "Science",
      "English",
      "History",
      "Geography",
      "Civics",
      "Computer Science",
      "General Knowledge",
      "Environmental Studies",
    ],
  },
  {
    title: "Class 8–9",
    links: [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "English Language",
      "English Literature",
      "History",
      "Geography",
      "Civics",
      "Computer Science",
      "Information Technology",
      "General Knowledge",
    ],
  },
  {
    title: "Class 10",
    links: [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "English Language",
      "English Literature",
      "History",
      "Geography",
      "Political Science",
      "Economics",
      "Computer Science",
      "Information Technology",
    ],
  },
  {
    title: "Class 11–12",
    links: [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Computer Science",
      "Information Technology",
      "Economics",
      "Business Studies",
      "Accountancy",
      "History",
      "Geography",
      "Political Science",
      "English",
    ],
  },
  {
    title: "Competitive Exams",
    links: [
      "JEE Main",
      "JEE Advanced",
      "NEET",
      "NDA",
      "GATE",
      "CAT",
      "UPSC Civil Services",
      "SSC CGL",
      "WBJEE",
      "BITSAT",
      "VITEEE",
      "CUET",
    ],
  },
];

const Navbar = () => {

  const navigate = useNavigate();
  const location = useLocation();

  // State to track which menu is open (null means closed)
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menuName) => {
    if (activeMenu === menuName) {
      setActiveMenu(null); // Close if already open
    } else {
      setActiveMenu(menuName); // Open new menu
    }
  };

  return (
    <>
      {/* Utility Nav */}
      <div className="bg-slate-900 py-2 px-6 flex justify-between items-center relative z-50">
        <Text variant="caption" className="text-slate-300">
          System Status: All learning engines operational.
        </Text>
        <div className="flex space-x-4">
          <TextLink variant="utility" href="#educator">
            Educator Portal
          </TextLink>
          <TextLink variant="utility" href="#school">
            School Integration
          </TextLink>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        {/* Left Section: Brand & Links */}
        <div className="flex items-center">
          {/* Brand */}
          <Link to="/HomePage">
          <div className="flex items-center space-x-2 mr-8">
            <Layers className="text-slate-800" size={24} />
            <Heading level={4} className="text-xl tracking-tight m-0">
              LearnSaathi
            </Heading>
          </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex space-x-2">
            {/* Mega Menu Trigger */}
            <button
              onClick={() => toggleMenu("tutorials")}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none ${
                activeMenu === "tutorials"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Tutorials
              <ChevronDown
                size={14}
                className={`ml-1 transition-transform duration-200 ${activeMenu === "tutorials" ? "rotate-180" : ""}`}
              />
            </button>
            <button
              onClick={() => toggleMenu("study-materials")}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none ${
                activeMenu === "study-materials"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Study Materials
              <ChevronDown
                size={14}
                className={`ml-1 transition-transform duration-200 ${activeMenu === "study-materials" ? "rotate-180" : ""}`}
              />
            </button>

            {/* Standard Links */}

            
            <button
              onClick={() => {
                setActiveMenu(null);
                navigate("/notes");
              }}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 active:scale-95 focus:outline-none ${
                location.pathname === "/notes"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Notes
            </button>

            <button
              onClick={() => {
                setActiveMenu(null);
                navigate("/exercise");
              }}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 active:scale-95 focus:outline-none ${
                location.pathname === "/exercise"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Exercise
            </button>

            <button
              onClick={() => {
                setActiveMenu(null);
                navigate("/CareerExplorer");
              }}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 active:scale-95 focus:outline-none ${
                location.pathname === "/CareerExplorer"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Career Explorer
            </button>

          </div>
        </div>

        {/* Right Section: Search & Logged-In Actions */}
        <div className="flex items-center space-x-5">
          <div className="relative hidden md:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search concepts, notes..."
              className="w-48 lg:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="hidden md:block w-px h-6 bg-slate-200 mx-2"></div>

          <button className="text-slate-500 hover:text-slate-900 transition-colors focus:outline-none relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <button className="flex items-center justify-center w-9 h-9 bg-slate-100 border border-slate-300 rounded-full text-slate-700 hover:bg-slate-200 hover:border-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1">
            <User size={18} />
          </button>
        </div>
      </nav>

      {/* =========================================
          THE MEGA MENU DROPDOWN UI
      ========================================= */}
      {activeMenu && (
        <div
          className="fixed inset-0 top-[110px] z-30"
          onClick={() => setActiveMenu(null)}
        />
      )}

      {/* The Actual Dropdown Panel */}
      <div
        className={`absolute left-0 w-full bg-white border-b border-slate-200 shadow-xl z-40 transition-all duration-300 origin-top overflow-hidden ${
          activeMenu === "tutorials"
            ? "max-h-[600px] opacity-100 py-10 overflow-y-auto"
            : "max-h-0 opacity-0 py-0 border-transparent pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 relative">
          {/* Close Button inside menu */}
          <button
            onClick={() => setActiveMenu(null)}
            className="absolute top-0 right-6 text-slate-400 hover:text-slate-900 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>

          <Heading level={2} className="mb-8">
            Explore Tutorials
          </Heading>

          {/* Grid Layout for Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {tutorialCategories.map((category, index) => (
              <div key={index}>
                <h3 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                  {category.title}
                </h3>
                <ul className="space-y-3">
                  {category.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-sm text-slate-600 hover:text-slate-900 hover:underline transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* The Actual Dropdown Panel */}
      <div
        className={`absolute left-0 w-full bg-white border-b border-slate-200 shadow-xl z-40 transition-all duration-300 origin-top overflow-hidden ${
          activeMenu === "study-materials"
            ? "max-h-[600px] opacity-100 py-10 overflow-y-auto"
            : "max-h-0 opacity-0 py-0 border-transparent pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 relative">
          {/* Close Button inside menu */}
          <button
            onClick={() => setActiveMenu(null)}
            className="absolute top-0 right-6 text-slate-400 hover:text-slate-900 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>

          <Heading level={2} className="mb-8">
            Study Materials
          </Heading>

          {/* Grid Layout for Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {studyMaterials.map((category, index) => (
              <div key={index}>
                <h3 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                  {category.title}
                </h3>

                <ul className="space-y-3">
                  {category.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-sm text-slate-600 hover:text-slate-900 hover:underline transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
