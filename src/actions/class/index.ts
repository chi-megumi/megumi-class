'use server'

import * as classCrudModule from './class-crud'
import * as enrollmentModule from './enrollment'
import * as unitModule from './unit'
import * as examModule from './exam'
import * as settingsModule from './settings'

/**
 * Class CRUD & Joining Actions
 */
export async function createClassAction(
  ...args: Parameters<typeof classCrudModule.createClassAction>
) {
  return classCrudModule.createClassAction(...args)
}

export async function getTeacherClasses(
  ...args: Parameters<typeof classCrudModule.getTeacherClasses>
) {
  return classCrudModule.getTeacherClasses(...args)
}

export async function getStudentClasses(
  ...args: Parameters<typeof classCrudModule.getStudentClasses>
) {
  return classCrudModule.getStudentClasses(...args)
}

export async function requestJoinClass(
  ...args: Parameters<typeof classCrudModule.requestJoinClass>
) {
  return classCrudModule.requestJoinClass(...args)
}

export async function getTeacherClassDetails(
  ...args: Parameters<typeof classCrudModule.getTeacherClassDetails>
) {
  return classCrudModule.getTeacherClassDetails(...args)
}

export async function getStudentClassDetails(
  ...args: Parameters<typeof classCrudModule.getStudentClassDetails>
) {
  return classCrudModule.getStudentClassDetails(...args)
}

/**
 * Enrollment Management Actions
 */
export async function updateEnrollmentStatus(
  ...args: Parameters<typeof enrollmentModule.updateEnrollmentStatus>
) {
  return enrollmentModule.updateEnrollmentStatus(...args)
}

export async function removeStudentFromClass(
  ...args: Parameters<typeof enrollmentModule.removeStudentFromClass>
) {
  return enrollmentModule.removeStudentFromClass(...args)
}

export async function addStudentsToClass(
  ...args: Parameters<typeof enrollmentModule.addStudentsToClass>
) {
  return enrollmentModule.addStudentsToClass(...args)
}

/**
 * Unit Management Actions
 */
export async function createUnit(
  ...args: Parameters<typeof unitModule.createUnit>
) {
  return unitModule.createUnit(...args)
}

export async function updateUnitInfo(
  ...args: Parameters<typeof unitModule.updateUnitInfo>
) {
  return unitModule.updateUnitInfo(...args)
}

export async function deleteUnit(
  ...args: Parameters<typeof unitModule.deleteUnit>
) {
  return unitModule.deleteUnit(...args)
}

export async function updateUnitSettings(
  ...args: Parameters<typeof unitModule.updateUnitSettings>
) {
  return unitModule.updateUnitSettings(...args)
}

export async function updateUnitVocab(
  ...args: Parameters<typeof unitModule.updateUnitVocab>
) {
  return unitModule.updateUnitVocab(...args)
}

export async function getStudentUnitDetails(
  ...args: Parameters<typeof unitModule.getStudentUnitDetails>
) {
  return unitModule.getStudentUnitDetails(...args)
}

/**
 * Exam Management Actions
 */
export async function updateUnitExams(
  ...args: Parameters<typeof examModule.updateUnitExams>
) {
  return examModule.updateUnitExams(...args)
}

export async function deleteUnitExam(
  ...args: Parameters<typeof examModule.deleteUnitExam>
) {
  return examModule.deleteUnitExam(...args)
}

export async function updateClassExams(
  ...args: Parameters<typeof examModule.updateClassExams>
) {
  return examModule.updateClassExams(...args)
}

export async function deleteClassExam(
  ...args: Parameters<typeof examModule.deleteClassExam>
) {
  return examModule.deleteClassExam(...args)
}

/**
  * Settings & Management Actions
  */
export async function updateClassInfoAction(
  ...args: Parameters<typeof settingsModule.updateClassInfoAction>
) {
  return settingsModule.updateClassInfoAction(...args)
}

export async function regenerateInviteCodeAction(
  ...args: Parameters<typeof settingsModule.regenerateInviteCodeAction>
) {
  return settingsModule.regenerateInviteCodeAction(...args)
}

export async function deleteClassAction(
  ...args: Parameters<typeof settingsModule.deleteClassAction>
) {
  return settingsModule.deleteClassAction(...args)
}

export async function transferClassOwnershipAction(
  ...args: Parameters<typeof settingsModule.transferClassOwnershipAction>
) {
  return settingsModule.transferClassOwnershipAction(...args)
}

/**
 * Type Re-exports
 */
export type * from './types'
