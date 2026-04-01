import { createRoot } from 'react-dom/client';
import { init, locations } from '@contentful/app-sdk';
import './index.css';

import { ConfigScreen } from './locations/ConfigScreen';
import { StarRatingField } from './locations/StarRatingField';

// Add error boundary for initialization
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// Show loading state immediately
root.render(<div style={{ padding: '20px', textAlign: 'center' }}>Loading Contentful App...</div>);

init((sdk: any) => {
  console.log('SDK initialized :: ', { location: sdk.location, ids: sdk.ids });

  try {
    if (sdk.location.is(locations.LOCATION_APP_CONFIG)) {
      console.log('Rendering ConfigScreen');
      root.render(<ConfigScreen sdk={sdk as any} />);
    } else if (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) {
      console.log('Rendering StarRatingField');
      root.render(<StarRatingField sdk={sdk as any} />);
    } else {
      console.warn('Unknown location:', sdk.location);
      root.render(
        <div style={{ padding: '20px' }}>
          <h2>Star Rating Field Extension</h2>
          <p>This app should be configured as a field extension.</p>
          <p>Current location: {JSON.stringify(sdk.location)}</p>
        </div>
      );
    }
  } catch (error) {
    console.error('Render error:', error);
    root.render(
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Error</h2>
        <p>{String(error)}</p>
      </div>
    );
  }
});
