import { ImageResponse } from 'next/og';
import { AlarmClock } from 'lucide-react';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'hsl(215 91% 49%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '6px'
        }}
      >
        <AlarmClock strokeWidth={2.5} size={24} />
      </div>
    ),
    {
      ...size,
    }
  );
}
