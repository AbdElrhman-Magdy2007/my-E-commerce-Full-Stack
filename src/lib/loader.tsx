import React from "react";

interface LoaderProps {
  className?: string;
  size?: string;
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({ className = "", size = "w-6 h-6", color = "border-t-black" }) => {
  return (
    <div className={`flex justify-center items-center ${className}`} aria-label="Loading">
      <div className={`${size} border-2 border-gray-200 rounded-full animate-spin ${color}`}></div>
    </div>
  );
};

export default Loader;
