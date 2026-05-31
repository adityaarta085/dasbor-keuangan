'use client'

import { useState } from 'react'
import { Users, Plus, Mail } from 'lucide-react'

interface FamilyManagementProps {
  user: {
    id: string
    name?: string
    email: string
  }
}

export function FamilyManagement({ user }: FamilyManagementProps) {
  const [familyGroups, setFamilyGroups] = useState<any[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [memberEmail, setMemberEmail] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!groupName.trim()) {
        throw new Error('Please enter a group name')
      }

      // TODO: Implement API call to create family group
      const newGroup = {
        id: Math.random().toString(36).substring(2, 15),
        name: groupName,
        ownerId: user.id,
        members: [{ userId: user.id, email: user.email, role: 'owner' }],
      }

      setFamilyGroups([...familyGroups, newGroup])
      setGroupName('')
      setShowCreateForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!selectedGroupId) {
        throw new Error('Please select a group')
      }
      if (!memberEmail.trim()) {
        throw new Error('Please enter member email')
      }

      // TODO: Implement API call to add member to family group
      const updatedGroups = familyGroups.map((g) => {
        if (g.id === selectedGroupId) {
          return {
            ...g,
            members: [
              ...g.members,
              { userId: '', email: memberEmail, role: 'member' },
            ],
          }
        }
        return g
      })

      setFamilyGroups(updatedGroups)
      setMemberEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const selectedGroup = familyGroups.find((g) => g.id === selectedGroupId)

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Family Group */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Family Groups
          </h2>

          {showCreateForm ? (
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group name (e.g., My Family)"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setGroupName('')
                  }}
                  className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {familyGroups.length === 0 ? (
                <p className="text-sm text-secondary-foreground mb-4">
                  No family groups yet. Create one to start sharing finances!
                </p>
              ) : (
                <div className="space-y-2 mb-4">
                  {familyGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroupId(group.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${
                        selectedGroupId === group.id
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary'
                      }`}
                    >
                      {group.name}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-secondary-foreground hover:bg-secondary transition"
              >
                <Plus className="w-4 h-4" />
                New Group
              </button>
            </>
          )}
        </div>

        {/* Add Members to Group */}
        {selectedGroup && (
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Add Member
            </h3>

            <form onSubmit={handleAddMember} className="space-y-3">
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="Member email address"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Member'}
              </button>
            </form>
          </div>
        )}

        {/* Group Members */}
        {selectedGroup && (
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Members</h3>

            <div className="space-y-2">
              {selectedGroup.members.map((member: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.email}</p>
                    <p className="text-xs text-secondary-foreground capitalize">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">How Family Groups Work</h3>
        <ul className="space-y-2 text-sm text-secondary-foreground">
          <li>• Create a family group to share finances with family members</li>
          <li>• Invite members by their email addresses</li>
          <li>• Set different roles: Owner (full control), Admin (manage transactions), Member (view and add), Viewer (read-only)</li>
          <li>• Share budgets and track family expenses together</li>
          <li>• Generate reports for shared finances</li>
        </ul>
      </div>
    </div>
  )
}
