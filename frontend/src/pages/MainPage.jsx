import React, { useEffect, useRef, useContext } from 'react';
import { ActiveSectionContext } from '../context/ActiveSectionContext';
import Dashboard from './Dashboard';
import Inventory from './Inventory';
import SalesAnalytics from './SalesAnalytics';
import Customers from './Customers';
import AIAdvisor from './AIAdvisor';
import DataEntry from './DataEntry';
import FooterCTA from '../components/FooterCTA';

const MainPage = () => {
  const { setActiveSection } = useContext(ActiveSectionContext);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0,
      }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [setActiveSection]);

  const addRef = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  const sectionClass = "relative overflow-hidden";
  const scrollMargin = { scrollMarginTop: 100 };

  return (
    <div className="space-y-20 pb-20">
      <section id="overview" ref={addRef} className={sectionClass} style={scrollMargin}>
        <Dashboard />
      </section>

      <section id="inventory" ref={addRef} className={sectionClass} style={scrollMargin}>
        <Inventory />
      </section>

      <section id="sales" ref={addRef} className={sectionClass} style={scrollMargin}>
        <SalesAnalytics />
      </section>

      <section id="customers" ref={addRef} className={sectionClass} style={scrollMargin}>
        <Customers />
      </section>

      <section id="ai-advisor" ref={addRef} className={sectionClass} style={scrollMargin}>
        <AIAdvisor />
      </section>

      <section id="data-entry" ref={addRef} className={sectionClass} style={scrollMargin}>
        <DataEntry />
      </section>

      <section className={sectionClass} style={scrollMargin}>
        <FooterCTA />
      </section>
    </div>
  );
};

export default MainPage;
