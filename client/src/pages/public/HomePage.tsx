import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { HeroSection } from '../../sections/HeroSection';
import { AboutBentoSection } from '../../sections/AboutBentoSection';
import { TechStackSection } from '../../sections/TechStackSection';
import { ServicesSection } from '../../sections/ServicesSection';
import { ProjectsSection } from '../../sections/ProjectsSection';
import { AvailabilitySection } from '../../sections/AvailabilitySection';
import { ContactSection } from '../../sections/ContactSection';
import { Settings } from '../../types';

export const HomePage: React.FC = () => {
  const { settings } = useOutletContext<{ settings: Settings | null }>();

  return (
    <div>
      <HeroSection settings={settings} />
      <AboutBentoSection />
      <ServicesSection />
      <ProjectsSection />
      <TechStackSection />
      <AvailabilitySection settings={settings} />
      <ContactSection />
    </div>
  );
};
