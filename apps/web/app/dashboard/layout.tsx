'use client'

import { useState } from 'react'
import {
  TopNav,
  TopNavLink,
  Sidebar,
  SidebarItem,
  SidebarSection,
  Button,
  Select,
  Avatar,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  Input,
} from 'ui'

// Mock data - replace with real data from API
const mockGroups = [
  { value: 'group1', label: 'Apartment 4B' },
  { value: 'group2', label: 'Beach House' },
  { value: 'group3', label: 'Office Team' },
]

const mockMembers = [
  { id: '1', name: 'Alice Smith', avatarUrl: '', role: 'OWNER' },
  { id: '2', name: 'Bob Johnson', avatarUrl: '', role: 'ADMIN' },
  { id: '3', name: 'Charlie Brown', avatarUrl: '', role: 'MEMBER' },
  { id: '4', name: 'Diana Prince', avatarUrl: '', role: 'MEMBER' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [selectedGroup, setSelectedGroup] = useState('group1')
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false)
  const [groupSettingsModalOpen, setGroupSettingsModalOpen] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(e.target.value)
    console.log('🔄 Group changed to:', e.target.value)
  }

  const handleAddMember = () => {
    console.log('➕ Adding member:', newMemberEmail)
    setNewMemberEmail('')
    setAddMemberModalOpen(false)
  }

  const handleGroupSettings = () => {
    console.log('⚙️ Opening group settings')
    setGroupSettingsModalOpen(true)
  }

  const handleMemberClick = (memberId: string) => {
    console.log('👤 Member clicked:', memberId)
  }

  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      {/* Top Navigation */}
      <TopNav
        logo={
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-500 text-white font-bold text-sm">
              FF
            </div>
            <span className="text-lg font-bold text-neutral-900">FlatFlow</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            {/* Group Selector */}
            <div className="hidden md:block">
              <Select
                options={mockGroups}
                value={selectedGroup}
                onChange={handleGroupChange}
                aria-label="Select group"
              />
            </div>

            {/* Add Button */}
            <Button
              size="sm"
              onClick={() => setAddMemberModalOpen(true)}
              aria-label="Add member"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              <span className="hidden sm:inline">Add Member</span>
            </Button>

            {/* Settings Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGroupSettings}
              aria-label="Group settings"
            >
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
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" />
              </svg>
            </Button>

            {/* User Avatar */}
            <Avatar fallback="You" size="sm" />
          </div>
        }
      >
        <TopNavLink href="/dashboard" active>
          Dashboard
        </TopNavLink>
        <TopNavLink href="/dashboard/expenses">Expenses</TopNavLink>
        <TopNavLink href="/dashboard/chores">Chores</TopNavLink>
        <TopNavLink href="/dashboard/balance">Balance</TopNavLink>
      </TopNav>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Members */}
        <Sidebar collapsible={false} className="hidden lg:flex">
          <div className="mb-4">
            <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Members ({mockMembers.length})
            </h2>
          </div>

          <div className="space-y-1">
            {mockMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => handleMemberClick(member.id)}
                className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-base hover:bg-neutral-100"
              >
                <Avatar
                  fallback={member.name}
                  size="sm"
                  src={member.avatarUrl}
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium text-neutral-900">
                    {member.name}
                  </div>
                  <div className="text-xs text-neutral-500">{member.role}</div>
                </div>
                {member.role === 'OWNER' && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-accent-500"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-200">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setAddMemberModalOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Invite Member
            </Button>
          </div>
        </Sidebar>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        size="md"
      >
        <ModalHeader>
          <ModalTitle>Invite Member</ModalTitle>
          <ModalDescription>
            Send an invitation to join this group
          </ModalDescription>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="friend@example.com"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            helperText="We'll send them an invitation link"
            fullWidth
            required
          />
        </ModalContent>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setAddMemberModalOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleAddMember}>Send Invitation</Button>
        </ModalFooter>
      </Modal>

      {/* Group Settings Modal */}
      <Modal
        isOpen={groupSettingsModalOpen}
        onClose={() => setGroupSettingsModalOpen(false)}
        size="lg"
      >
        <ModalHeader>
          <ModalTitle>Group Settings</ModalTitle>
          <ModalDescription>
            Manage your group preferences and details
          </ModalDescription>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <Input
            label="Group Name"
            placeholder="Apartment 4B"
            defaultValue="Apartment 4B"
            fullWidth
          />
          <Input
            label="Description"
            placeholder="Our shared living expenses"
            fullWidth
          />
          <Select
            label="Currency"
            options={[
              { value: 'USD', label: 'USD - US Dollar' },
              { value: 'EUR', label: 'EUR - Euro' },
              { value: 'GBP', label: 'GBP - British Pound' },
            ]}
            defaultValue="USD"
            fullWidth
          />
        </ModalContent>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setGroupSettingsModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log('💾 Saving group settings')
              setGroupSettingsModalOpen(false)
            }}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
