import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PAGE_REGISTRY } from '@/lib/pageRegistry';
import { getCurrentSection } from '@/lib/sectionRegistry';

export default function PageNumberBadge() {
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const section = getCurrentSection(location.pathname, window.scrollY);
      setCurrentSection(section);
    };

    // Check on mount and scroll
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  if (!location?.pathname) return null;

  // Hide in video pipeline mode — the badge must not appear in HeyGen backgrounds.
  if (new URLSearchParams(location.search).get('videoMode') === 'true') return null;

  // Find page number by path
  let pageNumber = null;
  let pageInfo = null;

  const sortedEntries = Object.entries(PAGE_REGISTRY).sort((a, b) => b[1].path.length - a[1].path.length);

  for (const [num, page] of sortedEntries) {
    if (!page?.path) continue;
    
    const pathname = location.pathname.toLowerCase();
    const pagePath = page.path.toLowerCase();
    
    if (pathname === pagePath) {
      pageNumber = num;
      pageInfo = page;
      break;
    }
    
    if (pagePath.includes(':')) {
      const basePath = pagePath.split(':')[0];
      const baseWithoutSlash = basePath.slice(0, -1);
      
      if (pathname.startsWith(baseWithoutSlash) && pathname !== baseWithoutSlash) {
        pageNumber = num;
        pageInfo = page;
        break;
      }
    }
  }

  if (!pageNumber || !pageInfo) {
    console.warn('No page found for path:', location.pathname);
    return null;
  }

  const displayCode = currentSection ? `${pageNumber}${currentSection.code.split('.')[1]}` : `${pageNumber}`;
  const displayTitle = currentSection 
    ? `${pageInfo.name} → ${currentSection.name} (${currentSection.description})`
    : `${pageInfo.name} (${pageInfo.section})`;

  return (
    <div
      className="fixed bottom-6 left-5 z-40 font-bold"
      style={{
        color: '#D4AF37',
        opacity: 1,
        pointerEvents: 'none',
        textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 12px rgba(212,175,55,0.4)',
        background: 'rgba(0,0,0,0.6)',
        padding: '6px 12px',
        borderRadius: '16px',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(212,175,55,0.4)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
      title={displayTitle}
    >
      <span style={{ fontSize: '1rem', letterSpacing: '0.1em' }}>{displayCode}</span>
    </div>
  );
}