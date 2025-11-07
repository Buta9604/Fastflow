import { Button, ThemeSwitcher } from 'ui'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <div className="w-full max-w-4xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance">
            Welcome to <span className="text-accent-600">FlatFlow</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A modern monorepo powered by pnpm workspaces, Next.js 14+, and TypeScript
          </p>
        </div>

        {/* Theme Switcher */}
        <div className="flex justify-center">
          <div className="bg-surface border border-border rounded-card p-6 shadow-md">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Button Examples */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-center">Button Variants</h2>

          <div className="grid gap-6">
            {/* Primary Buttons */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Primary</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Secondary</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" size="sm">Small</Button>
                <Button variant="secondary" size="md">Medium</Button>
                <Button variant="secondary" size="lg">Large</Button>
              </div>
            </div>

            {/* Outline Buttons */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Outline</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">Small</Button>
                <Button variant="outline" size="md">Medium</Button>
                <Button variant="outline" size="lg">Large</Button>
              </div>
            </div>

            {/* Ghost Buttons */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Ghost</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost" size="sm">Small</Button>
                <Button variant="ghost" size="md">Medium</Button>
                <Button variant="ghost" size="lg">Large</Button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex justify-center gap-4 pt-8">
          <Button variant="primary" size="lg">Get Started</Button>
          <Button variant="outline" size="lg">Learn More</Button>
        </div>
      </div>
    </main>
  )
}
