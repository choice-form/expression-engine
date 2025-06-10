export interface DemoExample {
  title: string
  category: string
  expression: string
  description: string
  jsonData: string
  varsData: string
}

// 导入所有演示
import { basicDataAccessDemo } from "./basic-data-access"
import { mathCalculationDemo } from "./math-calculation"
import { dateTimeDemo } from "./date-time"
import { arrayOperationsDemo } from "./array-operations"
import { conditionalLogicDemo } from "./conditional-logic"
import { businessLogicDemo } from "./business-logic"
import { jmespathQueryDemo } from "./jmespath-query"
import { statisticsAnalysisDemo } from "./statistics-analysis"
import { financialCalculationDemo } from "./financial-calculation"
import { dataFilteringDemo } from "./data-filtering"
import { addressDisplayDemo } from "./address-display"
import { timeDifferenceDemo } from "./time-difference"
import { departmentAnalysisDemo } from "./department-analysis"
import { projectProgressDemo } from "./project-progress"
import { budgetUtilizationDemo } from "./budget-utilization"
import { userPreferencesDemo } from "./user-preferences"
import { userStatusDemo } from "./user-status"
import { contactFormattingDemo } from "./contact-formatting"
import { ratingCalculationDemo } from "./rating-calculation"
import { stringTemplateDemo } from "./string-template"
import { performanceMetricsDemo } from "./performance-metrics"
import { workingDaysDemo } from "./working-days"
import { dataPivotDemo } from "./data-pivot"
import { statusMappingDemo } from "./status-mapping"
import { smartRecommendationDemo } from "./smart-recommendation"
import { discountCalculationDemo } from "./discount-calculation"
import { inventoryStatusDemo } from "./inventory-status"
import { apiResponseDemo } from "./api-response"
import { stringOperationsDemo } from "./string-operations"
import { notificationPriorityDemo } from "./notification-priority"
import { trendAnalysisDemo } from "./trend-analysis"
import { goalAchievementDemo } from "./goal-achievement"
import { exceptionDetectionDemo } from "./exception-detection"
import { complexSearchDemo } from "./complex-search"
import { responsiveDataDemo } from "./responsive-data"
import { paginationCalculationDemo } from "./pagination-calculation"
import { formValidationDemo } from "./form-validation"
import { performanceTestingDemo } from "./performance-testing"

// 导出所有演示
export const DEMO_EXAMPLES: DemoExample[] = [
  basicDataAccessDemo,
  mathCalculationDemo,
  dateTimeDemo,
  arrayOperationsDemo,
  conditionalLogicDemo,
  businessLogicDemo,
  jmespathQueryDemo,
  statisticsAnalysisDemo,
  financialCalculationDemo,
  dataFilteringDemo,
  addressDisplayDemo,
  timeDifferenceDemo,
  departmentAnalysisDemo,
  projectProgressDemo,
  budgetUtilizationDemo,
  userPreferencesDemo,
  userStatusDemo,
  contactFormattingDemo,
  ratingCalculationDemo,
  stringTemplateDemo,
  performanceMetricsDemo,
  workingDaysDemo,
  dataPivotDemo,
  statusMappingDemo,
  smartRecommendationDemo,
  discountCalculationDemo,
  inventoryStatusDemo,
  apiResponseDemo,
  stringOperationsDemo,
  notificationPriorityDemo,
  trendAnalysisDemo,
  goalAchievementDemo,
  exceptionDetectionDemo,
  complexSearchDemo,
  responsiveDataDemo,
  paginationCalculationDemo,
  formValidationDemo,
  performanceTestingDemo,
]
