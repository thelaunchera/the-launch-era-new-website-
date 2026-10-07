/* eslint-disable */
// @ts-nocheck
// Route tree is kept explicit because the production GitHub Pages build consumes this file directly.

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as BookingLeadAutomationRouteImport } from './routes/booking-lead-automation'
import { Route as CleaningWebAppRouteImport } from './routes/cleaning-web-app'
import { Route as WebsiteAutomationRouteImport } from './routes/website-automation'
import { Route as VirtualAssistantRouteImport } from './routes/virtual-assistant'
import { Route as HelpRouteImport } from './routes/help'
import { Route as HowItWorksRouteImport } from './routes/how-it-works'
import { Route as SolutionsRouteImport } from './routes/solutions'
import { Route as FreeCleaningLeadGuideRouteImport } from './routes/free-cleaning-lead-guide'
import { Route as EsRouteImport } from './routes/es'
import { Route as EsBookingLeadAutomationRouteImport } from './routes/es.booking-lead-automation'
import { Route as EsCleaningWebAppRouteImport } from './routes/es.cleaning-web-app'
import { Route as EsWebsiteAutomationRouteImport } from './routes/es.website-automation'
import { Route as EsVirtualAssistantRouteImport } from './routes/es.virtual-assistant'
import { Route as EsFreeCleaningLeadGuideRouteImport } from './routes/es.free-cleaning-lead-guide'

const direct = (route:any,id:string,path:string) => route.update({
  id,
  path,
  getParentRoute: () => rootRouteImport,
} as any)

