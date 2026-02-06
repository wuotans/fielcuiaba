import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Upload, Calendar, MapPin, Ticket } from "lucide-react";
import { format } from "date-fns";

export default function AdminEvents() {
    const [user, setUser] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        image_url: '',
        ticket_price: 0,
        total_tickets: 100,
        raffle_limit: 100,
        status: 'ativo',
        published: true
    });
    const [uploading, setUploading] = useState(false);

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

    const { data: events, isLoading } = useQuery({
        queryKey: ['admin-events'],
        queryFn: () => base44.entities.Event.list('-created_date', 100),
        initialData: []
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Event.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-events']);
            setIsDialogOpen(false);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Event.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-events']);
            setIsDialogOpen(false);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.Event.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-events']);
        }
    });

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            date: '',
            location: '',
            image_url: '',
            ticket_price: 0,
            total_tickets: 100,
            raffle_limit: 100,
            status: 'ativo',
            published: true
        });
        setEditingEvent(null);
    };

    const handleEdit = (item) => {
        setEditingEvent(item);
        setFormData({
            title: item.title || '',
            description: item.description || '',
            date: item.date ? format(new Date(item.date), "yyyy-MM-dd'T'HH:mm") : '',
            location: item.location || '',
            image_url: item.image_url || '',
            ticket_price: item.ticket_price || 0,
            total_tickets: item.total_tickets || 100,
            raffle_limit: item.raffle_limit || 100,
            status: item.status || 'ativo',
            published: item.published !== false
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = { ...formData };
        if (editingEvent) {
            updateMutation.mutate({ id: editingEvent.id, data });
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
            setFormData({ ...formData, image_url: file_url });
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
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
            <AdminSidebar currentPage="AdminEvents" />
            
            <div className="flex-1 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Eventos</h1>
                        <p className="text-gray-400">Gerencie os eventos da Fiel Cuiabá</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-white text-black hover:bg-gray-200">
                                <Plus className="w-4 h-4 mr-2" />
                                Novo Evento
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Título do Evento</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="bg-zinc-800 border-zinc-700"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Descrição</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-zinc-800 border-zinc-700"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Data e Hora</Label>
                                        <Input
                                            type="datetime-local"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="bg-zinc-800 border-zinc-700"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Local</Label>
                                        <Input
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="bg-zinc-800 border-zinc-700"
                                            placeholder="Ex: Bar do Zé - Centro"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Preço do Ingresso (R$)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.ticket_price}
                                            onChange={(e) => setFormData({ ...formData, ticket_price: parseFloat(e.target.value) || 0 })}
                                            className="bg-zinc-800 border-zinc-700"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Total de Ingressos</Label>
                                        <Input
                                            type="number"
                                            value={formData.total_tickets}
                                            onChange={(e) => setFormData({ ...formData, total_tickets: parseInt(e.target.value) || 100 })}
                                            className="bg-zinc-800 border-zinc-700"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Limite Sorteio</Label>
                                        <Input
                                            type="number"
                                            value={formData.raffle_limit}
                                            onChange={(e) => setFormData({ ...formData, raffle_limit: parseInt(e.target.value) || 100 })}
                                            className="bg-zinc-800 border-zinc-700"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                            <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-800 border-zinc-700">
                                                <SelectItem value="ativo">Ativo</SelectItem>
                                                <SelectItem value="encerrado">Encerrado</SelectItem>
                                                <SelectItem value="cancelado">Cancelado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Imagem</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={formData.image_url}
                                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
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
                                </div>

                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={formData.published}
                                        onCheckedChange={(v) => setFormData({ ...formData, published: v })}
                                    />
                                    <Label>Publicado</Label>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-zinc-700">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="bg-white text-black hover:bg-gray-200" disabled={createMutation.isPending || updateMutation.isPending}>
                                        {editingEvent ? 'Salvar' : 'Criar'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                                    <TableHead className="text-gray-400">Evento</TableHead>
                                    <TableHead className="text-gray-400">Data</TableHead>
                                    <TableHead className="text-gray-400">Local</TableHead>
                                    <TableHead className="text-gray-400">Ingressos</TableHead>
                                    <TableHead className="text-gray-400">Status</TableHead>
                                    <TableHead className="text-gray-400 text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events?.map(item => (
                                    <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                        <TableCell className="text-white font-medium">
                                            {item.title}
                                        </TableCell>
                                        <TableCell className="text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {format(new Date(item.date), 'dd/MM/yyyy HH:mm')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                <span className="line-clamp-1">{item.location}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Ticket className="w-4 h-4" />
                                                {item.sold_tickets || 0}/{item.total_tickets}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.status === 'ativo' ? (
                                                <Badge className="bg-green-500/20 text-green-400 border-0">Ativo</Badge>
                                            ) : item.status === 'encerrado' ? (
                                                <Badge className="bg-zinc-700 text-gray-400 border-0">Encerrado</Badge>
                                            ) : (
                                                <Badge className="bg-red-500/20 text-red-400 border-0">Cancelado</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleEdit(item)} className="text-gray-400 hover:text-white">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(item.id)} className="text-red-400 hover:text-red-300">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
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