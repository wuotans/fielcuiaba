import React from 'react';
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InstagramFeed() {
    const posts = [
        { id: 1, image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400" },
        { id: 2, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400" },
        { id: 3, image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400" },
        { id: 4, image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400" },
    ];

    return (
        <section className="py-20 bg-zinc-950">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Instagram className="w-8 h-8 text-white" />
                        <h2 className="text-3xl md:text-4xl font-bold text-white">
                            @fielcuiaba
                        </h2>
                    </div>
                    <p className="text-gray-500 mb-6">Siga-nos no Instagram!</p>
                    <a href__="https://instagram.com/fielcuiaba" target="_blank" rel="noopener noreferrer">
                        <Button className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full">
                            <Instagram className="w-4 h-4 mr-2" />
                            Seguir
                        </Button>
                    </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {posts.map(post => (
                        <a
                            key={post.id}
                            href__="https://instagram.com/fielcuiaba"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative aspect-square overflow-hidden rounded-xl group"
                        >
                            <img 
                                src={post.image} 
                                alt="Instagram post"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Instagram className="w-8 h-8 text-white" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}