import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const spaceId = searchParams.get('spaceId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!spaceId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: spaceId, startDate, endDate' },
        { status: 400 }
      );
    }

    // Get CMA token from environment
    const cmaToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
    if (!cmaToken) {
      return NextResponse.json(
        { error: 'Contentful Management Token not configured' },
        { status: 500 }
      );
    }

    // Fetch usage data from Contentful API
    const usageUrl = `https://api.contentful.com/spaces/${spaceId}/space_periodic_usages?startDate=${startDate}&endDate=${endDate}&metric[in]=cda,cpa,cma,gql`;
    
    const response = await fetch(usageUrl, {
      headers: {
        'Authorization': `Bearer ${cmaToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Contentful API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch usage data from Contentful' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': 'https://app.contentful.com',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error in contentful-usage API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://app.contentful.com',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
