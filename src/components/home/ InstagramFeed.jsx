import React from 'react';
import { Button } from "@/components/ui/button";
import { Instagram, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function InstagramFeed() {
    const instagramHandle = "fielcuiaba";
    const instagramUrl = `https://instagram.com/${instagramHandle}`;

    // Placeholder posts - em produção, isso seria integrado com a API do Instagram
    const placeholderPosts = [
        { id: 1, image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop" },
        { id: 2, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=400&fit=crop" },
        { id: 3, image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop" },
        { id: 4, image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=400&fit=crop" },
        { id: 5, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=400&fit=crop" },
        { id: 6, image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=400&h=400&fit=crop" },
    ];

    return (
        <section className="py-20 bg-black">
            <div className="container mx-auto px-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl">
                            <Instagram className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">
                            @{instagramHandle}
                        </h2>
                    </div>
                    <p className="text-gray-500 mb-6">Siga-nos no Instagram para mais novidades</p>
                    <a 
                        href={instagramUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        <Button className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white hover:opacity-90 rounded-full px-8">
                            Seguir no Instagram
                            <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                    </a>
                </motion.div>

                {/* Instagram Grid */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
                    {placeholderPosts.map((post, index) => (
                        <motion.a
                            key={post.id}
                            href={instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="relative aspect-square overflow-hidden rounded-lg group"
                        >
                            <img 
                                src={post.image} 
                                alt="Instagram post"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Instagram className="w-8 h-8 text-white" />
                            </div>
                        </motion.a>
                    ))}
                </div>

                <p className="text-center text-gray-600 text-sm mt-6">
                    * Para ver posts em tempo real, conecte sua conta do Instagram nas configurações do admin
                </p>
            </div>
        </section>
    );
}