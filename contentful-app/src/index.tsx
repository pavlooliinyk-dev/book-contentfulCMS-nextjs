import { createRoot } from 'react-dom/client';
import { init, locations } from '@contentful/app-sdk';
import './index.css';

import { HomePage } from './locations/HomePage';
import { ConfigScreen } from './locations/ConfigScreen';

init((sdk: any) => {
  const root = createRoot(document.getElementById('root')!);

  if (sdk.location.is(locations.LOCATION_APP_CONFIG)) {
    root.render(<ConfigScreen sdk={sdk as any} />);
  } else if (sdk.location.is(locations.LOCATION_HOME)) {
    root.render(<HomePage sdk={sdk as any} />);
  }
});
