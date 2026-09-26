import { ArrowDown, ArrowUp, Minus, Workflow } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DataPage } from '../components/common/index.ts'
import { projectRecords, simulationRecords } from '../services/workspaceData.ts'

export function ScenarioSimulator() {
  const [searchParams] = useSearchParams()
  const [projectId, setProjectId] = useState(projectRecords[0]?.id)
  const [capacityChange, setCapacityChange] = useState(0)
  const [demandChange, setDemandChange] = useState(0)

  useEffect(() => {
    const projectParam = searchParams.get('project')
    if (!projectParam) return

    const match = projectRecords.find((project) => project.id === projectParam || project.code === projectParam || project.name === projectParam)
    if (match) {
      setProjectId(match.id)
    }
  }, [searchParams])

  useEffect(() => {
    const capacityParam = searchParams.get('capacity')
    const staffParam = searchParams.get('staff')
    const parsedCapacity = capacityParam !== null ? Number.parseFloat(capacityParam) : Number.NaN

    if (!Number.isNaN(parsedCapacity)) {
      setCapacityChange(parsedCapacity)
      return
    }

    const parsedStaff = staffParam !== null ? Number.parseFloat(staffParam) : Number.NaN
    if (!Number.isNaN(parsedStaff)) {
      setCapacityChange(parsedStaff)
    }
  }, [searchParams])

  useEffect(() => {
    const demandParam = searchParams.get('demand')
    const parsedDemand = demandParam !== null ? Number.parseFloat(demandParam) : Number.NaN
    if (!Number.isNaN(parsedDemand)) {
      setDemandChange(parsedDemand)
    }
  }, [searchParams])

  const baseline = simulationRecords.find((item) => item.projectId === projectId) ?? simulationRecords[0]
  const projection = useMemo(() => {
    const capacity = Math.max(0, baseline.capacity * (1 + capacityChange / 100))
    const demand = Math.max(0, baseline.demand * (1 + demandChange / 100))
    return { capacity, demand, utilization: capacity ? demand / capacity : 1, warning: demand > capacity }
  }, [baseline, capacityChange, demandChange])

  return <DataPage eyebrow="Decision tools" title="Scenario simulator" description="Explore the implications of different staffing and workload decisions."><section className="data-panel simulator"><div className="toolbar"><label className="field"><span>Project</span><select value={projectId} onChange={(event) => setProjectId(event.target.value)}>{projectRecords.slice(0, 40).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label></div><div className="simulator-controls"><label><span>Capacity change %</span><input type="number" value={capacityChange} onChange={(event) => setCapacityChange(Number(event.target.value))} /></label><label><span>Demand change %</span><input type="number" value={demandChange} onChange={(event) => setDemandChange(Number(event.target.value))} /></label></div><div className="before-after"><div><p>Before</p><strong>{Math.round(baseline.capacity)}</strong><small>capacity units</small><strong>{Math.round(baseline.demand)}</strong><small>demand units</small></div><div className="projection-arrow">{capacityChange > 0 ? <ArrowUp /> : capacityChange < 0 ? <ArrowDown /> : <Minus />}</div><div className={projection.warning ? 'after warning-tint' : 'after'}><p>Projected</p><strong>{Math.round(projection.capacity)}</strong><small>capacity units</small><strong>{Math.round(projection.demand)}</strong><small>demand units</small></div></div><div className="utilization-row"><span>Projected utilization</span><strong>{Math.round(projection.utilization * 100)}%</strong><div className="meter"><i style={{ width: `${Math.min(projection.utilization * 100, 100)}%` }} /></div></div>{projection.warning ? <div className="warning"><strong><Workflow size={16} /> Capacity insufficient</strong><span>Projected demand exceeds capacity by {Math.round(projection.demand - projection.capacity)} units.</span></div> : <div className="success-box">Projected capacity covers demand under these assumptions.</div>}</section></DataPage>
}
