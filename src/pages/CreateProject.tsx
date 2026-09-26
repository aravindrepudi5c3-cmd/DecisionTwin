import { ClipboardPlus } from 'lucide-react'
import { PageFoundation } from '../components/common/index.ts'

export function CreateProject() {
  return <PageFoundation eyebrow="Portfolio" title="New project" description="Capture the requirements that will guide future team and scenario decisions." icon={ClipboardPlus} message="Project setup is ready to be connected" />
}
