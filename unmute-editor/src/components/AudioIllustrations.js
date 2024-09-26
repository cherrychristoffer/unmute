import { React } from "react";

export const AudioIllustrations = () => {
  const ONBOARDING = [
    {
      image: "https://unmute-prod.s3.eu-north-1.amazonaws.com/static-assets/tips/no_headphones.png",
      label: "Brug ikke headset til at optage",
    },
    {
      image: "https://unmute-prod.s3.eu-north-1.amazonaws.com/static-assets/tips/distance.png",
      label: "Hold ca. 15 cm fra mikrofonen.",
    },
    {
      image: "https://unmute-prod.s3.eu-north-1.amazonaws.com/static-assets/tips/inspiration.png",
      label: "Skriv stikord til din optagelse",
    },
  ];

  return (
    <div className={"pb-[20px]"}>
      {ONBOARDING.map((item, index) => (
        <div key={index} className="text-center mt-8 max-w-sm mx-auto">
          <img src={item.image} alt="No headphones" className="w-full" />
          <div className="font-serif text-white text-center text-2xl -mt-11 leading-tight">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};
