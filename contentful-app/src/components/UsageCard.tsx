import { HomeAppSDK } from '@contentful/app-sdk';
import { Card, Heading, Paragraph, SkeletonContainer, SkeletonBodyText, Note } from '@contentful/f36-components';
import { useEffect, useState } from 'react';

interface UsageData {
  totalApiCalls: number;
  quota: number;
  period: string;
  breakdown: {
    cda: number;
    cpa: number;
    cma: number;
    graphql: number;
  };
}

interface UsageCardProps {
  sdk: HomeAppSDK;
  spaceId: string;
}

export const UsageCard = ({ sdk, spaceId }: UsageCardProps) => {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('UsageCard inited with spaceId:', spaceId);
  
  useEffect(() => {
    async function fetchUsage() {
        // Call backend API to fetch usage data (it handles dates and spaceId internally)
        const apiUrl = `https://book-contentful-cms-nextjs.vercel.app/api/usage`;
        
        console.log('Fetching usage data from API:', apiUrl);
      try {
       
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // The API already returns formatted data
        if (data.error) {
          throw new Error(data.error);
        }

        setUsage(data);
      } catch (err) {
        console.error('Error fetching usage:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch usage data');
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, [sdk, spaceId]);

  if (loading) {
    return (
      <Card>
        <SkeletonContainer>
          <SkeletonBodyText numberOfLines={5} />
        </SkeletonContainer>
      </Card>
    );
  }

  if (error) {
    return (
      <Note variant="negative" title="Error Loading Usage Data">
        {error}
      </Note>
    );
  }

  if (!usage) {
    return null;
  }

  const percentageUsed = ((usage.totalApiCalls / usage.quota) * 100).toFixed(1);
  const isHighUsage = parseFloat(percentageUsed) > 80;

  return (
    <Card>
      <div style={{ padding: '20px' }}>
        <Heading marginBottom="spacingS">Total API Requests</Heading>
        <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>
          {usage.totalApiCalls.toLocaleString()}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#536171' }}>
              {usage.totalApiCalls.toLocaleString()} / {usage.quota.toLocaleString()} per month
            </span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: isHighUsage ? '#d93b3b' : '#536171',
              }}
            >
              {percentageUsed}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '10px',
              backgroundColor: '#e5ebed',
              borderRadius: '5px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(parseFloat(percentageUsed), 100)}%`,
                backgroundColor: isHighUsage ? '#d93b3b' : '#0066ff',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        <Paragraph marginBottom="spacingM" style={{ fontSize: '12px', color: '#68737d' }}>
          Total API calls made this month from a {(usage.quota / 1000).toLocaleString()}K/month quota.
          This includes CMA, CDA, CPA, and GraphQL requests.
        </Paragraph>

        <div
          style={{
            borderTop: '1px solid #e5ebed',
            paddingTop: '16px',
            marginTop: '16px',
          }}
        >
          <Heading as="h3" marginBottom="spacingS" style={{ fontSize: '14px' }}>
            Breakdown by API type
          </Heading>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {usage.breakdown.cda > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#68737d' }}>CDA (Content Delivery):</span>
                <span style={{ fontWeight: 'bold' }}>{usage.breakdown.cda.toLocaleString()}</span>
              </div>
            )}
            {usage.breakdown.cpa > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#68737d' }}>CPA (Preview):</span>
                <span style={{ fontWeight: 'bold' }}>{usage.breakdown.cpa.toLocaleString()}</span>
              </div>
            )}
            {usage.breakdown.cma > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#68737d' }}>CMA (Management):</span>
                <span style={{ fontWeight: 'bold' }}>{usage.breakdown.cma.toLocaleString()}</span>
              </div>
            )}
            {usage.breakdown.graphql > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#68737d' }}>GraphQL:</span>
                <span style={{ fontWeight: 'bold' }}>{usage.breakdown.graphql.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <Paragraph marginTop="spacingM" style={{ fontSize: '11px', color: '#8091a5' }}>
          Period: {usage.period}
        </Paragraph>
      </div>
    </Card>
  );
};
