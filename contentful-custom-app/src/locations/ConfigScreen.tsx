import { Heading, Form, Paragraph, FormControl, TextInput } from '@contentful/f36-components';
import { useEffect, useState } from 'react';

interface ConfigScreenProps {
  sdk: any;
}

interface AppParameters {
  maxStars?: number;
  starColor?: string;
}

export const ConfigScreen = ({ sdk }: ConfigScreenProps) => {
  const [parameters, setParameters] = useState<AppParameters>({
    maxStars: 5,
    starColor: '#FFD700',
  });

  useEffect(() => {
    sdk.app.onConfigure(() => {
      return {
        parameters,
        targetState: {
          EditorInterface: {},
        },
      };
    });

    sdk.app.getParameters().then((params: AppParameters) => {
      setParameters({
        maxStars: params?.maxStars || 5,
        starColor: params?.starColor || '#FFD700',
      });
    });

    sdk.app.setReady();
  }, [sdk, parameters]);

  const handleMaxStarsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= 10) {
      setParameters({ ...parameters, maxStars: value });
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParameters({ ...parameters, starColor: e.target.value });
  };

  return (
    <div style={{ margin: '80px', maxWidth: '800px' }}>
      <Form>
        <Heading>Goodreads Rating Field Configuration</Heading>
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
            placeholder="#FFD700"
          />
          <FormControl.HelpText>
            Hex color code for the stars (default: #FFD700 - gold)
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
          "Rating" field type.
        </Paragraph>
      </Form>
    </div>
  );
};
