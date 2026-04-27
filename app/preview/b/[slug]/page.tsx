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

console.log("process.env:", process.env);

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

const previewClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN!,
  host: "https://book-contentful-cms-nextj-git-485118-pavlooliinyk-devs-projects.vercel.app",
});

const experienceTypeId = "page";


const StudioWrapper: FC<IStudio> = ({ slug, locale = "en-US" }) => {
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