"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileCode, Plus, RefreshCw, Trash2, Edit2 } from "lucide-react"

interface Prompt {
  id: string
  name: string
  template: string
  createdAt: string
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [template, setTemplate] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchPrompts = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/prompts")
      if (res.ok) {
        const data = await res.json()
        setPrompts(data.prompts ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrompts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editingId ? "PUT" : "POST"
    const url = editingId ? `/api/prompts?id=${editingId}` : "/api/prompts"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, template }),
    })

    if (res.ok) {
      setName("")
      setTemplate("")
      setShowForm(false)
      setEditingId(null)
      fetchPrompts()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this prompt?")) return
    const res = await fetch(`/api/prompts?id=${id}`, { method: "DELETE" })
    if (res.ok) fetchPrompts()
  }

  const handleEdit = (prompt: Prompt) => {
    setName(prompt.name)
    setTemplate(prompt.template)
    setEditingId(prompt.id)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Custom Prompts</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Create reusable prompt templates for automations
          </p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setName(""); setTemplate(""); }}>
          <Plus className="h-4 w-4" />
          New Prompt
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Prompt" : "New Prompt"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Daily Summary"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Template</label>
                <textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  placeholder="Describe what this prompt does..."
                  className="mt-1 flex min-h-32 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:placeholder:text-neutral-500 dark:focus-visible:ring-neutral-300"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? "Save Changes" : "Create"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditingId(null) }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-neutral-500">
              {prompts.length} prompt{prompts.length !== 1 ? "s" : ""}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchPrompts}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
          ) : prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileCode className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
              <p className="mt-3 text-sm text-neutral-500">No prompts yet</p>
              <p className="mt-1 text-xs text-neutral-400">
                Create your first custom prompt template
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="flex items-start gap-3 rounded-lg border border-neutral-100 p-4 dark:border-neutral-800"
                >
                  <FileCode className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{prompt.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(prompt.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-neutral-500">
                      {prompt.template}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(prompt)}
                      className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(prompt.id)}
                      className="rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
