import { Heading, Form, Paragraph, FormControl, TextInput } from '@contentful/f36-components';
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_RATING_COLOR, DEFAULT_RATING_MAX_STARS } from '../constants';

interface ConfigScreenProps {
  sdk: any;
}

interface AppParameters {
  maxStars?: number;
  starColor?: string;
}

export const ConfigScreen = ({ sdk }: ConfigScreenProps) => {
  const [parameters, setParameters] = useState<AppParameters>({
    maxStars: DEFAULT_RATING_MAX_STARS,
    starColor: DEFAULT_RATING_COLOR,
  });
  const parametersRef = useRef(parameters);

  useEffect(() => {
    parametersRef.current = parameters;
  }, [parameters]);

  useEffect(() => {
    // Sync rating config to Home Page entry on app configuration
    const syncRatingConfigToHomePage = async (nextParameters: AppParameters) => {
      try {
        const locale = sdk.locales?.default || 'en-US';
        const homePageEntries = await sdk.cma.entry.getMany({
          query: {
            content_type: 'homePage',
            limit: 1,
          },
        });

        const homePageEntry = homePageEntries?.items?.[0];
        if (!homePageEntry) {
          console.warn('Home Page entry not found. Skipping rating config sync.');
          return;
        }

        const rawImageWithTextSection = homePageEntry.fields?.imageWithTextSection?.[locale];
        let imageWithTextSection: Record<string, any> = {};

        if (typeof rawImageWithTextSection === 'string') {
          try {
            imageWithTextSection = JSON.parse(rawImageWithTextSection);
          } catch {
            imageWithTextSection = {};
          }
        } else if (rawImageWithTextSection && typeof rawImageWithTextSection === 'object') {
          imageWithTextSection = rawImageWithTextSection;
        }

        const updatedEntry = await sdk.cma.entry.update(
          { entryId: homePageEntry.sys.id },
          {
            ...homePageEntry,
            fields: {
              ...homePageEntry.fields,
              imageWithTextSection: {
                ...(homePageEntry.fields?.imageWithTextSection || {}),
                [locale]: {
                  ...imageWithTextSection,
                  ratingDisplayConfig: {
                    color: nextParameters.starColor || DEFAULT_RATING_COLOR,
                    maxStars: nextParameters.maxStars || DEFAULT_RATING_MAX_STARS,
                  },
                },
              },
            },
          }
        );

        await sdk.cma.entry.publish({ entryId: homePageEntry.sys.id }, updatedEntry);
        sdk.notifier.success('Rating config synced to Home Page successfully.');
      } catch (error) {
        console.error('Failed to sync rating config to Home Page:', error);
        sdk.notifier.error(`Failed to sync rating config: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    // Handle app configuration save
    sdk.app.onConfigure(async () => {
      await syncRatingConfigToHomePage(parametersRef.current);

      return {
        parameters: parametersRef.current,
        targetState: {
          EditorInterface: {},
        },
      };
    });

    // Load initial parameters from app configuration
    sdk.app.getParameters().then((params: AppParameters) => {
      setParameters({
        maxStars: params?.maxStars || DEFAULT_RATING_MAX_STARS,
        starColor: params?.starColor || DEFAULT_RATING_COLOR,
      });
    });

    sdk.app.setReady();
  }, [sdk]);

  const handleMaxStarsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= 10) {
      setParameters((currentParameters) => ({ ...currentParameters, maxStars: value }));
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParameters((currentParameters) => ({ ...currentParameters, starColor: e.target.value }));
  };

  return (
    <div style={{ margin: '80px', maxWidth: '800px' }}>
      <Form>
        <Heading>Goodreads Rating Field Configuration:</Heading>
        <Paragraph>
          Configure the star rating field extension for your content types.
        </Paragraph>

        <FormControl style={{ marginTop: '24px' }}>
          <FormControl.Label>Maximum Stars</FormControl.Label>
          <TextInput
            type="number"
            value={String(parameters.maxStars || 5)}
            onChange={handleMaxStarsChange}
            min={1}
            max={10}
          />
          <FormControl.HelpText>
            Maximum number of stars to display (1-10, default: 5)
          </FormControl.HelpText>
        </FormControl>

        <FormControl style={{ marginTop: '24px' }}>
          <FormControl.Label>Star Color</FormControl.Label>
          <TextInput
            type="text"
            value={parameters.starColor}
            onChange={handleColorChange}
            placeholder={DEFAULT_RATING_COLOR}
          />
          <FormControl.HelpText>
            Hex color code for the stars (default: {DEFAULT_RATING_COLOR} - gold)
          </FormControl.HelpText>
        </FormControl>

        <Paragraph style={{ marginTop: '32px' }}>
          <strong>Features:</strong>
        </Paragraph>
        <ul>
          <li>Interactive star selection (hover and click)</li>
          <li>Stores rating as integer (1-{parameters.maxStars || 5})</li>
          <li>Supports read-only mode for published entries</li>
          <li>Auto-resizes to content height</li>
          <li>Validation included</li>
        </ul>

        <Paragraph style={{ marginTop: '24px' }}>
          <strong>Usage:</strong> Add this field extension to your content types using the
          &quot;Rating&quot; field type.
        </Paragraph>
      </Form>
    </div>
  );
};
