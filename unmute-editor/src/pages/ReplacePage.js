import React from "react";

export const ReplacePage = () => {
  return (
    <div className={"pb-[80px]"}>
      {/* TODO: Should be removed */}
      <style>{`.audio-hidden-replace {display: none;}`}</style>
      <div className="mt-16 flex flex-row justify-center items-center gap-4">
        <button className="font-serif text-white bg-rose-500 border border-rose focus:outline-none hover:bg-rose-600 focus:ring-4 focus:ring-rose font-medium rounded-lg px-8 py-2.5 cursor-pointer">
          No thanks
        </button>
        <button
          className="font-serif text-white bg-black border border-rose transition duration-200 ease-out focus:outline-none hover:bg-gray-800 focus:ring-4 focus:ring-rose font-medium rounded-lg px-4 py-2.5 cursor-pointer">
          Yes (+49DKK)
        </button>
      </div>

      <p
        className={
          "font-serif text-rose-500 text-2xl text-center leading-tight mt-10"
        }
      >
        AI-Enhance your photo
      </p>
    </div>
  );
};
