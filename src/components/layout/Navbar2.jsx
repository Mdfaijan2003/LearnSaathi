import React from "react";
import { Layers } from "lucide-react";
import { Button } from "../ui/Button";
import { Heading, Text, TextLink } from "../ui/Typography";
import { Link } from "react-router-dom";
const Navbar2 = () => {
  return (
    <>
      {/* Utility Nav */}
      <div className="bg-slate-900 py-2 px-6 flex justify-between items-center">
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
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        {/* Brand */}
        <Link to="/">
          <div className="flex items-center space-x-2 mr-8">
            <Layers className="text-slate-800" size={24} />
            <Heading level={4} className="text-xl tracking-tight m-0">
              LearnSaathi
            </Heading>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-8">
          <TextLink variant="nav" href="/#workflow">
            How it Works
          </TextLink>
          <TextLink variant="nav" to="/features">
            Platform Features
          </TextLink>
          <TextLink variant="nav" href="/#tutor">
            AI Tutor
          </TextLink>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <TextLink to="/signin">
            <Button variant="ghost" className="hidden md:inline-flex">
              Sign In
            </Button>
          </TextLink>
          <Button variant="primary">Start Learning</Button>
        </div>
      </nav>
    </>
  );
};

export default Navbar2;
