import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  dashboardStats,
  isBlindMode,
  listAuditLogs,
  listBlindPackages,
  listConfigs,
  listDevices,
  listPatients,
  listStudies,
  persistDatabase,
  type AuditLogRow,
  type BlindPackageRow,
  type DeviceRow,
  type PatientRow,
  type StudyRow,
  type SystemConfigRow,
  unsealBlindPackage,
  updateConfig,
  updateDeviceStatus,
  updateStudyReport,
  writeAuditLog,
} from '@/utils/db'
import { useAuthStore } from '@/stores/auth'

export const usePacsStore = defineStore('pacs', () => {
  const patients = ref<PatientRow[]>([])
  const studies = ref<StudyRow[]>([])
  const devices = ref<DeviceRow[]>([])
  const audits = ref<AuditLogRow[]>([])
  const configs = ref<SystemConfigRow[]>([])
  const packages = ref<BlindPackageRow[]>([])
  const stats = ref(dashboardStats())
  const blindMode = ref(true)

  function refresh() {
    const auth = useAuthStore()
    blindMode.value = isBlindMode()
    // Decider always sees masked patients; doctor masked when blind mode on
    const maskPatients = auth.role === 'decider' || (blindMode.value && auth.role === 'doctor')
    patients.value = listPatients(maskPatients)
    studies.value = listStudies()
    devices.value = listDevices()
    audits.value = listAuditLogs()
    configs.value = listConfigs()
    // Unseal preview only when reviewer and dark-mode off
    packages.value = listBlindPackages(auth.canReview() && !blindMode.value)
    stats.value = dashboardStats()
  }

  function saveReport(studyUid: string, summary: string, status: StudyRow['status']) {
    const auth = useAuthStore()
    updateStudyReport(studyUid, summary, status)
    writeAuditLog(auth.user?.id ?? null, 'EXPORT_REPORT', studyUid)
    void persistDatabase()
    refresh()
  }

  function viewStudy(studyUid: string) {
    const auth = useAuthStore()
    writeAuditLog(auth.user?.id ?? null, 'VIEW_IMAGE', studyUid)
    void persistDatabase()
    refresh()
  }

  function setConfig(key: string, value: string) {
    const auth = useAuthStore()
    updateConfig(key, value)
    writeAuditLog(auth.user?.id ?? null, 'TOGGLE_CONFIG', key)
    void persistDatabase()
    refresh()
  }

  function setDeviceStatus(deviceId: string, status: DeviceRow['status']) {
    const auth = useAuthStore()
    updateDeviceStatus(deviceId, status)
    writeAuditLog(auth.user?.id ?? null, 'UPDATE_DEVICE', deviceId)
    void persistDatabase()
    refresh()
  }

  function unseal(id: number) {
    const auth = useAuthStore()
    if (!auth.canReview()) return
    unsealBlindPackage(id)
    writeAuditLog(auth.user?.id ?? null, 'UNSEAL_PACKAGE', String(id))
    void persistDatabase()
    refresh()
  }

  return {
    patients,
    studies,
    devices,
    audits,
    configs,
    packages,
    stats,
    blindMode,
    refresh,
    saveReport,
    viewStudy,
    setConfig,
    setDeviceStatus,
    unseal,
  }
})
