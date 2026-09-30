// Demo Project Seeder for Developer Twin
// Creates real database entities for the authenticated developer on demand

import { developerProjectService } from './developerProjectService'
import { componentService } from './componentService'
import { dependencyService } from './dependencyService'
import type { DeveloperProject } from '../../types/developer'

export const demoSeedService = {
  async seedDemoProject(developerId: string): Promise<DeveloperProject> {
    // 1. Create Demo Project
    const project = await developerProjectService.createProject(developerId, {
      name: 'Demo: E-Commerce Backend',
      description: 'Online shopping microservice architecture with order processing, inventory, and payment gateways.',
      repository_url: 'https://github.com/decisiontwin-demo/ecommerce-backend',
      language: 'Python',
      framework: 'FastAPI',
    })

    // 2. Create Components
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
      name: 'Product Service',
      type: 'service',
      file_path: 'src/services/product_service.py',
    })

    // 3. Create Dependencies
    // Customer DB -> Customer Service (database_access)
    await dependencyService.createDependency(project.id, {
      source_component_id: customerDb.id,
      target_component_id: customerService.id,
      dependency_type: 'database_access',
    })

    // Customer Service -> Customer API (API_call)
    await dependencyService.createDependency(project.id, {
      source_component_id: customerService.id,
      target_component_id: customerApi.id,
      dependency_type: 'API_call',
    })

    // Order Service -> Customer Service (calls)
    await dependencyService.createDependency(project.id, {
      source_component_id: orderService.id,
      target_component_id: customerService.id,
      dependency_type: 'calls',
    })

    // Payment Service -> Order Service (calls)
    await dependencyService.createDependency(project.id, {
      source_component_id: paymentService.id,
      target_component_id: orderService.id,
      dependency_type: 'calls',
    })

    // Authentication Service -> Customer Service (depends_on)
    await dependencyService.createDependency(project.id, {
      source_component_id: authService.id,
      target_component_id: customerService.id,
      dependency_type: 'depends_on',
    })

    // Product Service -> Order Service (imports)
    await dependencyService.createDependency(project.id, {
      source_component_id: productService.id,
      target_component_id: orderService.id,
      dependency_type: 'imports',
    })

    return project
  },
}
