import { HomeAppSDK } from '@contentful/app-sdk';
import { Heading, Paragraph } from '@contentful/f36-components';
import { useEffect, useState } from 'react';
import { UsageCard } from '../components/UsageCard';

interface HomePageProps {
  sdk: HomeAppSDK;
}

export const HomePage = ({ sdk }: HomePageProps) => {
  const [spaceId, setSpaceId] = useState<string>('');

  console.log('HomePage', spaceId);
  
  useEffect(() => {
    const space = sdk.ids.space;
    setSpaceId(space);
  }, [sdk]);

  return (
    <div style={{ margin: '40px auto', maxWidth: '800px', padding: '0 20px' }}>
      <Heading marginBottom="spacingM">API Usage Dashboard</Heading>
      <Paragraph marginBottom="spacingL">
        Monitor your Contentful API usage and quota for this space.
      </Paragraph>
      
      {spaceId && <UsageCard sdk={sdk} spaceId={spaceId} />}
    </div>
  );
};
