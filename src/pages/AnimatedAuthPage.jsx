import React, { useState } from "react";
import { Layers, Mail, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { Heading, Text, TextLink } from "../components/ui/Typography";
import { Button } from "../components/ui/Button";
import { HomePage } from "./HomePage";

// Reusable SVG icons for Social Login
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"
    />
  </svg>
);

const SocialButton = ({ icon, provider, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center justify-center w-full space-x-2 py-2.5 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 text-sm font-medium text-slate-700 shadow-sm"
  >
    {icon}
    <span>{provider}</span>
  </button>
);

const AnimatedAuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const openHomePage = (e) => {
    e.preventDefault();
    window.location.href = "./HomePage";
  };

  return (
    // On mobile: bg-white and no padding. On desktop: bg-slate-50 and p-6.
    <div className="min-h-screen flex items-center justify-center bg-white lg:bg-slate-50 lg:p-6 font-sans">
      {/* On mobile: h-screen, no border/radius. On desktop: h-[700px], rounded, shadow */}
      <div className="relative w-full max-w-5xl h-screen lg:h-[700px] bg-white lg:rounded-xl lg:shadow-lg lg:border lg:border-slate-200 overflow-hidden flex">
        {/* =========================================
            SIGN UP FORM 
        ========================================= */}
        {/* w-full on mobile, lg:w-1/2 on desktop */}
        <div
          className={`absolute top-0 left-0 w-full lg:w-1/2 h-full p-8 lg:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out ${
            isSignUp
              ? "opacity-100 z-10 translate-x-0"
              : "opacity-0 z-0 pointer-events-none -translate-x-4 lg:-translate-x-8"
          }`}
        >
          <div className="max-w-sm mx-auto w-full">
            <div className="flex items-center space-x-2 text-slate-900 mb-6">
              <Layers size={24} />
              <span className="font-bold text-xl tracking-tight">
                LearnSaathi
              </span>
            </div>

            <Heading level={2} className="mb-2">
              Create an account
            </Heading>
            <Text variant="body" className="mb-6">
              Start your personalized learning path today.
            </Text>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <SocialButton icon={<GoogleIcon />} provider="Google" />
              <SocialButton icon={<GitHubIcon />} provider="GitHub" />
            </div>

            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase tracking-wider">
                Or register with email
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 text-slate-400" size={18} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 text-slate-400" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <Button variant="primary" className="w-full h-11 mt-4">
                Sign Up
              </Button>
            </form>

            {/* Mobile-only toggle link (Hidden on desktop) */}
            <div className="mt-8 text-center text-sm text-slate-600 lg:hidden">
              Already have an account?{" "}
              <button
                onClick={() => setIsSignUp(false)}
                className="font-semibold text-slate-900 hover:underline"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* =========================================
            SIGN IN FORM 
        ========================================= */}
        {/* Uses left-0 on mobile so it stays centered, lg:right-0 lg:left-auto on desktop */}
        <div
          className={`absolute top-0 left-0 lg:left-auto lg:right-0 w-full lg:w-1/2 h-full p-8 lg:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out ${
            !isSignUp
              ? "opacity-100 z-10 translate-x-0"
              : "opacity-0 z-0 pointer-events-none translate-x-4 lg:translate-x-8"
          }`}
        >
          <div className="max-w-sm mx-auto w-full">
            <div className="flex items-center space-x-2 text-slate-900 mb-6">
              <Layers size={24} />
              <span className="font-bold text-xl tracking-tight">
                LearnSaathi
              </span>
            </div>

            <Heading level={2} className="mb-2">
              Welcome back
            </Heading>
            <Text variant="body" className="mb-6">
              Continue your learning journey.
            </Text>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <SocialButton icon={<GoogleIcon />} provider="Google" />
              <SocialButton icon={<GitHubIcon />} provider="GitHub" />
            </div>

            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase tracking-wider">
                Or sign in with email
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form className="space-y-4" onSubmit={openHomePage}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 text-slate-400" size={18} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <TextLink
                    href="#forgot"
                    className="text-xs text-slate-500 hover:text-slate-900"
                  >
                    Forgot password?
                  </TextLink>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 text-slate-400" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <Button variant="primary" className="w-full h-11 mt-4">
                Sign In
              </Button>
            </form>

            {/* Mobile-only toggle link (Hidden on desktop) */}
            <div className="mt-8 text-center text-sm text-slate-600 lg:hidden">
              New to LearnSaathi?{" "}
              <button
                onClick={() => setIsSignUp(true)}
                className="font-semibold text-slate-900 hover:underline"
              >
                Create an Account
              </button>
            </div>
          </div>
        </div>

        {/* =========================================
            THE SLIDING OVERLAY PANEL
            (Hidden entirely on mobile screens)
        ========================================= */}
        {/* Note the 'hidden lg:flex' class here */}
        <div
          className={`hidden lg:flex absolute top-0 left-0 w-1/2 h-full bg-slate-900 text-white z-20 transition-transform duration-700 ease-in-out items-center justify-center overflow-hidden ${
            isSignUp ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-100 to-transparent"></div>

          <div
            className={`absolute w-full px-16 text-center transition-all duration-700 ease-in-out ${
              !isSignUp
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-16 pointer-events-none"
            }`}
          >
            <Heading level={2} className="text-white mb-4">
              New to LearnSaathi?
            </Heading>
            <Text className="text-slate-300 mb-8">
              Stop managing fragmented resources. Centralize your notes,
              lectures, and AI tutor in one unified workspace.
            </Text>
            <Button
              variant="outline"
              onClick={() => setIsSignUp(true)}
              className="border-slate-500 text-white hover:bg-slate-800 hover:border-slate-400 px-8"
            >
              Create an Account <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>

          <div
            className={`absolute w-full px-16 text-center transition-all duration-700 ease-in-out ${
              isSignUp
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-16 pointer-events-none"
            }`}
          >
            <Heading level={2} className="text-white mb-4">
              Already enrolled?
            </Heading>
            <Text className="text-slate-300 mb-8">
              Your personalized learning path and smart notes are waiting for
              you. Log in to pick up right where you left off.
            </Text>
            <Button
              variant="outline"
              onClick={() => setIsSignUp(false)}
              className="border-slate-500 text-white hover:bg-slate-800 hover:border-slate-400 px-8"
            >
              <ArrowLeft size={16} className="mr-2" /> Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedAuthPage;
