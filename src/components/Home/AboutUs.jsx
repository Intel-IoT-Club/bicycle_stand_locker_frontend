import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import UnlockIcon from "../../assets/Unlock_Icon.png";
import LocationIcon from "../../assets/Location_Icon.png";
import CardWallet from "../../assets/Card_Wallet_Icon.png";
import BarChart from "../../assets/Bar_Chart_Icon.png";

gsap.registerPlugin(ScrollTrigger);

const AboutUs = () => {
  const containerRef = useRef();

  useGSAP(() => {
    // 1. Header Parallax
    gsap.from(".about-header-text", {
      scrollTrigger: {
        trigger: ".about-header-bg",
        start: "top center",
      },
      y: 100,
      opacity: 0,
      duration: 1.5,
      ease: "power4.out"
    });

    // 2. Left Text Slide
    gsap.from(".about-text", {
      scrollTrigger: {
        trigger: ".about-content",
        start: "top 70%",
      },
      x: -50,
      opacity: 0,
      stagger: 0.2,
      duration: 1,
      ease: "power3.out"
    });

    // 3. Right Cards Pop In
    gsap.from(".feature-card", {
      scrollTrigger: {
        trigger: ".feature-grid",
        start: "top 75%",
      },
      y: 50,
      opacity: 0,
      scale: 0.8,
      stagger: 0.1,
      duration: 0.8,
      ease: "back.out(1.7)"
    });
  }, { scope: containerRef });

  const features = [
    { img: UnlockIcon, title: "Tap & Ride Access" },
    { img: LocationIcon, title: "Live Bike Map" },
    { img: CardWallet, title: "Effortless Payments" },
    { img: BarChart, title: "Ride Dashboard" }
  ];

  return (
    <div ref={containerRef}>
      <div id="about-us" className="bg-[#F9F8E9] font-afacad min-h-screen m-0 overflow-hidden">
        {/* Header */}
        <div className="about-header-bg bg-gradient-to-b from-[#016766] via-[#082323] to-[#101010] text-center py-20 relative">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <h2 className="about-header-text text-8xl lg:text-9xl font-bold text-white tracking-tighter relative z-10">About Us</h2>
        </div>

        {/* Content */}
        <div className="about-content flex-1 w-full px-8 lg:px-24 py-24 grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
          {/* Left Section */}
          <div className="flex flex-col justify-center gap-y-8 lg:px-12">
            <h3 className="about-text font-bold text-6xl lg:text-7xl leading-tight text-black">
              Connecting Our Campus, <span className="text-[#016766] underline decoration-4 underline-offset-8">Faster</span>.
            </h3>
            <p className="about-text font-normal text-2xl lg:text-3xl text-gray-700 leading-relaxed border-l-8 border-black pl-6 py-2">
              We are a team of innovators from the IoT Club dedicated to
              building a smart, sustainable future. Our Bicycle Rental Project
              leverages IoT and cloud technology to make commuting convenient.
            </p>
          </div>

          {/* Right Section */}
          <div className="feature-grid grid grid-cols-2 gap-8 lg:gap-12 justify-center items-center lg:px-12">
            {features.map((item, index) => (
              <div key={index} className="feature-card flex flex-col items-center text-center group cursor-pointer">
                <div className="bg-[#016766] p-8 lg:p-10 rounded-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:shadow-none group-hover:bg-black transition-all duration-300">
                  <img src={item.img} className="h-16 w-16 lg:h-20 lg:w-20 group-hover:scale-110 transition-transform duration-300 filter group-hover:invert" />
                </div>
                <p className="font-bold text-2xl lg:text-3xl mt-6 group-hover:text-[#016766] transition-colors">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;