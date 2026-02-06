import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Upload, Image, X } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPhotos() {
    const [user, setUser] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        image_url: '',
        album: '',
        event_date: '',
        published: true
    });
    const [uploading, setUploading] = useState(false);
    const [bulkUploading, setBulkUploading] = useState(false);

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

    const { data: photos, isLoading } = useQuery({
        queryKey: ['admin-photos'],
        queryFn: () => base44.entities.Photo.list('-created_date', 200),
        initialData: []
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Photo.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-photos']);
            setIsDialogOpen(false);
            resetForm();
        }
    });

    const bulkCreateMutation = useMutation({
        mutationFn: (dataArray) => base44.entities.Photo.bulkCreate(dataArray),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-photos']);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.Photo.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-photos']);
        }
    });

    const resetForm = () => {
        setFormData({
            title: '',
            image_url: '',
            album: '',
            event_date: '',
            published: true
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate(formData);
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

    const handleBulkUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setBulkUploading(true);
        try {
            const uploadPromises = files.map(file => 
                base44.integrations.Core.UploadFile({ file })
            );
            const results = await Promise.all(uploadPromises);
            
            const photosToCreate = results.map(({ file_url }) => ({
                image_url: file_url,
                published: true
            }));

            await bulkCreateMutation.mutateAsync(photosToCreate);
        } catch (error) {
            console.error('Bulk upload failed:', error);
        } finally {
            setBulkUploading(false);
        }
    };

    // Group photos by album
    const albums = [...new Set(photos?.filter(p => p.album).map(p => p.album) || [])];

    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex">
            <AdminSidebar currentPage="AdminPhotos" />
            
            <div className="flex-1 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Galeria de Fotos</h1>
                        <p className="text-gray-400">{photos?.length || 0} fotos publicadas</p>
                    </div>
                    <div className="flex gap-3">
                        <label className="cursor-pointer">
                            <input 
                                type="file" 
                                accept="image/*" 
                                multiple 
                                onChange={handleBulkUpload} 
                                className="hidden" 
                            />
                            <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800" disabled={bulkUploading}>
                                <Upload className="w-4 h-4 mr-2" />
                                {bulkUploading ? 'Enviando...' : 'Upload em Massa'}
                            </Button>
                        </label>
                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button className="bg-white text-black hover:bg-gray-200">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar Foto
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                                <DialogHeader>
                                    <DialogTitle>Adicionar Foto</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Imagem</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={formData.image_url}
                                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                                className="bg-zinc-800 border-zinc-700"
                                                placeholder="URL da imagem"
                                                required
                                            />
                                            <label className="cursor-pointer">
                                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                                <Button type="button" variant="outline" className="border-zinc-700" disabled={uploading}>
                                                    <Upload className="w-4 h-4" />
                                                </Button>
                                            </label>
                                        </div>
                                        {formData.image_url && (
                                            <img src={formData.image_url} alt="Preview" className="w-full h-40 object-cover rounded-lg mt-2" />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Título/Descrição (opcional)</Label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="bg-zinc-800 border-zinc-700"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Álbum (opcional)</Label>
                                            <Input
                                                value={formData.album}
                                                onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                                                className="bg-zinc-800 border-zinc-700"
                                                placeholder="Ex: Jogo Corinthians x Palmeiras"
                                                list="albums"
                                            />
                                            <datalist id="albums">
                                                {albums.map(album => (
                                                    <option key={album} value={album} />
                                                ))}
                                            </datalist>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Data do Evento (opcional)</Label>
                                            <Input
                                                type="date"
                                                value={formData.event_date}
                                                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                                className="bg-zinc-800 border-zinc-700"
                                            />
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
                                        <Button type="submit" className="bg-white text-black hover:bg-gray-200" disabled={createMutation.isPending}>
                                            Adicionar
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Photo Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="aspect-square bg-zinc-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : photos?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {photos.map((photo, index) => (
                            <motion.div
                                key={photo.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.02 }}
                                className="relative aspect-square overflow-hidden rounded-xl group"
                            >
                                <img 
                                    src={photo.image_url} 
                                    alt={photo.title || "Foto"}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button 
                                        size="icon" 
                                        variant="destructive"
                                        onClick={() => deleteMutation.mutate(photo.id)}
                                        className="rounded-full"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                {!photo.published && (
                                    <div className="absolute top-2 right-2 bg-zinc-900/80 text-xs text-gray-400 px-2 py-1 rounded">
                                        Oculto
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Image className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-xl font-semibold text-white mb-2">Nenhuma foto ainda</h3>
                        <p className="text-gray-500">Comece adicionando fotos à galeria</p>
                    </div>
                )}
            </div>
        </div>
    );
}