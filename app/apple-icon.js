import { ImageResponse } from 'next/og';

// Dimensions for Apple Touch Icon
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFD700',
          color: 'black', // Kasi Gold
          fontSize: 120,    // Larger font for the icon
          fontWeight: 900,
          borderRadius: '24px', // Standard iOS rounding
        }}
      >
        K
      </div>
    ),
    { ...size }
  );
}