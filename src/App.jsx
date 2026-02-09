import { Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Home from './pages/Home'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Gallery from './pages/Gallery'
import Raffles from './pages/Raffles'
import MyTickets from './pages/MyTickets'
import AdminDashboard from './pages/AdminDashboard'
import AdminNews from './pages/AdminNews'
import AdminEvents from './pages/AdminEvents'
import AdminPhotos from './pages/AdminPhotos'
import AdminRaffles from './pages/AdminRaffles'
import AdminTickets from './pages/AdminTickets'
import AdminReports from './pages/AdminReports'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
      <Route path="/news" element={<Layout currentPageName="News"><News /></Layout>} />
      <Route path="/news/:id" element={<Layout currentPageName="NewsDetail"><NewsDetail /></Layout>} />
      <Route path="/events" element={<Layout currentPageName="Events"><Events /></Layout>} />
      <Route path="/events/:id" element={<Layout currentPageName="EventDetail"><EventDetail /></Layout>} />
      <Route path="/gallery" element={<Layout currentPageName="Gallery"><Gallery /></Layout>} />
      <Route path="/raffles" element={<Layout currentPageName="Raffles"><Raffles /></Layout>} />
      <Route path="/my-tickets" element={<Layout currentPageName="MyTickets"><MyTickets /></Layout>} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/news" element={<AdminNews />} />
      <Route path="/admin/events" element={<AdminEvents />} />
      <Route path="/admin/photos" element={<AdminPhotos />} />
      <Route path="/admin/raffles" element={<AdminRaffles />} />
      <Route path="/admin/tickets" element={<AdminTickets />} />
      <Route path="/admin/reports" element={<AdminReports />} />
    </Routes>
  )
}