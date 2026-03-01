const PlanItemCard = ({ title, time }) => {
  return (
    <div className="bg-[#1e293b] p-5 rounded-xl w-full">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-400">{time}</p>
    </div>
  );
};

export default PlanItemCard;