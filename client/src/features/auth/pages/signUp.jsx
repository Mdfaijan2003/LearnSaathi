import AuthLayout from "../../../Core/components/layout/authLayout";
import Card from "../../../Core/components/ui/card";
import Input from "../../../Core/components/ui/input";
import Button from "../../../Core/components/ui/button";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export default function SignUp() {
  return (
    <AuthLayout>
      <Card>

        <div className="text-center mb-8">
          <h2 className="text-[40px] font-semibold mb-3">
            Create Account
          </h2>
          <p className="text-gray-400 text-lg">
            Start your AI-powered journey
          </p>
        </div>

        <Input
          label="Full Name"
          placeholder="Your full name"
          icon={User}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Create a password"
          icon={Lock}
        />

        <Button>
          Create Account
          <ArrowRight className="w-5 h-5" />
        </Button>

      </Card>
    </AuthLayout>
  );
}