import { ImageResponse } from 'next/og';
import { AlarmClock } from 'lucide-react';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 192,
  height: 192,
};
export const contentType = 'image/png';

// Image generation
export default function Icon192() {
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
          borderRadius: '32px',
        }}
      >
        <AlarmClock strokeWidth={2} size={136} />
      </div>
    ),
    {
      ...size,
    }
  );
}
