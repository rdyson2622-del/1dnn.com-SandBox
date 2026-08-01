import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLayout } from '@/lib/LayoutContext';

const GOLD = '#D4AF37';

export default function LayoutToggleButton() {
  const { landscape, setLandscape } = useLayout();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0"
      style={{ color: GOLD }}
      onClick={() => setLandscape(l => !l)}
      title={landscape ? 'Switch to Portrait' : 'Switch to Landscape'}
    >
      {landscape ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
    </Button>
  );
}