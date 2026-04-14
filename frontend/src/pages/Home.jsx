import HomeCTASection from "../components/home/CTASection";
import HomeFeaturesSection from "../components/home/FeaturesSection";
import HomeFooter from "../components/home/HomeFooter";
import HomeHeader from "../components/home/HomeHeader";
import HomeHeroSection from "../components/home/HeroSection";
import HomeHowItWorksSection from "../components/home/HowItWorksSection";
import HomeStatesSection from "../components/home/StatesSection";
import HomeTestimonialsSection from "../components/home/TestimonialsSection";

export default function MediSyncHomePage() {
  return (
    <div className="min-h-screen antialiased bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <HomeHeader />
      <main>
        <HomeHeroSection />
        <HomeFeaturesSection />
        <HomeHowItWorksSection />
        <HomeStatesSection />
        <HomeTestimonialsSection />
        <HomeCTASection />
      </main>
      <HomeFooter />
    </div>
  );
}
