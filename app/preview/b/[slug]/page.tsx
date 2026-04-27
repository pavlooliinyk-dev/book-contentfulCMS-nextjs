"use client";
import { FC, Suspense } from "react";
import {
  ExperienceRoot,
  useFetchBySlug,
} from "@contentful/experiences-sdk-react";

import { createClient } from "contentful";
import { notFound } from "next/navigation";

interface IStudio {
  slug: string;
  locale?: string;
}

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});

const previewClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
  host: "preview.contentful.com",
});

const experienceTypeId =
  process.env.NEXT_PUBLIC_CTF_STUDIO_EXPERIENCE_TYPE_ID || "page";

const StudioWrapper: FC<IStudio> = ({ slug, locale = "en-US" }) => {
  // studioComponentAndTokenRegistration();
  const isPreviewMode = true; // TO DO
  const { experience, isLoading, error } = useFetchBySlug({
    client: isPreviewMode ? previewClient : client,
    slug,
    localeCode: locale,
    experienceTypeId,
  });

  if (isLoading) {
    return <PageSkeleton />;
  }
  if (error) {
    console.error(error);

    return notFound();
  }
  console.log("The actual experienceZ", experience, isLoading);
  return (
    <Suspense fallback={<>ERROR!</>}>
      <ExperienceRoot locale={locale} experience={experience} />
    </Suspense>
  );
};

const PageSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 p-10 min-h-screen">
      <div className=" w-full h-80 rounded-sm" />
      <div className="flex gap-4">
        <div className="w-full h-60 rounded-sm" />
        <div className="w-full h-60 rounded-sm" />
      </div>
      <div className="w-full h-[400px] rounded-sm" />
    </div>
  );
};

export default StudioWrapper;