import React from 'react';

interface LogoMarkProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Marca breu del logo (només la "GP"), sense el wordmark "GLOBALPLAY360".
 * Reutilitza els path-data originals de `Logo.tsx`; només es retalla el
 * viewBox a la zona on viuen les dues lletres. El color s'hereta via
 * `currentColor`, així es controla amb classes Tailwind (p. ex. `text-[#FFC107]`).
 */
export function LogoMark({ className = '', ...props }: LogoMarkProps) {
  return (
    <svg
      viewBox="400 440 740 540"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-colors duration-200 ease-out ${className}`}
      aria-label="GlobalPlay360"
      role="img"
      {...props}
    >
      <title>GlobalPlay360</title>

      <path
        fill="currentColor"
        d="M820.5 520.5l-147.37.76c-53.67 5.04-105.62 25.24-132.51 74.49-27.44 50.25-26.77 132.41.75 182.51 34.9 63.52 111.1 80.06 178.63 76v-132H618.75v-100.5H820.5v324.38c0 .6-4.81 4.82-6.36 4.14-117.35.57-265.14 9.07-345.36-93.42-45.93-58.69-56.6-148.89-46.42-221.11 22.43-159.21 150.8-208.49 295.73-212.02 30.34 2 63.84-2.54 93.81 0 2.06.18 8.6 1.79 8.6 4.15v92.62Z"
      />
      <path
        fill="currentColor"
        d="M837.75 738v-96.75c38.37-2.63 99.12 9.48 129.03-20.59 17.68-17.77 18.84-51.37 4.76-71.57-27.03-38.8-93.34-26.49-133.79-28.58v-95.62c0-.17-1.42-1-.37-1.13l72.03-.03c79.56 3.41 154.53 39.29 168.88 124.37 17.13 101.62-37.21 169.85-136.14 186.67-34.41 5.85-69.6 2.26-104.39 3.24Z"
      />
    </svg>
  );
}

export default LogoMark;
