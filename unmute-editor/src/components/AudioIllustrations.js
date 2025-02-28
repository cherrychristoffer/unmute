import { React } from 'react'

export const AudioIllustrations = () => {
  const ONBOARDING = [
    {
      image:
        'https://unmute-prod.s3.eu-north-1.amazonaws.com/static-assets/tips/no_headphones.png',
      label: 'Brug ikke headset til at optage',
      class: '',
    },
    {
      image:
        'https://unmute-prod.s3.eu-north-1.amazonaws.com/static-assets/tips/distance.png',
      label:
        'Ændre tips i midten til følgende: Hold mikrofon/telefon min. 30cm væk fra munden',
      class: '',
    },
    {
      image:
        'https://unmute-prod.s3.eu-north-1.amazonaws.com/static-assets/tips/inspiration.png',
      label: 'Skriv stikord til din optagelse',
      class: '',
    },
  ]

  return (
    <div className={'pb-[20px] md:flex md:items-end md:gap-x-4'}>
      {ONBOARDING.map((item, index) => (
        <div
          key={index}
          className="text-center mt-8 max-w-sm md:max-w-lg mx-auto relative"
        >
          <img src={item.image} alt="No headphones" className="w-full" />
          <div
            className={`font-serif text-white text-center text-[1.4rem] ${item.class} leading-tight absolute bottom-2 left-2 right-2`}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}
