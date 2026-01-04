import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

const AnimationWrapper = ({ children, className = "" }) => {
    const comp = useRef(null);

    useGSAP(() => {
        gsap.from(comp.current, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
        });
    }, { scope: comp });

    return (
        <div ref={comp} className={`w-full ${className}`}>
            {children}
        </div>
    );
};

export default AnimationWrapper;
