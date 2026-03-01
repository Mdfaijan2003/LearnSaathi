import { useState } from "react";
import AuthLayout from "../../../Core/components/layout/authLayout";
import Card from "../../../Core/components/ui/card";
import Input from "../../../Core/components/ui/input";
import Button from "../../../Core/components/ui/button";
import SocialButtons from "../components/socialButtons";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout>
      <Card>

        <div className="text-center mb-8">
          <h2 className="text-[40px] font-semibold mb-3">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-lg">
            Continue your learning journey
          </p>
        </div>

        <SocialButtons />

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-sm text-gray-500">
              or continue with email
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          icon={Lock}
          rightIcon={showPassword ? <EyeOff /> : <Eye />}
          onRightClick={() => setShowPassword(!showPassword)}
        />


        <div className="flex items-center justify-between text-sm mb-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 bg-white/5 border border-white/20" />
            <span className="text-gray-400">Remember me</span>
          </label>

          <span className="text-orange-400 cursor-pointer">
            Forgot password?
          </span>
        </div>

        <Button>
          Sign In
          <ArrowRight className="w-5 h-5" />
        </Button>

      </Card>
    </AuthLayout>
  );
}