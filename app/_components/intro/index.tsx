"use client";

import Intro from "./intro";
import { useLazyStyles } from "@/lib/hooks/useLazyStyles";

export default function IntroClient({ title }: { title?: string }) {
  const animationClassName = useLazyStyles(
    () => import("./intro.module.css"),
    "intro"
  );
  return <Intro title={title} animationClassName={animationClassName} />;
}