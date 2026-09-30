// Demo Project Seeder for Developer Twin
// Creates real database entities and pre-computed architectural simulations
// covering FinTech, AI Agent Orchestration, HealthTech EHR, and E-Commerce.

import { developerProjectService } from './developerProjectService'
import { componentService } from './componentService'
import { dependencyService } from './dependencyService'
import { analysisService } from './analysisService'
import type {
  DeveloperProject,
  ImpactAnalysisSimulation,
} from '../../types/developer'

export const demoSeedService = {
  /**
   * Seeds all 4 demo architectures with components, dependencies, and simulations.
   */
  async seedAllDemoProjects(developerId: string, forceReset = false): Promise<DeveloperProject[]> {
    const existing = await developerProjectService.getProjects(developerId)

    if (forceReset) {
      for (const p of existing) {
        if (p.name.startsWith('Demo:')) {
          await developerProjectService.deleteProject(developerId, p.id)
        }
      }
    }

    const currentList = forceReset ? [] : existing
    const projects: DeveloperProject[] = []

    // 1. FinTech Real-Time Payments Engine
    const fintech = await this.seedFintechProject(developerId, currentList)
    projects.push(fintech)

    // 2. Enterprise AI Agent Orchestrator
    const aiAgent = await this.seedAiAgentProject(developerId, currentList)
    projects.push(aiAgent)

    // 3. HealthTech Patient EHR Platform
    const healthtech = await this.seedHealthtechProject(developerId, currentList)
    projects.push(healthtech)

    // 4. E-Commerce Microservices Platform
    const ecommerce = await this.seedEcommerceProject(developerId, currentList)
    projects.push(ecommerce)

    return projects
  },

  /**
   * Backwards-compatible single-project seeder (seeds all and returns first).
   */
  async seedDemoProject(developerId: string): Promise<DeveloperProject> {
    const projects = await this.seedAllDemoProjects(developerId)
    return projects[0]
  },

  /**
   * 1. FinTech Real-Time Payments Engine (Go / Gin / Kafka)
   */
  async seedFintechProject(
    developerId: string,
    existingList: DeveloperProject[]
  ): Promise<DeveloperProject> {
    const projName = 'Demo: FinTech Real-Time Payments Engine'
    let project = existingList.find((p) => p.name === projName)

    if (!project) {
      project = await developerProjectService.createProject(developerId, {
        name: projName,
        description:
          'High-throughput distributed payment processing pipeline with sub-millisecond fraud detection, distributed ledger, and ACID transaction consensus.',
        repository_url: 'https://github.com/decisiontwin-demo/fintech-payment-engine',
        language: 'Go',
        framework: 'Gin / Kafka',
      })
    }

    const existingComps = await componentService.getComponents(project.id)
    if (existingComps.length === 0) {
      const gatewayApi = await componentService.createComponent(project.id, {
        name: 'Payment Gateway API',
        type: 'API',
        file_path: 'cmd/gateway/router.go',
      })
      const orchestrator = await componentService.createComponent(project.id, {
        name: 'Payment Orchestrator',
        type: 'service',
        file_path: 'internal/orchestrator/pipeline.go',
      })
      const kycService = await componentService.createComponent(project.id, {
        name: 'KYC & AML Validator',
        type: 'service',
        file_path: 'internal/compliance/kyc_validator.go',
      })
      const kafkaStream = await componentService.createComponent(project.id, {
        name: 'Kafka Transaction Stream',
        type: 'middleware',
        file_path: 'pkg/kafka/transaction_events.go',
      })
      const fraudWorker = await componentService.createComponent(project.id, {
        name: 'Fraud Detection Engine',
        type: 'service',
        file_path: 'workers/fraud/detector.go',
      })
      const cardAdapter = await componentService.createComponent(project.id, {
        name: 'Card Processor Adapter',
        type: 'service',
        file_path: 'internal/adapters/stripe_processor.go',
      })
      const ledgerDb = await componentService.createComponent(project.id, {
        name: 'Core Ledger DB',
        type: 'database',
        file_path: 'deployments/schema/ledger_transactions.sql',
      })
      const auditLogger = await componentService.createComponent(project.id, {
        name: 'Regulatory Audit Logger',
        type: 'service',
        file_path: 'internal/audit/compliance_logger.go',
      })

      // Dependencies
      await dependencyService.createDependency(project.id, {
        source_component_id: gatewayApi.id,
        target_component_id: orchestrator.id,
        dependency_type: 'API_call',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: orchestrator.id,
        target_component_id: kycService.id,
        dependency_type: 'calls',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: orchestrator.id,
        target_component_id: kafkaStream.id,
        dependency_type: 'calls',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: kafkaStream.id,
        target_component_id: fraudWorker.id,
        dependency_type: 'depends_on',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: fraudWorker.id,
        target_component_id: ledgerDb.id,
        dependency_type: 'database_access',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: orchestrator.id,
        target_component_id: cardAdapter.id,
        dependency_type: 'calls',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: cardAdapter.id,
        target_component_id: ledgerDb.id,
        dependency_type: 'database_access',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: ledgerDb.id,
        target_component_id: auditLogger.id,
        dependency_type: 'depends_on',
      })

      // Pre-calculated Simulation: Critical Ledger Column Migration
      const existingAnalyses = await analysisService.getAnalysisHistory(developerId, project.id)
      if (existingAnalyses.length === 0) {
        const sim: ImpactAnalysisSimulation = {
          project,
          targetComponent: ledgerDb,
          changeType: 'Database Schema Change',
          currentValue: 'balance_cents INT64 NOT NULL',
          proposedValue: 'balance_numeric NUMERIC(28,8) NOT NULL, currency_iso CHAR(3)',
          description:
            'Migrate core ledger balance from integer cents to arbitrary precision numeric to support global multi-currency fractional settlement.',
          riskLevel: 'CRITICAL',
          riskScore: 9.4,
          affectedComponents: [
            {
              component: cardAdapter,
              reason: 'Writes directly to Core Ledger DB. Insert & update queries require new numeric currency field.',
              dependencyRelationship: 'database_access',
              riskContribution: 2.8,
              direct: true,
            },
            {
              component: fraudWorker,
              reason: 'Reads ledger balances to calculate velocity anomaly limits. Serializer format break.',
              dependencyRelationship: 'database_access',
              riskContribution: 2.5,
              direct: true,
            },
            {
              component: orchestrator,
              reason: 'Orchestrates settlement payload passed to Card Processor and Kafka stream.',
              dependencyRelationship: 'calls',
              riskContribution: 2.1,
              direct: false,
            },
            {
              component: auditLogger,
              reason: 'Checksum verification on transaction history table schema altered.',
              dependencyRelationship: 'depends_on',
              riskContribution: 1.2,
              direct: true,
            },
            {
              component: gatewayApi,
              reason: 'Client response model contracts affected by currency format change.',
              dependencyRelationship: 'API_call',
              riskContribution: 0.8,
              direct: false,
            },
          ],
          affectedFiles: [
            'deployments/schema/ledger_transactions.sql',
            'internal/adapters/stripe_processor.go',
            'workers/fraud/detector.go',
            'internal/orchestrator/pipeline.go',
            'internal/audit/compliance_logger.go',
          ],
          affectedApis: [
            'POST /v1/ledger/transactions',
            'POST /v1/payments/settle',
            'GET /v1/audit/reconciliation',
          ],
          impactSummary:
            'Critical blast radius: Structural column migration on core transaction ledger. Alters serialization contracts across 5 downstream financial microservices.',
          recommendedTests: [
            {
              name: 'test_ledger_decimal_precision_migration',
              description: 'Validate zero-loss balance conversion on 10,000 historic ledger records',
              priority: 'CRITICAL',
            },
            {
              name: 'test_fraud_detection_balance_deserialization',
              description: 'Assert fraud worker correctly parses 8-decimal JSON balance payloads',
              priority: 'HIGH',
            },
            {
              name: 'test_payment_orchestrator_rollback_on_underflow',
              description: 'Verify ACID rollback behavior if multi-currency conversion throws arithmetic exception',
              priority: 'HIGH',
            },
            {
              name: 'test_regulatory_audit_checksum_verification',
              description: 'Verify audit table SHA-256 hash chaining remains intact after schema alteration',
              priority: 'MEDIUM',
            },
          ],
        }
        await analysisService.saveSimulationAnalysis(developerId, sim)
      }
    }

    return project
  },

  /**
   * 2. Enterprise AI Agent Orchestrator (Python / FastAPI / LangGraph)
   */
  async seedAiAgentProject(
    developerId: string,
    existingList: DeveloperProject[]
  ): Promise<DeveloperProject> {
    const projName = 'Demo: Enterprise AI Agent Orchestrator'
    let project = existingList.find((p) => p.name === projName)

    if (!project) {
      project = await developerProjectService.createProject(developerId, {
        name: projName,
        description:
          'Multi-agent cognitive execution pipeline coordinating LLM inference, vector embedding indices, sandbox tool execution, and episodic memory persistence.',
        repository_url: 'https://github.com/decisiontwin-demo/ai-agent-orchestrator',
        language: 'Python',
        framework: 'FastAPI / LangGraph',
      })
    }

    const existingComps = await componentService.getComponents(project.id)
    if (existingComps.length === 0) {
      const orchestratorApi = await componentService.createComponent(project.id, {
        name: 'Agent Orchestrator API',
        type: 'API',
        file_path: 'src/agents/orchestrator_router.py',
      })
      const guardrail = await componentService.createComponent(project.id, {
        name: 'Token Quota & Guardrail Service',
        type: 'service',
        file_path: 'src/safety/guardrail_filter.py',
      })
      const llmGateway = await componentService.createComponent(project.id, {
        name: 'LLM Inference Gateway',
        type: 'service',
        file_path: 'src/llm/inference_gateway.py',
      })
      const promptCache = await componentService.createComponent(project.id, {
        name: 'Prompt Template Cache',
        type: 'middleware',
        file_path: 'src/cache/redis_prompt_cache.py',
      })
      const episodicMem = await componentService.createComponent(project.id, {
        name: 'Episodic Memory Store',
        type: 'database',
        file_path: 'src/memory/hybrid_storage.py',
      })
      const vectorDb = await componentService.createComponent(project.id, {
        name: 'Vector Embedding DB',
        type: 'database',
        file_path: 'infra/vector_stores/pinecone_index.py',
      })
      const toolSandbox = await componentService.createComponent(project.id, {
        name: 'Tool Execution Sandbox',
        type: 'service',
        file_path: 'src/tools/secure_sandbox.py',
      })

      // Dependencies
      await dependencyService.createDependency(project.id, {
        source_component_id: orchestratorApi.id,
        target_component_id: guardrail.id,
        dependency_type: 'calls',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: guardrail.id,
        target_component_id: llmGateway.id,
        dependency_type: 'calls',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: llmGateway.id,
        target_component_id: promptCache.id,
        dependency_type: 'imports',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: orchestratorApi.id,
        target_component_id: episodicMem.id,
        dependency_type: 'database_access',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: episodicMem.id,
        target_component_id: vectorDb.id,
        dependency_type: 'database_access',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: orchestratorApi.id,
        target_component_id: toolSandbox.id,
        dependency_type: 'calls',
      })

      // Pre-calculated Simulation: Vector Embedding Upgrade
      const existingAnalyses = await analysisService.getAnalysisHistory(developerId, project.id)
      if (existingAnalyses.length === 0) {
        const sim: ImpactAnalysisSimulation = {
          project,
          targetComponent: vectorDb,
          changeType: 'API Change',
          currentValue: 'dimension: 768, metric: "cosine"',
          proposedValue: 'dimension: 1536, metric: "dotproduct", index_type: "HNSW"',
          description:
            'Upgrade vector embedding dimension to 1536 to support high-accuracy dense RAG retrieval with HNSW indexing.',
          riskLevel: 'HIGH',
          riskScore: 8.2,
          affectedComponents: [
            {
              component: episodicMem,
              reason: 'Vector index dimension mismatch causes catastrophic retrieval failure in past context lookups.',
              dependencyRelationship: 'database_access',
              riskContribution: 3.5,
              direct: true,
            },
            {
              component: orchestratorApi,
              reason: 'Agent prompt generation fails when RAG context returns dimension shape errors.',
              dependencyRelationship: 'calls',
              riskContribution: 2.8,
              direct: false,
            },
            {
              component: promptCache,
              reason: 'Cached prompt embeddings invalidated; potential cache stampede during warm-up.',
              dependencyRelationship: 'imports',
              riskContribution: 1.9,
              direct: false,
            },
          ],
          affectedFiles: [
            'infra/vector_stores/pinecone_index.py',
            'src/memory/hybrid_storage.py',
            'src/agents/orchestrator_router.py',
          ],
          affectedApis: [
            'POST /v1/agents/deliberate',
            'POST /v1/memory/retrieve',
          ],
          impactSummary:
            'High blast radius: Dimensionality mismatch will invalidate existing vector embeddings and cause memory lookup errors in agent deliberation cycles.',
          recommendedTests: [
            {
              name: 'test_vector_dimension_compatibility_1536',
              description: 'Validate vector storage and retrieval with 1536-dimensional embeddings',
              priority: 'CRITICAL',
            },
            {
              name: 'test_episodic_memory_retrieval_cosine_cutoff',
              description: 'Assert threshold filtering functions correctly under new dotproduct metric',
              priority: 'HIGH',
            },
            {
              name: 'test_orchestrator_fallback_on_empty_rag_results',
              description: 'Verify agent falls back gracefully if vector index rebuild is in progress',
              priority: 'HIGH',
            },
          ],
        }
        await analysisService.saveSimulationAnalysis(developerId, sim)
      }
    }

    return project
  },

  /**
   * 3. HealthTech Patient EHR Platform (TypeScript / Next.js / Node.js)
   */
  async seedHealthtechProject(
    developerId: string,
    existingList: DeveloperProject[]
  ): Promise<DeveloperProject> {
    const projName = 'Demo: HealthTech Patient EHR Platform'
    let project = existingList.find((p) => p.name === projName)

    if (!project) {
      project = await developerProjectService.createProject(developerId, {
        name: projName,
        description:
          'HIPAA-compliant electronic health records portal featuring HL7/FHIR integrations, prescription validation, and encrypted telemetry dispatch.',
        repository_url: 'https://github.com/decisiontwin-demo/healthtech-ehr-platform',
        language: 'TypeScript',
        framework: 'Next.js / Node.js',
      })
    }

    const existingComps = await componentService.getComponents(project.id)
    if (existingComps.length === 0) {
      const webPortal = await componentService.createComponent(project.id, {
        name: 'Clinical Web Portal',
        type: 'frontend',
        file_path: 'apps/web/pages/clinical/dashboard.tsx',
      })
      const fhirApi = await componentService.createComponent(project.id, {
        name: 'FHIR Interoperability API',
        type: 'API',
        file_path: 'services/fhir-api/src/routes/patient.ts',
      })
      const patientDb = await componentService.createComponent(project.id, {
        name: 'Encrypted Patient Records DB',
        type: 'database',
        file_path: 'packages/db/prisma/schema.prisma',
      })
      const rxValidator = await componentService.createComponent(project.id, {
        name: 'Prescription Validation Service',
        type: 'service',
        file_path: 'services/rx-validator/src/validator.ts',
      })
      const telehealthRelay = await componentService.createComponent(project.id, {
        name: 'Doctor Telehealth Relay',
        type: 'service',
        file_path: 'services/telehealth/src/webrtc_hub.ts',
      })
      const auditBus = await componentService.createComponent(project.id, {
        name: 'HIPAA Audit Event Bus',
        type: 'middleware',
        file_path: 'services/audit/src/event_bus.ts',
      })

      // Dependencies
      await dependencyService.createDependency(project.id, {
        source_component_id: webPortal.id,
        target_component_id: fhirApi.id,
        dependency_type: 'API_call',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: fhirApi.id,
        target_component_id: patientDb.id,
        dependency_type: 'database_access',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: webPortal.id,
        target_component_id: telehealthRelay.id,
        dependency_type: 'calls',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: rxValidator.id,
        target_component_id: patientDb.id,
        dependency_type: 'database_access',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: webPortal.id,
        target_component_id: rxValidator.id,
        dependency_type: 'calls',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: fhirApi.id,
        target_component_id: auditBus.id,
        dependency_type: 'calls',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: patientDb.id,
        target_component_id: auditBus.id,
        dependency_type: 'depends_on',
      })

      // Pre-calculated Simulation: Async Rx Validator Caching
      const existingAnalyses = await analysisService.getAnalysisHistory(developerId, project.id)
      if (existingAnalyses.length === 0) {
        const sim: ImpactAnalysisSimulation = {
          project,
          targetComponent: rxValidator,
          changeType: 'Architecture Change',
          currentValue: 'synchronous_fda_lookup: true, timeout_ms: 1200',
          proposedValue: 'asynchronous_event_driven: true, cache_ttl_seconds: 3600',
          description:
            'Implement asynchronous drug-drug interaction validation with FDA openAPI caching to eliminate consultation latency.',
          riskLevel: 'MEDIUM',
          riskScore: 5.1,
          affectedComponents: [
            {
              component: webPortal,
              reason: 'Prescription submit flow converted from blocking to optimistic UI with toast updates.',
              dependencyRelationship: 'calls',
              riskContribution: 3.1,
              direct: true,
            },
            {
              component: patientDb,
              reason: 'Rx validation status flag updated asynchronously via webhook.',
              dependencyRelationship: 'database_access',
              riskContribution: 2.0,
              direct: false,
            },
          ],
          affectedFiles: [
            'services/rx-validator/src/validator.ts',
            'apps/web/pages/clinical/dashboard.tsx',
          ],
          affectedApis: [
            'POST /v1/prescriptions/validate',
            'GET /v1/prescriptions/status/:id',
          ],
          impactSummary:
            'Moderate blast radius: Introduces async latency buffer. Backward-compatible payload with non-blocking cache lookups.',
          recommendedTests: [
            {
              name: 'test_fda_cache_hit_latency_under_50ms',
              description: 'Assert cached drug interaction checks complete in under 50ms',
              priority: 'HIGH',
            },
            {
              name: 'test_prescription_conflict_warning_event',
              description: 'Verify clinical portal receives real-time alert on dangerous drug interaction',
              priority: 'MEDIUM',
            },
          ],
        }
        await analysisService.saveSimulationAnalysis(developerId, sim)
      }
    }

    return project
  },

  /**
   * 4. E-Commerce Microservices Platform (Python / FastAPI)
   */
  async seedEcommerceProject(
    developerId: string,
    existingList: DeveloperProject[]
  ): Promise<DeveloperProject> {
    const projName = 'Demo: E-Commerce Microservices Platform'
    let project = existingList.find(
      (p) => p.name === projName || p.name === 'Demo: E-Commerce Backend'
    )

    if (!project) {
      project = await developerProjectService.createProject(developerId, {
        name: projName,
        description:
          'Online shopping microservice architecture with order processing, inventory, and payment gateways.',
        repository_url: 'https://github.com/decisiontwin-demo/ecommerce-backend',
        language: 'Python',
        framework: 'FastAPI',
      })
    }

    const existingComps = await componentService.getComponents(project.id)
    if (existingComps.length === 0) {
      const customerDb = await componentService.createComponent(project.id, {
        name: 'Customer DB',
        type: 'database',
        file_path: 'db/schemas/customers_v1.sql',
      })
      const customerService = await componentService.createComponent(project.id, {
        name: 'Customer Service',
        type: 'service',
        file_path: 'src/services/customer_service.py',
      })
      const customerApi = await componentService.createComponent(project.id, {
        name: 'Customer API',
        type: 'API',
        file_path: 'src/api/v1/customers_router.py',
      })
      const orderService = await componentService.createComponent(project.id, {
        name: 'Order Service',
        type: 'service',
        file_path: 'src/services/order_service.py',
      })
      const paymentService = await componentService.createComponent(project.id, {
        name: 'Payment Service',
        type: 'service',
        file_path: 'src/services/payment_service.py',
      })
      const authService = await componentService.createComponent(project.id, {
        name: 'Authentication Service',
        type: 'service',
        file_path: 'src/services/auth_service.py',
      })
      const productService = await componentService.createComponent(project.id, {
        name: 'Product Catalog Service',
        type: 'service',
        file_path: 'src/services/product_service.py',
      })

      // Dependencies
      await dependencyService.createDependency(project.id, {
        source_component_id: customerDb.id,
        target_component_id: customerService.id,
        dependency_type: 'database_access',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: customerService.id,
        target_component_id: customerApi.id,
        dependency_type: 'API_call',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: orderService.id,
        target_component_id: customerService.id,
        dependency_type: 'calls',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: paymentService.id,
        target_component_id: orderService.id,
        dependency_type: 'calls',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: authService.id,
        target_component_id: customerService.id,
        dependency_type: 'depends_on',
      })
      await dependencyService.createDependency(project.id, {
        source_component_id: productService.id,
        target_component_id: orderService.id,
        dependency_type: 'imports',
      })

      // Pre-calculated Simulation: Authentication Upgrade
      const existingAnalyses = await analysisService.getAnalysisHistory(developerId, project.id)
      if (existingAnalyses.length === 0) {
        const sim: ImpactAnalysisSimulation = {
          project,
          targetComponent: authService,
          changeType: 'Authentication Change',
          currentValue: 'JWT HS256 stateless signature',
          proposedValue: 'OAuth2 / OIDC PKCE + Redis Session Revocation',
          description:
            'Upgrade token authentication to asymmetric RS256 with distributed session blacklist for instant logout across microservices.',
          riskLevel: 'HIGH',
          riskScore: 7.8,
          affectedComponents: [
            {
              component: customerService,
              reason: 'Bearer token parser must validate RS256 public keys via JWKS endpoint.',
              dependencyRelationship: 'depends_on',
              riskContribution: 3.2,
              direct: true,
            },
            {
              component: orderService,
              reason: 'Inter-service token propagation requires new Authorization header format.',
              dependencyRelationship: 'calls',
              riskContribution: 2.6,
              direct: false,
            },
            {
              component: customerApi,
              reason: 'Public API gateway middleware rejects legacy HS256 tokens.',
              dependencyRelationship: 'API_call',
              riskContribution: 2.0,
              direct: false,
            },
          ],
          affectedFiles: [
            'src/services/auth_service.py',
            'src/services/customer_service.py',
            'src/api/v1/customers_router.py',
          ],
          affectedApis: [
            'POST /v1/auth/login',
            'POST /v1/auth/verify',
            'POST /v1/orders/checkout',
          ],
          impactSummary:
            'High blast radius: Token signature transition from symmetric HS256 to RS256 JWKS alters authentication contracts across all upstream services.',
          recommendedTests: [
            {
              name: 'test_jwks_public_key_rotation',
              description: 'Verify services automatically fetch and cache new public keys from auth JWKS',
              priority: 'HIGH',
            },
            {
              name: 'test_inter_service_token_propagation',
              description: 'Assert valid order checkout with new RS256 bearer token',
              priority: 'HIGH',
            },
            {
              name: 'test_revoked_session_rejection_at_gateway',
              description: 'Assert blacklisted session token is rejected at gateway in <10ms',
              priority: 'MEDIUM',
            },
          ],
        }
        await analysisService.saveSimulationAnalysis(developerId, sim)
      }
    }

    return project
  },
}

