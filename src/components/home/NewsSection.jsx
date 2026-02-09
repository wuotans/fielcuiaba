import React from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const categoryLabels = {
    jogo: "Jogo",
    contratacao: "Contratação",
    bastidores: "Bastidores",
    fiel_cuiaba: "Fiel Cuiabá",
    geral: "Geral"
};

const categoryColors = {
    jogo: "bg-green-500/20 text-green-400",
    contratacao: "bg-blue-500/20 text-blue-400",
    bastidores: "bg-purple-500/20 text-purple-400",
    fiel_cuiaba: "bg-white/20 text-white",
    geral: "bg-gray-500/20 text-gray-400"
};

export default function NewsSection({ news, isLoading }) {
    if (isLoading) {
        return (
            <section className="py-20 bg-zinc-950">
                <div className="container mx-auto px-4">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-zinc-800 rounded w-48" />
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="h-80 bg-zinc-800 rounded-2xl" />
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-zinc-800 rounded-xl" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const featuredNews = news?.find(n => n.featured) || news?.[0];
    const otherNews = news?.filter(n => n.id !== featuredNews?.id).slice(0, 3);

    return (
        <section className="py-20 bg-zinc-950">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            Últimas Notícias
                        </h2>
                        <p className="text-gray-500">Fique por dentro de tudo sobre o Timão</p>
                    </div>
                    <Link to="/news" className="text-white hover:text-gray-300 flex items-center gap-2 font-medium">
                        Ver todas <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {news?.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {featuredNews && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <Link to={`/news/${featuredNews.id}`}>
                                    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group cursor-pointer h-full hover:border-zinc-700 transition-all">
                                        <div className="relative h-64 overflow-hidden">
                                            <img 
                                                src={featuredNews.image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800"} 
                                                alt={featuredNews.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
                                            <Badge className={`absolute top-4 left-4 ${categoryColors[featuredNews.category] || categoryColors.geral}`}>
                                                {categoryLabels[featuredNews.category] || "Geral"}
                                            </Badge>
                                        </div>
                                        <CardContent className="p-6">
                                            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-gray-300 transition-colors">
                                                {featuredNews.title}
                                            </h3>
                                            <p className="text-gray-400 mb-4 line-clamp-2">
                                                {featuredNews.summary}
                                            </p>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {format(new Date(featuredNews.created_date), "dd 'de' MMMM", { locale: ptBR })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            {otherNews?.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link to={`/news/${item.id}`}>
                                        <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group cursor-pointer hover:border-zinc-700 transition-all">
                                            <div className="flex">
                                                <div className="w-32 h-24 flex-shrink-0 overflow-hidden">
                                                    <img 
                                                        src={item.image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400"} 
                                                        alt={item.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                                <CardContent className="p-4 flex flex-col justify-center">
                                                    <Badge className={`w-fit mb-2 text-xs ${categoryColors[item.category] || categoryColors.geral}`}>
                                                        {categoryLabels[item.category] || "Geral"}
                                                    </Badge>
                                                    <h4 className="text-white font-semibold line-clamp-2 group-hover:text-gray-300 transition-colors">
                                                        {item.title}
                                                    </h4>
                                                </CardContent>
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma notícia publicada ainda.</p>
                    </div>
                )}
            </div>
        </section>
    );
}