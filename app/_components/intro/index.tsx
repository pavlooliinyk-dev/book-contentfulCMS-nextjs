"use client";

import Intro from "./intro";
import { useLazyStyles } from "@/lib/hooks/useLazyStyles";

// Stable import function to prevent unnecessary re-renders
const importIntroStyles = () => import("./intro.module.css");

export default function IntroClient({ title }: { title?: string }) {
  const animationClassName = useLazyStyles(importIntroStyles, "intro");
  return <Intro title={title} animationClassName={animationClassName} />;
}