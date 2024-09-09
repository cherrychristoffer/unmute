import { React } from "react";

import { Link, useLocation } from "wouter";
import { useSelector } from "react-redux";

export const StartPage = () => {
  const [_location, navigate] = useLocation();
  const unmutes = useSelector((state) => state.user.unmutes);

  if (unmutes.length > 0) {
    navigate("/orientation");
    return;
  }

  return (
    <div className="mx-auto flex flex-col items-center justify-center h-full -mt-4">
      <div className="relative inline-flex items-center justify-center w-64 h-64 overflow-hidden bg-rose-500 rounded-full">
        <Link
          to="/offers"
          className="font-medium font-serif text-6xl text-white cursor-pointer"
        >
          +
        </Link>
      </div>

      <div className="font-serif text-muld-500 text-2xl mt-12">
        Start creating
      </div>
    </div>
  );
};
