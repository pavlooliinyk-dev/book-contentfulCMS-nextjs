import { Heading, Form, Paragraph } from '@contentful/f36-components';
import { useEffect, useState } from 'react';

interface ConfigScreenProps {
  sdk: any;
}

export const ConfigScreen = ({ sdk }: ConfigScreenProps) => {
  const [parameters, setParameters] = useState({});

  useEffect(() => {
    sdk.app.onConfigure(() => {
      return {
        parameters,
        targetState: {
          EditorInterface: {},
        },
      };
    });

    sdk.app.getParameters().then((params: any) => {
      setParameters(params || {});
    });

    sdk.app.setReady();
  }, [sdk, parameters]);

  return (
    <div style={{ margin: '80px', maxWidth: '800px' }}>
      <Form>
        <Heading>API Usage Dashboard Configuration</Heading>
        <Paragraph>
          This app displays your Contentful API usage statistics directly in your space.
        </Paragraph>
        <Paragraph>
          <strong>Features:</strong>
        </Paragraph>
        <ul>
          <li>View total API requests for the current month</li>
          <li>Monitor usage against your quota (100K/month standard)</li>
          <li>See breakdown by API type (CDA, CPA, CMA, GraphQL)</li>
          <li>Visual progress bar with warnings at 80% usage</li>
        </ul>
        <Paragraph>
          <strong>Note:</strong> This app uses the Contentful Management API to fetch usage data.
          No additional configuration is needed - the app will automatically use your current
          space credentials.
        </Paragraph>
      </Form>
    </div>
  );
};
