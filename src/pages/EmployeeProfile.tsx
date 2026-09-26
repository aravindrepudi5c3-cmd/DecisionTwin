import { UserRound } from 'lucide-react'
import { PageFoundation } from '../components/common/index.ts'

export function EmployeeProfile() {
  return <PageFoundation eyebrow="People" title="Employee profile" description="Review a person’s role, skills, and availability in one place." icon={UserRound} message="Select an employee to view their profile" />
}
