import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M8 35.5V12.5C8 9.462 10.462 7 13.5 7H28.25C35.206 7 40 10.999 40 16.914C40 20.082 38.557 22.692 36.036 24.25C38.557 25.808 40 28.418 40 31.586C40 37.501 35.206 41.5 28.25 41.5H13.5C10.462 41.5 8 39.038 8 35.5ZM16 20.75H27.75C30.15 20.75 31.75 19.423 31.75 17.414C31.75 15.405 30.15 14.125 27.75 14.125H16V20.75ZM16 34.375H28.25C30.65 34.375 32.25 33.095 32.25 31.086C32.25 29.077 30.65 27.75 28.25 27.75H16V34.375Z"
            />
            <path
                d="M18.25 31.25H29.75"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="3"
            />
        </svg>
    );
}
