import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface UsageData {
  totalApiCalls: number;
  quota: number;
  period: string;
  breakdown?: {
    cda?: number;
    cpa?: number;
    cma?: number;
    graphql?: number;
  };
}

export async function GET() {
  try {
    const spaceId = process.env.CONTENTFUL_SPACE_ID;
    const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

    if (!spaceId || !managementToken) {
      return NextResponse.json(
        { error: "Missing Contentful configuration. Please set CONTENTFUL_MANAGEMENT_TOKEN in your environment variables." },
        { status: 500 }
      );
    }

    // Get current month's usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startDate = startOfMonth.toISOString().split('T')[0];
    const endDate = endOfMonth.toISOString().split('T')[0];

    // First, get the organization ID from the space
    const spaceResponse = await fetch(
      `https://api.contentful.com/spaces/${spaceId}`,
      {
        headers: {
          Authorization: `Bearer ${managementToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!spaceResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch space info: ${spaceResponse.status}` },
        { status: spaceResponse.status }
      );
    }

    const spaceData = await spaceResponse.json();
    const organizationId = spaceData.sys.organization?.sys?.id;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Could not determine organization ID from space" },
        { status: 500 }
      );
    }

    // Fetch usage data from Contentful Management API at organization level
    const response = await fetch(
      `https://api.contentful.com/organizations/${organizationId}/space_periodic_usages?startDate=${startDate}&endDate=${endDate}&spaceId=${spaceId}`,
      {
        headers: {
          Authorization: `Bearer ${managementToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Contentful Management API Error:", errorText);
      return NextResponse.json(
        { error: `Failed to fetch usage data: ${response.status}`, detail: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Calculate total API calls from the usage data
    let totalApiCalls = 0;
    const breakdown = {
      cda: 0,
      cpa: 0,
      cma: 0,
      graphql: 0,
    };

    if (data.items && data.items.length > 0) {
      // Sum up all API calls from the current period
      data.items.forEach((item: any) => {
        if (item.metric === "cda") {
          breakdown.cda += item.unitOfMeasure || 0;
          totalApiCalls += item.unitOfMeasure || 0;
        } else if (item.metric === "cpa") {
          breakdown.cpa += item.unitOfMeasure || 0;
          totalApiCalls += item.unitOfMeasure || 0;
        } else if (item.metric === "cma") {
          breakdown.cma += item.unitOfMeasure || 0;
          totalApiCalls += item.unitOfMeasure || 0;
        } else if (item.metric === "gql") {
          breakdown.graphql += item.unitOfMeasure || 0;
          totalApiCalls += item.unitOfMeasure || 0;
        }
      });
    }

    const usageData: UsageData = {
      totalApiCalls,
      quota: 100000, // Standard quota, adjust based on your plan
      period: `${startOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      breakdown,
    };

    return NextResponse.json(usageData);
  } catch (error) {
    console.error("Error fetching Contentful usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
