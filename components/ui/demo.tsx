'use client'

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { BackgroundPaths } from "@/components/ui/background-paths"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GradientButton } from "@/components/ui/gradient-button"

export function SplineSceneBasic() {
  return (
    <Card className="w-full h-full bg-white relative overflow-hidden border border-gray-200">
      {/* Background paths layer */}
      <BackgroundPaths />
      
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="blue"
      />

      {/* Robot layer - centered */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="w-full h-full max-w-2xl">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Top text layer */}
      <div className="absolute top-8 left-0 right-0 z-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600">
          AI Medi Buddy🩺
        </h1>
      </div>

      {/* Bottom button layer */}
      <div className="absolute bottom-8 left-0 right-0 z-20 text-center">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                            bg-white/70 hover:bg-white/100 dark:bg-black/95 dark:hover:bg-black/100 
                            text-black dark:text-white transition-all duration-300 
                            group-hover:-translate-y-0.5 border border-black/10 dark:border-white/10
                            hover:shadow-md dark:hover:shadow-neutral-800/50"
          >
            <span className="opacity-90 group-hover:opacity-100 transition-opacity">
              Discover More
            </span>
            <span
              className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                transition-all duration-300"
            >
              →
            </span>
          </Button>
        </Link>
      </div>
    </Card>
  )
}

function Demo() {
  return (
    <div className="flex gap-8">
      <GradientButton>Get Started</GradientButton>
      <GradientButton variant="variant">Get Started</GradientButton>
    </div>
  )
}

export { Demo } 