const IndexRoute = direct(IndexRouteImport,'/','/')
const BookingLeadAutomationRoute = direct(BookingLeadAutomationRouteImport,'/booking-lead-automation','/booking-lead-automation')
const CleaningWebAppRoute = direct(CleaningWebAppRouteImport,'/cleaning-web-app','/cleaning-web-app')
const WebsiteAutomationRoute = direct(WebsiteAutomationRouteImport,'/website-automation','/website-automation')
const VirtualAssistantRoute = direct(VirtualAssistantRouteImport,'/virtual-assistant','/virtual-assistant')
const HelpRoute = direct(HelpRouteImport,'/help','/help')
const HowItWorksRoute = direct(HowItWorksRouteImport,'/how-it-works','/how-it-works')
const SolutionsRoute = direct(SolutionsRouteImport,'/solutions','/solutions')
const FreeCleaningLeadGuideRoute = direct(FreeCleaningLeadGuideRouteImport,'/free-cleaning-lead-guide','/free-cleaning-lead-guide')
const EsRoute = direct(EsRouteImport,'/es','/es')
const EsBookingLeadAutomationRoute = direct(EsBookingLeadAutomationRouteImport,'/es/booking-lead-automation','/es/booking-lead-automation')
const EsCleaningWebAppRoute = direct(EsCleaningWebAppRouteImport,'/es/cleaning-web-app','/es/cleaning-web-app')
const EsWebsiteAutomationRoute = direct(EsWebsiteAutomationRouteImport,'/es/website-automation','/es/website-automation')
const EsVirtualAssistantRoute = direct(EsVirtualAssistantRouteImport,'/es/virtual-assistant','/es/virtual-assistant')
const EsFreeCleaningLeadGuideRoute = direct(EsFreeCleaningLeadGuideRouteImport,'/es/free-cleaning-lead-guide','/es/free-cleaning-lead-guide')

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/booking-lead-automation': typeof BookingLeadAutomationRoute
  '/cleaning-web-app': typeof CleaningWebAppRoute
  '/website-automation': typeof WebsiteAutomationRoute
  '/virtual-assistant': typeof VirtualAssistantRoute
  '/help': typeof HelpRoute
  '/how-it-works': typeof HowItWorksRoute
  '/solutions': typeof SolutionsRoute
  '/free-cleaning-lead-guide': typeof FreeCleaningLeadGuideRoute
  '/es': typeof EsRoute
  '/es/booking-lead-automation': typeof EsBookingLeadAutomationRoute
  '/es/cleaning-web-app': typeof EsCleaningWebAppRoute
  '/es/website-automation': typeof EsWebsiteAutomationRoute
  '/es/virtual-assistant': typeof EsVirtualAssistantRoute
  '/es/free-cleaning-lead-guide': typeof EsFreeCleaningLeadGuideRoute
}
export interface FileRoutesByTo extends FileRoutesByFullPath {}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/booking-lead-automation': typeof BookingLeadAutomationRoute
  '/cleaning-web-app': typeof CleaningWebAppRoute
  '/website-automation': typeof WebsiteAutomationRoute
  '/virtual-assistant': typeof VirtualAssistantRoute
  '/help': typeof HelpRoute
  '/how-it-works': typeof HowItWorksRoute
  '/solutions': typeof SolutionsRoute
  '/free-cleaning-lead-guide': typeof FreeCleaningLeadGuideRoute
  '/es': typeof EsRoute
  '/es/booking-lead-automation': typeof EsBookingLeadAutomationRoute
  '/es/cleaning-web-app': typeof EsCleaningWebAppRoute
  '/es/website-automation': typeof EsWebsiteAutomationRoute
  '/es/virtual-assistant': typeof EsVirtualAssistantRoute
  '/es/free-cleaning-lead-guide': typeof EsFreeCleaningLeadGuideRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: keyof FileRoutesByFullPath
  fileRoutesByTo: FileRoutesByTo
  to: keyof FileRoutesByTo
  id: keyof FileRoutesById
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  BookingLeadAutomationRoute: typeof BookingLeadAutomationRoute
  CleaningWebAppRoute: typeof CleaningWebAppRoute
  WebsiteAutomationRoute: typeof WebsiteAutomationRoute
  VirtualAssistantRoute: typeof VirtualAssistantRoute
  HelpRoute: typeof HelpRoute
  HowItWorksRoute: typeof HowItWorksRoute
  SolutionsRoute: typeof SolutionsRoute
  FreeCleaningLeadGuideRoute: typeof FreeCleaningLeadGuideRoute
  EsRoute: typeof EsRoute
  EsBookingLeadAutomationRoute: typeof EsBookingLeadAutomationRoute
  EsCleaningWebAppRoute: typeof EsCleaningWebAppRoute
  EsWebsiteAutomationRoute: typeof EsWebsiteAutomationRoute
  EsVirtualAssistantRoute: typeof EsVirtualAssistantRoute
  EsFreeCleaningLeadGuideRoute: typeof EsFreeCleaningLeadGuideRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': { id:'/'; path:'/'; fullPath:'/'; preLoaderRoute:typeof IndexRouteImport; parentRoute:typeof rootRouteImport }
    '/booking-lead-automation': { id:'/booking-lead-automation'; path:'/booking-lead-automation'; fullPath:'/booking-lead-automation'; preLoaderRoute:typeof BookingLeadAutomationRouteImport; parentRoute:typeof rootRouteImport }
    '/cleaning-web-app': { id:'/cleaning-web-app'; path:'/cleaning-web-app'; fullPath:'/cleaning-web-app'; preLoaderRoute:typeof CleaningWebAppRouteImport; parentRoute:typeof rootRouteImport }
    '/website-automation': { id:'/website-automation'; path:'/website-automation'; fullPath:'/website-automation'; preLoaderRoute:typeof WebsiteAutomationRouteImport; parentRoute:typeof rootRouteImport }
    '/virtual-assistant': { id:'/virtual-assistant'; path:'/virtual-assistant'; fullPath:'/virtual-assistant'; preLoaderRoute:typeof VirtualAssistantRouteImport; parentRoute:typeof rootRouteImport }
    '/help': { id:'/help'; path:'/help'; fullPath:'/help'; preLoaderRoute:typeof HelpRouteImport; parentRoute:typeof rootRouteImport }
    '/how-it-works': { id:'/how-it-works'; path:'/how-it-works'; fullPath:'/how-it-works'; preLoaderRoute:typeof HowItWorksRouteImport; parentRoute:typeof rootRouteImport }
    '/solutions': { id:'/solutions'; path:'/solutions'; fullPath:'/solutions'; preLoaderRoute:typeof SolutionsRouteImport; parentRoute:typeof rootRouteImport }
    '/free-cleaning-lead-guide': { id:'/free-cleaning-lead-guide'; path:'/free-cleaning-lead-guide'; fullPath:'/free-cleaning-lead-guide'; preLoaderRoute:typeof FreeCleaningLeadGuideRouteImport; parentRoute:typeof rootRouteImport }
    '/es': { id:'/es'; path:'/es'; fullPath:'/es'; preLoaderRoute:typeof EsRouteImport; parentRoute:typeof rootRouteImport }
    '/es/booking-lead-automation/': { id:'/es/booking-lead-automation'; path:'/es/booking-lead-automation'; fullPath:'/es/booking-lead-automation'; preLoaderRoute:typeof EsBookingLeadAutomationRouteImport; parentRoute:typeof rootRouteImport }
    '/es/cleaning-web-app/': { id:'/es/cleaning-web-app'; path:'/es/cleaning-web-app'; fullPath:'/es/cleaning-web-app'; preLoaderRoute:typeof EsCleaningWebAppRouteImport; parentRoute:typeof rootRouteImport }
    '/es/website-automation/': { id:'/es/website-automation'; path:'/es/website-automation'; fullPath:'/es/website-automation'; preLoaderRoute:typeof EsWebsiteAutomationRouteImport; parentRoute:typeof rootRouteImport }
    '/es/virtual-assistant/': { id:'/es/virtual-assistant'; path:'/es/virtual-assistant'; fullPath:'/es/virtual-assistant'; preLoaderRoute:typeof EsVirtualAssistantRouteImport; parentRoute:typeof rootRouteImport }
    '/es/free-cleaning-lead-guide': { id:'/es/free-cleaning-lead-guide'; path:'/es/free-cleaning-lead-guide'; fullPath:'/es/free-cleaning-lead-guide'; preLoaderRoute:typeof EsFreeCleaningLeadGuideRouteImport; parentRoute:typeof rootRouteImport }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute,
  BookingLeadAutomationRoute,
  CleaningWebAppRoute,
  WebsiteAutomationRoute,
  VirtualAssistantRoute,
  HelpRoute,
  HowItWorksRoute,
  SolutionsRoute,
  FreeCleaningLeadGuideRoute,
  EsRoute,
  EsBookingLeadAutomationRoute,
  EsCleaningWebAppRoute,
  EsWebsiteAutomationRoute,
  EsVirtualAssistantRoute,
  EsFreeCleaningLeadGuideRoute,
}

export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
    config: Awaited<ReturnType<typeof startInstance.getOptions>>
  }
}
