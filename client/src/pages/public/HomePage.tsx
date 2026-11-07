import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { HeroSection } from '../../sections/HeroSection';
import { AboutBentoSection } from '../../sections/AboutBentoSection';
import { TechStackSection } from '../../sections/TechStackSection';
import { ServicesSection } from '../../sections/ServicesSection';
import { ProjectsSection } from '../../sections/ProjectsSection';
import { ClientPortalPreviewSection } from '../../sections/ClientPortalPreviewSection';
import { AvailabilitySection } from '../../sections/AvailabilitySection';
import { ContactSection } from '../../sections/ContactSection';
import { HybridCodeBackground } from '../../components/common/HybridCodeBackground';
import { Settings } from '../../types';

export const HomePage: React.FC = () => {
  const { settings } = useOutletContext<{ settings: Settings | null }>();

  return (
    <div>
      <HeroSection settings={settings} />
      <div className="relative overflow-hidden">
        <HybridCodeBackground />
        <div className="relative z-10">
          <AboutBentoSection />
          <ServicesSection />
          <ProjectsSection />
          <ClientPortalPreviewSection />
          <TechStackSection />
          <AvailabilitySection settings={settings} />
          <ContactSection />
        </div>
      </div>
    </div>
  );
};
