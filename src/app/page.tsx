import { GiftBoxCollection } from "@/components/collection/GiftBoxCollection";
import { BuildSection } from "@/components/home/BuildSection";
import { FeaturedChocolates } from "@/components/home/FeaturedChocolates";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhatsAppSection } from "@/components/home/WhatsAppSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Hero />
      <GiftBoxCollection />
      <HowItWorks />
      <BuildSection />
      <WhyChooseUs />
      <FeaturedChocolates />
      <WhatsAppSection />
      <Footer />
    </>
  );
}
