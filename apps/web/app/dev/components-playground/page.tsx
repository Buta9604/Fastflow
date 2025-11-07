'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  Input,
  Select,
  Avatar,
  AvatarGroup,
  TopNav,
  TopNavLink,
  Sidebar,
  SidebarItem,
  SidebarSection,
} from 'ui'

export default function ComponentsPlayground() {
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    // Clear error on change
    if (formErrors[e.target.name]) {
      setFormErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    }
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, country: e.target.value }))
    if (formErrors.country) {
      setFormErrors((prev) => ({ ...prev, country: '' }))
    }
  }

  const handleSubmit = () => {
    const errors: Record<string, string> = {}
    if (!formData.name) errors.name = 'Name is required'
    if (!formData.email) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = 'Invalid email address'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
    } else {
      alert('Form submitted successfully!')
      setModalOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation */}
      <TopNav
        logo={
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-accent-500" />
            <span className="text-lg font-bold text-neutral-900">FlatFlow</span>
          </div>
        }
        actions={
          <>
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Avatar src="" fallback="JD" size="sm" />
          </>
        }
      >
        <TopNavLink href="#" active>
          Components
        </TopNavLink>
        <TopNavLink href="#">Documentation</TopNavLink>
        <TopNavLink href="#">Examples</TopNavLink>
      </TopNav>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar defaultCollapsed={false}>
          <SidebarSection title="Navigation">
            <SidebarItem
              href="#buttons"
              active
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                </svg>
              }
            >
              Buttons
            </SidebarItem>
            <SidebarItem
              href="#cards"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              }
            >
              Cards
            </SidebarItem>
            <SidebarItem
              href="#forms"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              }
            >
              Forms
            </SidebarItem>
            <SidebarItem
              href="#avatars"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            >
              Avatars
            </SidebarItem>
          </SidebarSection>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-6xl space-y-12">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-neutral-900">
                Component Playground
              </h1>
              <p className="mt-2 text-lg text-neutral-600">
                Interactive showcase of all FlatFlow UI components with accessibility
                features and design tokens.
              </p>
            </div>

            {/* Buttons Section */}
            <section id="buttons" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Buttons</h2>
                <p className="mt-1 text-neutral-600">
                  Interactive button components with multiple variants and sizes
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Button Variants</CardTitle>
                  <CardDescription>
                    Primary, secondary, outline, and ghost button styles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="primary" disabled>
                      Disabled
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Button Sizes</CardTitle>
                  <CardDescription>Small, medium, and large buttons</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Cards Section */}
            <section id="cards" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Cards</h2>
                <p className="mt-1 text-neutral-600">
                  Flexible card containers with semantic sub-components
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Default Card</CardTitle>
                    <CardDescription>
                      Standard card with border
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600">
                      This is a default card with a subtle border and padding.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm">Action</Button>
                  </CardFooter>
                </Card>

                <Card variant="outlined">
                  <CardHeader>
                    <CardTitle>Outlined Card</CardTitle>
                    <CardDescription>
                      Card with accent border
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600">
                      This card has a thicker accent-colored border.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm" variant="outline">
                      Action
                    </Button>
                  </CardFooter>
                </Card>

                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Elevated Card</CardTitle>
                    <CardDescription>Card with shadow</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600">
                      This card uses shadow for elevation effect.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm" variant="secondary">
                      Action
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </section>

            {/* Forms Section */}
            <section id="forms" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Form Inputs</h2>
                <p className="mt-1 text-neutral-600">
                  Accessible input and select components with validation states
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Input Fields</CardTitle>
                  <CardDescription>
                    Text inputs with labels, errors, and helper text
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Name"
                    placeholder="Enter your name"
                    fullWidth
                    required
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    helperText="We'll never share your email"
                    fullWidth
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    error="Password must be at least 8 characters"
                    fullWidth
                  />

                  <Input
                    label="Disabled Input"
                    placeholder="This is disabled"
                    disabled
                    fullWidth
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Select Dropdowns</CardTitle>
                  <CardDescription>
                    Custom-styled select components with options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    label="Country"
                    placeholder="Select a country"
                    options={[
                      { value: 'us', label: 'United States' },
                      { value: 'uk', label: 'United Kingdom' },
                      { value: 'ca', label: 'Canada' },
                      { value: 'au', label: 'Australia' },
                    ]}
                    fullWidth
                  />

                  <Select
                    label="Priority"
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                    ]}
                    error="Priority must be selected"
                    fullWidth
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Modal Form Example</CardTitle>
                  <CardDescription>
                    Complete form inside a modal with validation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setModalOpen(true)}>
                    Open Form Modal
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* Avatars Section */}
            <section id="avatars" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Avatars</h2>
                <p className="mt-1 text-neutral-600">
                  User avatars with image fallbacks and grouping
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Avatar Sizes</CardTitle>
                  <CardDescription>
                    Available sizes from extra small to extra large
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4">
                    <Avatar size="xs" fallback="XS" />
                    <Avatar size="sm" fallback="SM" />
                    <Avatar size="md" fallback="MD" />
                    <Avatar size="lg" fallback="LG" />
                    <Avatar size="xl" fallback="XL" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avatar Shapes</CardTitle>
                  <CardDescription>Circle and square variants</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4">
                    <Avatar shape="circle" fallback="Alice Smith" size="lg" />
                    <Avatar shape="square" fallback="Bob Jones" size="lg" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avatar Groups</CardTitle>
                  <CardDescription>
                    Display multiple avatars with overflow count
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AvatarGroup max={4} size="md">
                    <Avatar fallback="Alice Smith" />
                    <Avatar fallback="Bob Jones" />
                    <Avatar fallback="Charlie Brown" />
                    <Avatar fallback="Diana Prince" />
                    <Avatar fallback="Eve Wilson" />
                    <Avatar fallback="Frank Castle" />
                  </AvatarGroup>
                </CardContent>
              </Card>
            </section>

            {/* Accessibility Note */}
            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Accessibility Features</CardTitle>
                <CardDescription>
                  All components follow WAI-ARIA guidelines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-700">
                  <li>
                    <strong>Keyboard Navigation:</strong> All interactive elements are
                    keyboard accessible
                  </li>
                  <li>
                    <strong>ARIA Attributes:</strong> Proper roles, labels, and states
                    for screen readers
                  </li>
                  <li>
                    <strong>Focus Management:</strong> Modal traps focus, returns on close
                  </li>
                  <li>
                    <strong>Color Contrast:</strong> WCAG AA compliant text and background
                    ratios
                  </li>
                  <li>
                    <strong>Error Announcements:</strong> Form errors announced to screen
                    readers
                  </li>
                  <li>
                    <strong>Design Tokens:</strong> CSS variables for consistent theming
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Modal Example */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        size="md"
      >
        <ModalHeader>
          <ModalTitle>User Registration</ModalTitle>
          <ModalDescription>
            Fill out the form below to create your account
          </ModalDescription>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <Input
            name="name"
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleInputChange}
            error={formErrors.name}
            fullWidth
            required
          />

          <Input
            name="email"
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleInputChange}
            error={formErrors.email}
            helperText="We'll send a confirmation email"
            fullWidth
            required
          />

          <Select
            name="country"
            label="Country"
            placeholder="Select your country"
            options={[
              { value: 'us', label: 'United States' },
              { value: 'uk', label: 'United Kingdom' },
              { value: 'ca', label: 'Canada' },
              { value: 'au', label: 'Australia' },
            ]}
            value={formData.country}
            onChange={handleSelectChange}
            error={formErrors.country}
            fullWidth
          />
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
