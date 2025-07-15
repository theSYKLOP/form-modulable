export interface DashboardStats {
  users: {
    total: number
    growth: number
  }
  forms: {
    total: number
    published: number
  }
  submissions: {
    total: number
    today: number
  }
  successRate: number
}

export interface ChartDataPoint {
  label: string
  value: number
}

export interface ChartData {
  registrations: ChartDataPoint[]
  submissions: ChartDataPoint[]
}

export interface RecentUser {
  id: number
  firstName: string | null
  lastName: string | null
  email: string
  createdAt: Date
}

export interface RecentSubmission {
  id: number
  formTitle: string
  userEmail: string
  createdAt: Date
}

export interface RecentActivity {
  users: RecentUser[]
  submissions: RecentSubmission[]
}

export interface DashboardResponse {
  stats: DashboardStats
  chartData: ChartData
  recentActivity: RecentActivity
}