import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Upload, Trophy, Gift, PartyPopper, Shuffle } from "lucide-react";
import { format } from "date-fns";

export default function AdminRaffles() {
    const [user, setUser] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRaffle, setEditingRaffle] = useState(null);
    const [formData, setFormData] = useState({
        event_id: '',
        event_title: '',
        prize: '',
        prize_image: '',
        status: 'pendente'
    });
    const [uploading, setUploading] = useState(false);
    const [drawingRaffle, setDrawingRaffle] = useState(null);

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

    const { data: raffles, isLoading } = useQuery({
        queryKey: ['admin-raffles'],
        queryFn: () => base44.entities.Raffle.list('-created_date', 100),
        initialData: []
    });

    const { data: events } = useQuery({
        queryKey: ['admin-events-for-raffles'],
        queryFn: () => base44.entities.Event.list('-date', 100),
        initialData: []
    });

    const { data: tickets } = useQuery({
        queryKey: ['admin-tickets-for-raffles'],
        queryFn: () => base44.entities.Ticket.filter({ eligible_for_raffle: true, payment_status: 'pago' }, '-created_date', 1000),
        initialData: []
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Raffle.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-raffles']);
            setIsDialogOpen(false);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Raffle.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-raffles']);
            setIsDialogOpen(false);
            setDrawingRaffle(null);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.Raffle.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-raffles']);
        }
    });

    const resetForm = () => {
        setFormData({
            event_id: '',
            event_title: '',
            prize: '',
            prize_image: '',
            status: 'pendente'
        });
        setEditingRaffle(null);
    };

    const handleEdit = (item) => {
        setEditingRaffle(item);
        setFormData({
            event_id: item.event_id || '',
            event_title: item.event_title || '',
            prize: item.prize || '',
            prize_image: item.prize_image || '',
            status: item.status || 'pendente'
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const selectedEvent = events?.find(ev => ev.id === formData.event_id);
        const data = {
            ...formData,
            event_title: selectedEvent?.title || formData.event_title
        };
        
        if (editingRaffle) {
            updateMutation.mutate({ id: editingRaffle.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setFormData({ ...formData, prize_image: file_url });
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDrawWinner = (raffle) => {
        const eligibleTickets = tickets?.filter(t => t.event_id === raffle.event_id) || [];
        if (eligibleTickets.length === 0) {
            alert('Não há participantes elegíveis para este sorteio!');
            return;
        }

        setDrawingRaffle(raffle);
        
        // Simulate drawing animation
        let count = 0;
        const interval = setInterval(() => {
            count++;
            if (count >= 10) {
                clearInterval(interval);
                // Select random winner
                const winnerTicket = eligibleTickets[Math.floor(Math.random() * eligibleTickets.length)];
                
                updateMutation.mutate({
                    id: raffle.id,
                    data: {
                        ...raffle,
                        winner_email: winnerTicket.user_email,
                        winner_name: winnerTicket.user_name,
                        draw_date: new Date().toISOString(),
                        status: 'realizado'
                    }
                });
            }
        }, 200);
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
            <AdminSidebar currentPage="AdminRaffles" />
            
            <div className="flex-1 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Sorteios</h1>
                        <p className="text-gray-400">Gerencie os sorteios dos eventos</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-white text-black hover:bg-gray-200">
                                <Plus className="w-4 h-4 mr-2" />
                                Novo Sorteio
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                            <DialogHeader>
                                <DialogTitle>{editingRaffle ? 'Editar Sorteio' : 'Novo Sorteio'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Evento</Label>
                                    <Select value={formData.event_id} onValueChange={(v) => setFormData({ ...formData, event_id: v })}>
                                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                            <SelectValue placeholder="Selecione o evento" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-800 border-zinc-700">
                                            {events?.map(event => (
                                                <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Prêmio</Label>
                                    <Input
                                        value={formData.prize}
                                        onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                                        className="bg-zinc-800 border-zinc-700"
                                        placeholder="Ex: Camisa oficial do Corinthians"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Imagem do Prêmio (opcional)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={formData.prize_image}
                                            onChange={(e) => setFormData({ ...formData, prize_image: e.target.value })}
                                            className="bg-zinc-800 border-zinc-700"
                                            placeholder="URL da imagem"
                                        />
                                        <label className="cursor-pointer">
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                            <Button type="button" variant="outline" className="border-zinc-700" disabled={uploading}>
                                                <Upload className="w-4 h-4" />
                                            </Button>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-zinc-700">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="bg-white text-black hover:bg-gray-200" disabled={createMutation.isPending || updateMutation.isPending}>
                                        {editingRaffle ? 'Salvar' : 'Criar'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl">
                                    <Trophy className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total de Sorteios</p>
                                    <p className="text-2xl font-bold text-white">{raffles?.length || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/20 rounded-xl">
                                    <PartyPopper className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Realizados</p>
                                    <p className="text-2xl font-bold text-white">
                                        {raffles?.filter(r => r.status === 'realizado').length || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-500/20 rounded-xl">
                                    <Gift className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Participantes</p>
                                    <p className="text-2xl font-bold text-white">{tickets?.length || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                                    <TableHead className="text-gray-400">Evento</TableHead>
                                    <TableHead className="text-gray-400">Prêmio</TableHead>
                                    <TableHead className="text-gray-400">Participantes</TableHead>
                                    <TableHead className="text-gray-400">Ganhador</TableHead>
                                    <TableHead className="text-gray-400">Status</TableHead>
                                    <TableHead className="text-gray-400 text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {raffles?.map(raffle => {
                                    const participantCount = tickets?.filter(t => t.event_id === raffle.event_id).length || 0;
                                    
                                    return (
                                        <TableRow key={raffle.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                            <TableCell className="text-white font-medium">
                                                {raffle.event_title}
                                            </TableCell>
                                            <TableCell className="text-gray-400">
                                                {raffle.prize}
                                            </TableCell>
                                            <TableCell className="text-gray-400">
                                                {participantCount}
                                            </TableCell>
                                            <TableCell className="text-white">
                                                {raffle.winner_name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {raffle.status === 'realizado' ? (
                                                    <Badge className="bg-green-500/20 text-green-400 border-0">Realizado</Badge>
                                                ) : (
                                                    <Badge className="bg-yellow-500/20 text-yellow-400 border-0">Pendente</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {raffle.status === 'pendente' && (
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleDrawWinner(raffle)}
                                                            className="bg-yellow-500 text-black hover:bg-yellow-400"
                                                            disabled={drawingRaffle?.id === raffle.id}
                                                        >
                                                            <Shuffle className={`w-4 h-4 mr-1 ${drawingRaffle?.id === raffle.id ? 'animate-spin' : ''}`} />
                                                            {drawingRaffle?.id === raffle.id ? 'Sorteando...' : 'Sortear'}
                                                        </Button>
                                                    )}
                                                    <Button size="icon" variant="ghost" onClick={() => handleEdit(raffle)} className="text-gray-400 hover:text-white">
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(raffle.id)} className="text-red-400 hover:text-red-300">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}