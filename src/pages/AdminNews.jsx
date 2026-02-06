import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Upload, Star } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const categories = [
    { value: "jogo", label: "Jogo" },
    { value: "contratacao", label: "Contratação" },
    { value: "bastidores", label: "Bastidores" },
    { value: "fiel_cuiaba", label: "Fiel Cuiabá" },
    { value: "geral", label: "Geral" },
];

export default function AdminNews() {
    const [user, setUser] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        content: '',
        image_url: '',
        category: 'geral',
        featured: false,
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

    const { data: news, isLoading } = useQuery({
        queryKey: ['admin-news'],
        queryFn: () => base44.entities.News.list('-created_date', 100),
        initialData: []
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.News.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-news']);
            setIsDialogOpen(false);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.News.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-news']);
            setIsDialogOpen(false);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.News.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-news']);
        }
    });

    const resetForm = () => {
        setFormData({
            title: '',
            summary: '',
            content: '',
            image_url: '',
            category: 'geral',
            featured: false,
            published: true
        });
        setEditingNews(null);
    };

    const handleEdit = (item) => {
        setEditingNews(item);
        setFormData({
            title: item.title || '',
            summary: item.summary || '',
            content: item.content || '',
            image_url: item.image_url || '',
            category: item.category || 'geral',
            featured: item.featured || false,
            published: item.published !== false
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingNews) {
            updateMutation.mutate({ id: editingNews.id, data: formData });
        } else {
            createMutation.mutate(formData);
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
            <AdminSidebar currentPage="AdminNews" />
            
            <div className="flex-1 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Notícias</h1>
                        <p className="text-gray-400">Gerencie as notícias do site</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-white text-black hover:bg-gray-200">
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Notícia
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingNews ? 'Editar Notícia' : 'Nova Notícia'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Título</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="bg-zinc-800 border-zinc-700"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Resumo</Label>
                                    <Textarea
                                        value={formData.summary}
                                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                        className="bg-zinc-800 border-zinc-700"
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Conteúdo</Label>
                                    <Textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="bg-zinc-800 border-zinc-700"
                                        rows={6}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Categoria</Label>
                                        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                            <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-800 border-zinc-700">
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                                ))}
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

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={formData.featured}
                                            onCheckedChange={(v) => setFormData({ ...formData, featured: v })}
                                        />
                                        <Label>Destaque</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={formData.published}
                                            onCheckedChange={(v) => setFormData({ ...formData, published: v })}
                                        />
                                        <Label>Publicado</Label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-zinc-700">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="bg-white text-black hover:bg-gray-200" disabled={createMutation.isPending || updateMutation.isPending}>
                                        {editingNews ? 'Salvar' : 'Criar'}
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
                                    <TableHead className="text-gray-400">Título</TableHead>
                                    <TableHead className="text-gray-400">Categoria</TableHead>
                                    <TableHead className="text-gray-400">Status</TableHead>
                                    <TableHead className="text-gray-400">Data</TableHead>
                                    <TableHead className="text-gray-400 text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {news?.map(item => (
                                    <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                        <TableCell className="text-white">
                                            <div className="flex items-center gap-2">
                                                {item.featured && <Star className="w-4 h-4 text-yellow-500" />}
                                                <span className="line-clamp-1">{item.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-zinc-700 text-gray-300">
                                                {categories.find(c => c.value === item.category)?.label || item.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {item.published ? (
                                                <Badge className="bg-green-500/20 text-green-400 border-0">Publicado</Badge>
                                            ) : (
                                                <Badge className="bg-zinc-700 text-gray-400 border-0">Rascunho</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-400">
                                            {format(new Date(item.created_date), 'dd/MM/yyyy')}
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