import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, X, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Gallery() {
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [selectedAlbum, setSelectedAlbum] = useState('all');

    const { data: photos, isLoading } = useQuery({
        queryKey: ['photos'],
        queryFn: () => base44.entities.Photo.filter({ published: true }, '-created_date', 100),
        initialData: []
    });

    // Get unique albums
    const albums = ['all', ...new Set(photos?.filter(p => p.album).map(p => p.album) || [])];

    const filteredPhotos = selectedAlbum === 'all' 
        ? photos 
        : photos?.filter(p => p.album === selectedAlbum);

    const currentIndex = selectedPhoto ? filteredPhotos?.findIndex(p => p.id === selectedPhoto.id) : -1;

    const goToNext = () => {
        if (currentIndex < filteredPhotos.length - 1) {
            setSelectedPhoto(filteredPhotos[currentIndex + 1]);
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            setSelectedPhoto(filteredPhotos[currentIndex - 1]);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Galeria de Fotos
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Momentos inesquecíveis da Fiel Cuiabá
                    </p>
                </motion.div>

                {/* Album Tabs */}
                {albums.length > 1 && (
                    <div className="flex justify-center mb-10 overflow-x-auto pb-2">
                        <Tabs value={selectedAlbum} onValueChange={setSelectedAlbum}>
                            <TabsList className="bg-zinc-900 border border-zinc-800 p-1 flex-wrap">
                                {albums.map(album => (
                                    <TabsTrigger 
                                        key={album} 
                                        value={album}
                                        className="data-[state=active]:bg-white data-[state=active]:text-black rounded-lg px-4 capitalize"
                                    >
                                        {album === 'all' ? 'Todas' : album}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                )}

                {/* Photo Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="aspect-square bg-zinc-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredPhotos?.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredPhotos.map((photo, index) => (
                                <motion.div
                                    key={photo.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.03 }}
                                    layout
                                    className="relative aspect-square overflow-hidden rounded-xl group cursor-pointer"
                                    onClick={() => setSelectedPhoto(photo)}
                                >
                                    <img 
                                        src={photo.image_url} 
                                        alt={photo.title || "Foto"}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                        <div>
                                            {photo.title && (
                                                <p className="text-white font-medium line-clamp-2">{photo.title}</p>
                                            )}
                                            {photo.event_date && (
                                                <p className="text-gray-300 text-sm flex items-center gap-1 mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(photo.event_date), "dd/MM/yyyy")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                ) : (
                    <div className="text-center py-20">
                        <Image className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-xl font-semibold text-white mb-2">Nenhuma foto encontrada</h3>
                        <p className="text-gray-500">As fotos serão adicionadas em breve!</p>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
                <DialogContent className="bg-black/95 border-zinc-800 max-w-5xl p-0 overflow-hidden">
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full"
                            onClick={() => setSelectedPhoto(null)}
                        >
                            <X className="w-6 h-6" />
                        </Button>

                        {currentIndex > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full"
                                onClick={goToPrev}
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </Button>
                        )}

                        {currentIndex < (filteredPhotos?.length || 0) - 1 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full"
                                onClick={goToNext}
                            >
                                <ChevronRight className="w-8 h-8" />
                            </Button>
                        )}

                        {selectedPhoto && (
                            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                                <img 
                                    src={selectedPhoto.image_url} 
                                    alt={selectedPhoto.title || "Foto"}
                                    className="max-h-[80vh] max-w-full object-contain"
                                />
                                {(selectedPhoto.title || selectedPhoto.album) && (
                                    <div className="p-4 text-center">
                                        {selectedPhoto.title && (
                                            <h3 className="text-white text-lg font-medium">{selectedPhoto.title}</h3>
                                        )}
                                        {selectedPhoto.album && (
                                            <p className="text-gray-400 text-sm">{selectedPhoto.album}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}