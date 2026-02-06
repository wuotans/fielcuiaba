import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Filter, Ticket, Gift, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function AdminTickets() {
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState('');
    const [eventFilter, setEventFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const queryClient = useQueryClient();

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

    const { data: tickets, isLoading } = useQuery({
        queryKey: ['admin-tickets'],
        queryFn: () => base44.entities.Ticket.list('-created_date', 1000),
        initialData: []
    });

    const { data: events } = useQuery({
        queryKey: ['admin-events-for-tickets'],
        queryFn: () => base44.entities.Event.list('-date', 100),
        initialData: []
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Ticket.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-tickets']);
        }
    });

    const filteredTickets = tickets?.filter(ticket => {
        const matchSearch = 
            ticket.user_name?.toLowerCase().includes(search.toLowerCase()) ||
            ticket.user_email?.toLowerCase().includes(search.toLowerCase()) ||
            ticket.ticket_code?.toLowerCase().includes(search.toLowerCase());
        
        const matchEvent = eventFilter === 'all' || ticket.event_id === eventFilter;
        const matchStatus = statusFilter === 'all' || ticket.payment_status === statusFilter;
        
        return matchSearch && matchEvent && matchStatus;
    }) || [];

    const getEventTitle = (eventId) => {
        return events?.find(e => e.id === eventId)?.title || 'Evento';
    };

    const handleStatusChange = (ticketId, newStatus) => {
        const ticket = tickets.find(t => t.id === ticketId);
        updateMutation.mutate({ id: ticketId, data: { ...ticket, payment_status: newStatus } });
    };

    const exportToCSV = () => {
        const headers = ['Código', 'Nome', 'Email', 'Evento', 'Quantidade', 'Valor', 'Pagamento', 'Status', 'Sorteio', 'Data'];
        const rows = filteredTickets.map(ticket => [
            ticket.ticket_code,
            ticket.user_name,
            ticket.user_email,
            getEventTitle(ticket.event_id),
            ticket.quantity,
            ticket.total_price?.toFixed(2),
            ticket.payment_method,
            ticket.payment_status,
            ticket.eligible_for_raffle ? 'Sim' : 'Não',
            format(new Date(ticket.created_date), 'dd/MM/yyyy HH:mm')
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ingressos_${format(new Date(), 'yyyyMMdd')}.csv`;
        link.click();
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
            </div>
        );
    }

    const paidTickets = tickets?.filter(t => t.payment_status === 'pago') || [];
    const totalRevenue = paidTickets.reduce((sum, t) => sum + (t.total_price || 0), 0);

    return (
        <div className="min-h-screen bg-zinc-950 flex">
            <AdminSidebar currentPage="AdminTickets" />
            
            <div className="flex-1 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Ingressos</h1>
                        <p className="text-gray-400">{tickets?.length || 0} ingressos vendidos</p>
                    </div>
                    <Button onClick={exportToCSV} variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar CSV
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/20 rounded-xl">
                                    <Ticket className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Confirmados</p>
                                    <p className="text-2xl font-bold text-white">{paidTickets.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-500/20 rounded-xl">
                                    <Clock className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pendentes</p>
                                    <p className="text-2xl font-bold text-white">
                                        {tickets?.filter(t => t.payment_status === 'pendente').length || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl">
                                    <Gift className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">No Sorteio</p>
                                    <p className="text-2xl font-bold text-white">
                                        {tickets?.filter(t => t.eligible_for_raffle).length || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500/20 rounded-xl">
                                    <span className="text-purple-500 font-bold text-lg">R$</span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Receita Total</p>
                                    <p className="text-2xl font-bold text-white">
                                        {totalRevenue.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            placeholder="Buscar por nome, email ou código..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-zinc-900 border-zinc-800 text-white"
                        />
                    </div>
                    <Select value={eventFilter} onValueChange={setEventFilter}>
                        <SelectTrigger className="w-48 bg-zinc-900 border-zinc-800 text-white">
                            <SelectValue placeholder="Evento" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                            <SelectItem value="all">Todos os eventos</SelectItem>
                            {events?.map(event => (
                                <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="pago">Pago</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                                    <TableHead className="text-gray-400">Código</TableHead>
                                    <TableHead className="text-gray-400">Comprador</TableHead>
                                    <TableHead className="text-gray-400">Evento</TableHead>
                                    <TableHead className="text-gray-400">Qtd</TableHead>
                                    <TableHead className="text-gray-400">Valor</TableHead>
                                    <TableHead className="text-gray-400">Pagamento</TableHead>
                                    <TableHead className="text-gray-400">Status</TableHead>
                                    <TableHead className="text-gray-400">Sorteio</TableHead>
                                    <TableHead className="text-gray-400">Data</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTickets.map(ticket => (
                                    <TableRow key={ticket.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                        <TableCell className="font-mono text-white text-sm">
                                            {ticket.ticket_code}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="text-white font-medium">{ticket.user_name}</div>
                                                <div className="text-gray-500 text-sm">{ticket.user_email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-400">
                                            <span className="line-clamp-1">{getEventTitle(ticket.event_id)}</span>
                                        </TableCell>
                                        <TableCell className="text-white">{ticket.quantity}</TableCell>
                                        <TableCell className="text-white font-medium">
                                            R$ {ticket.total_price?.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-gray-400 capitalize">
                                            {ticket.payment_method === 'pix' ? 'PIX' : 'Cartão'}
                                        </TableCell>
                                        <TableCell>
                                            <Select 
                                                value={ticket.payment_status} 
                                                onValueChange={(value) => handleStatusChange(ticket.id, value)}
                                            >
                                                <SelectTrigger className="w-32 h-8 bg-transparent border-0 p-0">
                                                    {ticket.payment_status === 'pago' ? (
                                                        <Badge className="bg-green-500/20 text-green-400 border-0">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Pago
                                                        </Badge>
                                                    ) : ticket.payment_status === 'pendente' ? (
                                                        <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            Pendente
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-red-500/20 text-red-400 border-0">
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                            Cancelado
                                                        </Badge>
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-800 border-zinc-700">
                                                    <SelectItem value="pago">Pago</SelectItem>
                                                    <SelectItem value="pendente">Pendente</SelectItem>
                                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            {ticket.eligible_for_raffle ? (
                                                <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                                                    <Gift className="w-3 h-3 mr-1" />
                                                    Sim
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-400 text-sm">
                                            {format(new Date(ticket.created_date), 'dd/MM/yyyy HH:mm')}
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