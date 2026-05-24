import * as React from 'react';

/**
 * StartLocation SVG component.
 * Red circle marker for route start location.
 * Matches Figma design 3840-23660.
 */
export default function StartLocation(props: React.SVGProps<SVGSVGElement>): React.JSX.Element {
  return (
    <svg
      width="58"
      height="58"
      viewBox="0 0 58 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g filter="url(#filter0_dd_3840_23660)">
        <rect x="20" y="20" width="18" height="18" rx="9" fill="#CA0000" />
        <rect x="22" y="22" width="14" height="14" rx="7" stroke="#CA0000" strokeWidth="4" />
      </g>
      <defs>
        <filter
          id="filter0_dd_3840_23660"
          x="0"
          y="0"
          width="58"
          height="58"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="4"
            operator="dilate"
            in="SourceAlpha"
            result="effect1_dropShadow_3840_23660"
          />
          <feOffset />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.792157 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3840_23660" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="4"
            operator="dilate"
            in="SourceAlpha"
            result="effect2_dropShadow_3840_23660"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="8" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.792157 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0" />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_3840_23660"
            result="effect2_dropShadow_3840_23660"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_3840_23660"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}
