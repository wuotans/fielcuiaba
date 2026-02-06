import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, DollarSign, TrendingUp, Ticket, Calendar, Users, CreditCard, QrCode } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ['#fff', '#9CA3AF', '#6B7280', '#4B5563', '#374151'];

export default function AdminReports() {
    const [user, setUser] = useState(null);
    const [period, setPeriod] = useState('30');
    const [selectedEvent, setSelectedEvent] = useState('all');

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
        queryKey: ['admin-tickets-reports'],
        queryFn: () => base44.entities.Ticket.list('-created_date', 1000),
        initialData: []
    });

    const { data: events } = useQuery({
        queryKey: ['admin-events-reports'],
        queryFn: () => base44.entities.Event.list('-date', 100),
        initialData: []
    });

    // Filter by period
    const startDate = subDays(new Date(), parseInt(period));
    const filteredTickets = tickets?.filter(ticket => {
        const ticketDate = new Date(ticket.created_date);
        const matchPeriod = ticketDate >= startDate;
        const matchEvent = selectedEvent === 'all' || ticket.event_id === selectedEvent;
        return matchPeriod && matchEvent && ticket.payment_status === 'pago';
    }) || [];

    // Calculate metrics
    const totalRevenue = filteredTickets.reduce((sum, t) => sum + (t.total_price || 0), 0);
    const totalTickets = filteredTickets.reduce((sum, t) => sum + (t.quantity || 1), 0);
    const avgTicketValue = filteredTickets.length > 0 ? totalRevenue / filteredTickets.length : 0;

    // Sales by day
    const days = parseInt(period);
    const salesByDay = [...Array(Math.min(days, 30))].map((_, i) => {
        const date = subDays(new Date(), (Math.min(days, 30) - 1) - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayTickets = filteredTickets.filter(t => 
            format(new Date(t.created_date), 'yyyy-MM-dd') === dateStr
        );
        return {
            date: format(date, 'dd/MM'),
            vendas: dayTickets.length,
            receita: dayTickets.reduce((sum, t) => sum + (t.total_price || 0), 0)
        };
    });

    // Sales by event
    const salesByEvent = events?.map(event => {
        const eventTickets = filteredTickets.filter(t => t.event_id === event.id);
        return {
            name: event.title?.substring(0, 25) + (event.title?.length > 25 ? '...' : ''),
            fullName: event.title,
            vendidos: eventTickets.reduce((sum, t) => sum + (t.quantity || 1), 0),
            receita: eventTickets.reduce((sum, t) => sum + (t.total_price || 0), 0),
            total: event.total_tickets
        };
    }).filter(e => e.vendidos > 0).sort((a, b) => b.receita - a.receita) || [];

    // Payment methods
    const pixSales = filteredTickets.filter(t => t.payment_method === 'pix');
    const cardSales = filteredTickets.filter(t => t.payment_method === 'cartao');
    const paymentData = [
        { name: 'PIX', value: pixSales.reduce((sum, t) => sum + (t.total_price || 0), 0), count: pixSales.length },
        { name: 'Cartão', value: cardSales.reduce((sum, t) => sum + (t.total_price || 0), 0), count: cardSales.length }
    ];

    const exportReport = () => {
        const headers = ['Período', 'Receita Total', 'Ingressos Vendidos', 'Ticket Médio', 'PIX', 'Cartão'];
        const data = [
            `${period} dias`,
            `R$ ${totalRevenue.toFixed(2)}`,
            totalTickets,
            `R$ ${avgTicketValue.toFixed(2)}`,
            `R$ ${paymentData[0].value.toFixed(2)} (${paymentData[0].count})`,
            `R$ ${paymentData[1].value.toFixed(2)} (${paymentData[1].count})`
        ];

        let csvContent = headers.join(',') + '\n' + data.join(',') + '\n\n';
        csvContent += 'Vendas por Evento\n';
        csvContent += 'Evento,Vendidos,Receita\n';
        salesByEvent.forEach(e => {
            csvContent += `"${e.fullName}",${e.vendidos},R$ ${e.receita.toFixed(2)}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio_${format(new Date(), 'yyyyMMdd')}.csv`;
        link.click();
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex">
            <AdminSidebar currentPage="AdminReports" />
            
            <div className="flex-1 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Relatórios</h1>
                        <p className="text-gray-400">Análise de vendas e performance</p>
                    </div>
                    <div className="flex gap-3">
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                                <SelectItem value="7">Últimos 7 dias</SelectItem>
                                <SelectItem value="30">Últimos 30 dias</SelectItem>
                                <SelectItem value="90">Últimos 90 dias</SelectItem>
                                <SelectItem value="365">Último ano</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                            <SelectTrigger className="w-48 bg-zinc-900 border-zinc-800 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                                <SelectItem value="all">Todos os eventos</SelectItem>
                                {events?.map(event => (
                                    <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={exportReport} variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Ingressos Vendidos</p>
                                    <p className="text-2xl font-bold text-white">{totalTickets}</p>
                                </div>
                                <div className="p-3 bg-blue-500/20 rounded-xl">
                                    <Ticket className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Ticket Médio</p>
                                    <p className="text-2xl font-bold text-white">
                                        R$ {avgTicketValue.toFixed(2)}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-500/20 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-purple-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Transações</p>
                                    <p className="text-2xl font-bold text-white">{filteredTickets.length}</p>
                                </div>
                                <div className="p-3 bg-orange-500/20 rounded-xl">
                                    <Users className="w-6 h-6 text-orange-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white">Receita por Dia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={salesByDay}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                                        <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `R$${v}`} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#18181B', 
                                                border: '1px solid #27272A',
                                                borderRadius: '8px'
                                            }}
                                            labelStyle={{ color: '#fff' }}
                                            formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="receita" 
                                            stroke="#fff" 
                                            strokeWidth={2}
                                            dot={{ fill: '#fff' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white">Formas de Pagamento</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-72 flex items-center justify-center">
                                <div className="w-1/2">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={paymentData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {paymentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: '#18181B', 
                                                    border: '1px solid #27272A',
                                                    borderRadius: '8px'
                                                }}
                                                formatter={(value) => [`R$ ${value.toFixed(2)}`, '']}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-1/2 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-500/20 rounded-lg">
                                            <QrCode className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">PIX</p>
                                            <p className="text-gray-500 text-sm">
                                                R$ {paymentData[0].value.toFixed(2)} ({paymentData[0].count})
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                            <CreditCard className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Cartão</p>
                                            <p className="text-gray-500 text-sm">
                                                R$ {paymentData[1].value.toFixed(2)} ({paymentData[1].count})
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sales by Event Table */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white">Vendas por Evento</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                                    <TableHead className="text-gray-400">Evento</TableHead>
                                    <TableHead className="text-gray-400">Vendidos</TableHead>
                                    <TableHead className="text-gray-400">Total</TableHead>
                                    <TableHead className="text-gray-400">% Ocupação</TableHead>
                                    <TableHead className="text-gray-400 text-right">Receita</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salesByEvent.map((event, index) => (
                                    <TableRow key={index} className="border-zinc-800 hover:bg-zinc-800/50">
                                        <TableCell className="text-white font-medium">
                                            {event.fullName}
                                        </TableCell>
                                        <TableCell className="text-gray-400">{event.vendidos}</TableCell>
                                        <TableCell className="text-gray-400">{event.total}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-white rounded-full"
                                                        style={{ width: `${(event.vendidos / event.total) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-gray-400 text-sm">
                                                    {((event.vendidos / event.total) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-white text-right font-medium">
                                            R$ {event.receita.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}