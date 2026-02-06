import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Users, Ticket, Calendar, DollarSign, TrendingUp, 
    Newspaper, Image, Trophy, Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminDashboard() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const isAuth = await base44.auth.isAuthenticated();
                if (isAuth) {
                    const userData = await base44.auth.me();
                    if (userData.role !== 'admin') {
                        window.location.href = '/';
                    }
                    setUser(userData);
                } else {
                    base44.auth.redirectToLogin(window.location.href);
                }
            } catch (e) {
                base44.auth.redirectToLogin(window.location.href);
            }
        };
        loadUser();
    }, []);

    const { data: tickets } = useQuery({
        queryKey: ['admin-tickets'],
        queryFn: () => base44.entities.Ticket.list('-created_date', 1000),
        initialData: []
    });

    const { data: events } = useQuery({
        queryKey: ['admin-events'],
        queryFn: () => base44.entities.Event.list('-created_date', 100),
        initialData: []
    });

    const { data: news } = useQuery({
        queryKey: ['admin-news'],
        queryFn: () => base44.entities.News.list('-created_date', 100),
        initialData: []
    });

    const { data: photos } = useQuery({
        queryKey: ['admin-photos'],
        queryFn: () => base44.entities.Photo.list('-created_date', 100),
        initialData: []
    });

    // Calculate stats
    const paidTickets = tickets?.filter(t => t.payment_status === 'pago') || [];
    const totalRevenue = paidTickets.reduce((sum, t) => sum + (t.total_price || 0), 0);
    const totalTicketsSold = paidTickets.reduce((sum, t) => sum + (t.quantity || 1), 0);
    const activeEvents = events?.filter(e => e.status === 'ativo') || [];

    // Sales by day (last 7 days)
    const salesByDay = [...Array(7)].map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayTickets = paidTickets.filter(t => 
            format(new Date(t.created_date), 'yyyy-MM-dd') === dateStr
        );
        return {
            date: format(date, 'dd/MM'),
            vendas: dayTickets.length,
            receita: dayTickets.reduce((sum, t) => sum + (t.total_price || 0), 0)
        };
    });

    // Sales by event
    const salesByEvent = events?.slice(0, 5).map(event => {
        const eventTickets = paidTickets.filter(t => t.event_id === event.id);
        return {
            name: event.title?.substring(0, 20) + (event.title?.length > 20 ? '...' : ''),
            vendidos: eventTickets.reduce((sum, t) => sum + (t.quantity || 1), 0),
            receita: eventTickets.reduce((sum, t) => sum + (t.total_price || 0), 0)
        };
    }) || [];

    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex">
            <AdminSidebar currentPage="AdminDashboard" />
            
            <div className="flex-1 p-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-gray-400">Bem-vindo de volta, {user.full_name}!</p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Receita Total</p>
                                        <p className="text-2xl font-bold text-white">
                                            R$ {totalRevenue.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-500/20 rounded-xl">
                                        <DollarSign className="w-6 h-6 text-green-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Ingressos Vendidos</p>
                                        <p className="text-2xl font-bold text-white">{totalTicketsSold}</p>
                                    </div>
                                    <div className="p-3 bg-blue-500/20 rounded-xl">
                                        <Ticket className="w-6 h-6 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Eventos Ativos</p>
                                        <p className="text-2xl font-bold text-white">{activeEvents.length}</p>
                                    </div>
                                    <div className="p-3 bg-purple-500/20 rounded-xl">
                                        <Calendar className="w-6 h-6 text-purple-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Notícias</p>
                                        <p className="text-2xl font-bold text-white">{news?.length || 0}</p>
                                    </div>
                                    <div className="p-3 bg-orange-500/20 rounded-xl">
                                        <Newspaper className="w-6 h-6 text-orange-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-white">Vendas dos Últimos 7 Dias</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={salesByDay}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                                            <YAxis stroke="#9CA3AF" fontSize={12} />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: '#18181B', 
                                                    border: '1px solid #27272A',
                                                    borderRadius: '8px'
                                                }}
                                                labelStyle={{ color: '#fff' }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="vendas" 
                                                stroke="#fff" 
                                                strokeWidth={2}
                                                dot={{ fill: '#fff' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-white">Vendas por Evento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={salesByEvent} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                                            <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={10} width={100} />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: '#18181B', 
                                                    border: '1px solid #27272A',
                                                    borderRadius: '8px'
                                                }}
                                                labelStyle={{ color: '#fff' }}
                                            />
                                            <Bar dataKey="vendidos" fill="#fff" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Image className="w-5 h-5" />
                                Galeria
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-white">{photos?.length || 0}</p>
                            <p className="text-gray-500 text-sm">fotos publicadas</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Trophy className="w-5 h-5" />
                                Sorteios
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-white">
                                {paidTickets.filter(t => t.eligible_for_raffle).length}
                            </p>
                            <p className="text-gray-500 text-sm">participantes de sorteios</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Ticket Médio
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-white">
                                R$ {paidTickets.length > 0 ? (totalRevenue / paidTickets.length).toFixed(2) : '0.00'}
                            </p>
                            <p className="text-gray-500 text-sm">valor médio por compra</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}