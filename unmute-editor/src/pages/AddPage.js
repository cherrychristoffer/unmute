import { React } from "react";

import { Link } from "wouter";

import { BottomNavigation } from "../components/UnmuteBottomNavigation";

export const AddPage = () => {
  return (
    <>
      <div className="mx-auto mt-48 flex flex-col items-center">
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
      <BottomNavigation />
    </>
  );
};
