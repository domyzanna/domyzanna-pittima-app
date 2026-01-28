import { ImageResponse } from 'next/og';
import { AlarmClock } from 'lucide-react';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

// Image generation
export default function Icon512() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'hsl(215 91% 49%)', // primary color
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '85px',
        }}
      >
        <AlarmClock strokeWidth={2} size={360} />
      </div>
    ),
    {
      ...size,
    }
  );
}
