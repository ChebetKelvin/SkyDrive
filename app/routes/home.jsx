import FleetPreview from "../components/FleetPreview";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonial";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div>
      <Hero />
      <FleetPreview />
      <HowItWorks />
      <Testimonials />
    </div>
  );
}
