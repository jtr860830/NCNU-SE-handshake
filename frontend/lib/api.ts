export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

let authToken: string | null = null

// Set token after login
export function setAuthToken(token: string) {
  authToken = token
  localStorage.setItem("authToken", token)
}

// Get stored token on app init
export function getAuthToken() {
  if (typeof window !== "undefined") {
    authToken = localStorage.getItem("authToken")
  }
  return authToken
}

// Clear token on logout
export function clearAuthToken() {
  authToken = null
  localStorage.removeItem("authToken")
}

// Helper to make API calls with auth headers
async function apiCall(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth: boolean = true,
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (requiresAuth) {
    const token = getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }))
    throw new Error(error.detail || `API error: ${response.status}`)
  }

  return response.json()
}

// Auth endpoints
export const authAPI = {
  register: async (username: string, password: string, role: "client" | "worker" = "client") => {
    return apiCall(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ username, password, role }),
      },
      false,
    )
  },

  loginForm: async (username: string, password: string) => {
    const formData = new URLSearchParams()
    formData.append("username", username)
    formData.append("password", password)
    return apiCall(
      "/auth/login",
      {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
      false,
    )
  },

  loginJson: async (username: string, password: string) => {
    return apiCall(
      "/auth/login/json",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      },
      false,
    )
  },
}

// Project endpoints
export const projectAPI = {
  create: async (title: string, description: string) => {
    return apiCall("/projects/", {
      method: "POST",
      body: JSON.stringify({ title, description }),
    })
  },

  listOpen: async () => {
    return apiCall("/projects/open", { method: "GET" })
  },

  listClientProjects: async () => {
    return apiCall("/projects/me/client", { method: "GET" })
  },

  listWorkerProjects: async () => {
    return apiCall("/projects/me/worker", { method: "GET" })
  },

  update: async (projectId: number, updates: { title?: string; description?: string; status?: string; worker_id?: number }) => {
    return apiCall(`/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  },

  assignWorker: async (projectId: number, workerId: number) => {
    return apiCall(`/projects/${projectId}/assign?worker_id=${workerId}`, {
      method: "PATCH",
    })
  },

  complete: async (projectId: number, note?: string) => {
    return apiCall(`/projects/${projectId}/complete${note ? `?note=${encodeURIComponent(note)}` : ""}`, {
      method: "POST",
    })
  },

  reject: async (projectId: number) => {
    return apiCall(`/projects/${projectId}/reject`, {
      method: "POST",
    })
  },
}

// Quote endpoints
export const quoteAPI = {
  create: async (projectId: number, amount: number, days: number) => {
    return apiCall(`/quotes/projects/${projectId}`, {
      method: "POST",
      body: JSON.stringify({ amount, days }),
    })
  },

  listProjectQuotes: async (projectId: number) => {
    return apiCall(`/quotes/projects/${projectId}`, { method: "GET" })
  },

  listMyQuotes: async () => {
    return apiCall("/quotes/me", { method: "GET" })
  },

  acceptQuote: async (projectId: number, workerId: number) => {
    return apiCall(`/projects/${projectId}/assign?worker_id=${workerId}`, {
      method: "PATCH",
    })
  },

  rejectQuote: async (projectId: number) => {
    return apiCall(`/projects/${projectId}/reject`, {
      method: "POST",
    })
  },
}

// Deliverable endpoints
export const deliverableAPI = {
  create: async (projectId: number, fileUrl: string, note?: string) => {
    return apiCall(`/deliverables`, {
      method: "POST",
      body: JSON.stringify({ project_id: projectId, file_url: fileUrl, note }),
    })
  },

  listProjectDeliverables: async (projectId: number) => {
    return apiCall(`/deliverables/projects/${projectId}`, { method: "GET" })
  },

  get: async (deliverableId: number) => {
    return apiCall(`/deliverables/${deliverableId}`, { method: "GET" })
  },

  update: async (deliverableId: number, updates: { file_url?: string; note?: string }) => {
    return apiCall(`/deliverables/${deliverableId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  },

  delete: async (deliverableId: number) => {
    return apiCall(`/deliverables/${deliverableId}`, {
      method: "DELETE",
    })
  },

  uploadFile: async (projectId: number, file: File, note?: string) => {
    const formData = new FormData()
    formData.append("file", file)
    if (note) {
      formData.append("note", note)
    }

    const token = getAuthToken()
    const headers: HeadersInit = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(
      `${API_BASE_URL}/deliverables/projects/${projectId}/upload`,
      {
        method: "POST",
        body: formData,
        headers,
      },
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Upload failed" }))
      throw new Error(error.detail || `Upload error: ${response.status}`)
    }

    return response.json()
  },
}
