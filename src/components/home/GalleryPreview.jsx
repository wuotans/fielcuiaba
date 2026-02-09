import React from 'react';
import { Link } from "react-router-dom";
import { ArrowRight, Image } from "lucide-react";
import { motion } from "framer-motion";

export default function GalleryPreview({ photos, isLoading }) {
    if (isLoading) {
        return (
            <section className="py-20 bg-zinc-950">
                <div className="container mx-auto px-4">
                    <div className="animate-pulse">
                        <div className="h-8 bg-zinc-800 rounded w-48 mb-8" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="aspect-square bg-zinc-800 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-zinc-950">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            Galeria
                        </h2>
                        <p className="text-gray-500">Momentos inesquecíveis da Fiel Cuiabá</p>
                    </div>
                    <Link to="/gallery" className="text-white hover:text-gray-300 flex items-center gap-2 font-medium">
                        Ver todas <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {photos?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {photos.slice(0, 8).map((photo, index) => (
                            <motion.div
                                key={photo.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className={`relative overflow-hidden rounded-xl group cursor-pointer ${
                                    index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                                }`}
                            >
                                <div className="aspect-square">
                                    <img 
                                        src={photo.image_url} 
                                        alt={photo.title || "Foto da Fiel Cuiabá"}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="text-center p-4">
                                        <p className="text-white font-medium line-clamp-2">{photo.title || photo.album}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma foto publicada ainda.</p>
                    </div>
                )}
            </div>
        </section>
    );
}