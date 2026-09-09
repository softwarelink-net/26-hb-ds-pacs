import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  findUserByUsername,
  type UserRole,
  type UserRow,
  verifyPassword,
  writeAuditLog,
  persistDatabase,
} from '@/utils/db'

const SESSION_KEY = 'pacs_auth_token'

/** RBAC: route name → allowed roles */
export const ROLE_PERMISSIONS: Record<string, UserRole[]> = {
  dashboard: ['admin', 'manager', 'doctor', 'decider'],
  diagnosis: ['admin', 'manager', 'doctor'],
  'blind-review': ['admin', 'manager'],
  assets: ['admin', 'manager', 'decider'],
  'audit-logs': ['admin'],
  tender: ['admin', 'manager', 'doctor', 'decider'],
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<Pick<UserRow, 'id' | 'username' | 'role' | 'real_name' | 'department'> | null>(
    null,
  )
  const ready = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const role = computed(() => user.value?.role ?? 'decider')

  function restore() {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) user.value = JSON.parse(raw)
    } catch {
      user.value = null
    }
    ready.value = true
  }

  function persist() {
    if (user.value) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user.value))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }

  function login(username: string, password: string): { ok: boolean; message: string } {
    const row = findUserByUsername(username.trim())
    if (!row || !verifyPassword(password, row.password_hash)) {
      return { ok: false, message: '用户名或密码错误' }
    }
    user.value = {
      id: row.id,
      username: row.username,
      role: row.role as UserRole,
      real_name: row.real_name,
      department: row.department,
    }
    persist()
    writeAuditLog(row.id, 'LOGIN', 'auth')
    void persistDatabase()
    return { ok: true, message: '登录成功' }
  }

  function logout() {
    if (user.value) {
      writeAuditLog(user.value.id, 'LOGOUT', 'auth')
      void persistDatabase()
    }
    user.value = null
    persist()
  }

  function canAccess(routeName: string): boolean {
    const allowed = ROLE_PERMISSIONS[routeName]
    if (!allowed) return true
    return allowed.includes(role.value)
  }

  function canAdmin(): boolean {
    return role.value === 'admin'
  }

  function canDiagnose(): boolean {
    return role.value === 'admin' || role.value === 'manager' || role.value === 'doctor'
  }

  function canReview(): boolean {
    return role.value === 'admin' || role.value === 'manager'
  }

  function canSeePatientDetail(): boolean {
    return role.value === 'admin' || role.value === 'manager' || role.value === 'doctor'
  }

  return {
    user,
    ready,
    isAuthenticated,
    role,
    restore,
    login,
    logout,
    canAccess,
    canAdmin,
    canDiagnose,
    canReview,
    canSeePatientDetail,
  }
})
