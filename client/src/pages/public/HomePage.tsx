import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { HeroSection } from '../../sections/HeroSection';
import { AboutBentoSection } from '../../sections/AboutBentoSection';
import { TechStackSection } from '../../sections/TechStackSection';
import { ServicesSection } from '../../sections/ServicesSection';
import { ProjectsSection } from '../../sections/ProjectsSection';
import { AvailabilitySection } from '../../sections/AvailabilitySection';
import { ContactSection } from '../../sections/ContactSection';
import { Footer } from '../../components/common/Footer';
import { AetherisBackground } from '../../components/common/AetherisBackground';
import { Settings } from '../../types';

export const HomePage: React.FC = () => {
  const { settings } = useOutletContext<{ settings: Settings | null }>();

  return (
    <div>
      <HeroSection settings={settings} />
      <div className="relative overflow-x-clip">
        <AetherisBackground />
        <div className="relative z-10">
          <AboutBentoSection />
          <ServicesSection />
          <ProjectsSection />
          <TechStackSection />
          <AvailabilitySection settings={settings} />
          <ContactSection />
          <Footer settings={settings} />
        </div>
      </div>
    </div>
  );
};
