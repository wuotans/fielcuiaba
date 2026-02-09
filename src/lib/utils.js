import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function createPageUrl(pageName) {
  const routes = {
    Home: '/',
    News: '/news',
    NewsDetail: '/news',
    Events: '/events',
    EventDetail: '/events',
    Gallery: '/gallery',
    Raffles: '/raffles',
    MyTickets: '/my-tickets',
    AdminDashboard: '/admin',
    AdminNews: '/admin/news',
    AdminEvents: '/admin/events',
    AdminPhotos: '/admin/photos',
    AdminRaffles: '/admin/raffles',
    AdminTickets: '/admin/tickets',
    AdminReports: '/admin/reports',
  }
  return routes[pageName] || '/'
}