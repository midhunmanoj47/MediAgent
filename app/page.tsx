"use client";

import { motion } from "motion/react";
import { FeatureBentoGrid } from "./_components/FeatureBentoGrid";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SplineSceneBasic } from "@/components/ui/demo";
import Link from "next/link";

export default function HeroSectionOne() {
  return (
    <div className="relative min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="w-full h-full">
          <SplineSceneBasic />
        </div>
      </div>
    </div>
  );
}

const Navbar = () => {
  const {user} = useUser();
  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800 bg-white">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
        <h1 className="text-base font-bold md:text-2xl">Cevel</h1>
      </div>
     {!user?
     <Link href={'/sign-in'}>
     <button className="w-24 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32 dark:bg-white dark:text-black dark:hover:bg-gray-200">
        Login
      </button></Link> :
    <div className ="flex gap-5">
      <UserButton/>
      <Link href="/dashboard"><Button>Dashboard</Button></Link>
    </div>  
  }
    </nav>
  );
};


