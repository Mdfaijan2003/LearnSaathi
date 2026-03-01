import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-zinc-900 p-6">
      <h1 className="text-xl font-bold mb-8 text-orange-500">
        LearnAI
      </h1>

      <nav className="space-y-4">
        <Link to="/dashboard" className="block hover:text-orange-400">
          Home
        </Link>

        <Link to="/dashboard" className="block hover:text-orange-400">
          Subjects
        </Link>

        <Link to="/dashboard" className="block hover:text-orange-400">
          AI Tutor
        </Link>
      </nav>
    </div>
  );
}