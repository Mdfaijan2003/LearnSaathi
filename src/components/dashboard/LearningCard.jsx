export default function LearningCard({subject, topic, progress}) {
  

  return (
    <div className="hover:space-y-6 transition-all duration-300">
      <div className="bg-[#2a2a3a] rounded-2xl p-5 w-80 shadow-2xl hover:space-y-6 transition-all duration-300">
        {/* App Icon */}
        <div className="w-13 h-13 bg-gradient-to-br from-[#4da6ff] to-[#1a7de8] rounded-xl flex items-center justify-center mb-4 shadow-lg w-[52px] h-[52px]">
          <svg
            viewBox="0 0 24 24"
            className="w-7 h-7 fill-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 6C4 4.89543 4.89543 4 6 4H13V9C13 9.55228 13.4477 10 14 10H19V20C19 21.1046 18.1046 22 17 22H6C4.89543 22 4 21.1046 4 20V6Z" />
            <path d="M15 4.5L18.5 8H15V4.5Z" />
          </svg>
        </div>

        {/* Title */}
        <p className="text-white font-bold text-[17px] tracking-tight mb-1">{subject}</p>

        {/* Subtitle */}
        <p className="text-[#9a9aaa] text-sm mb-5">{topic}</p>

        {/* Progress Label Row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#6a6a7a] text-[13px]">Progress</span>
          <span className="text-[#9a9aaa] text-[13px] font-medium">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#3e3e52] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#d0d0d8] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}