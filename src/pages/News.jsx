import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Clock, Newspaper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const categoryLabels = {
    all: "Todas",
    jogo: "Jogos",
    contratacao: "Contratações",
    bastidores: "Bastidores",
    fiel_cuiaba: "Fiel Cuiabá",
    geral: "Geral"
};

const categoryColors = {
    jogo: "bg-green-500/20 text-green-400 border-green-500/30",
    contratacao: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    bastidores: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    fiel_cuiaba: "bg-white/20 text-white border-white/30",
    geral: "bg-gray-500/20 text-gray-400 border-gray-500/30"
};

export default function News() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');

    const { data: news, isLoading } = useQuery({
        queryKey: ['news'],
        queryFn: () => base44.entities.News.filter({ published: true }, '-created_date', 50),
        initialData: []
    });

    const filteredNews = news?.filter(item => {
        const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                           item.summary?.toLowerCase().includes(search.toLowerCase());
        const matchCategory = category === 'all' || item.category === category;
        return matchSearch && matchCategory;
    });

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
                        Notícias do Timão
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Fique por dentro de tudo que acontece no Corinthians
                    </p>
                </motion.div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                            placeholder="Buscar notícias..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500 h-12 rounded-full"
                        />
                    </div>
                    <Tabs value={category} onValueChange={setCategory}>
                        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 h-12">
                            {Object.entries(categoryLabels).map(([key, label]) => (
                                <TabsTrigger 
                                    key={key} 
                                    value={key}
                                    className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full px-4"
                                >
                                    {label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                {/* News Grid */}
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="h-48 bg-zinc-800 rounded-t-xl" />
                                <div className="h-32 bg-zinc-900 rounded-b-xl p-4">
                                    <div className="h-4 bg-zinc-800 rounded w-20 mb-3" />
                                    <div className="h-6 bg-zinc-800 rounded mb-2" />
                                    <div className="h-4 bg-zinc-800 rounded w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredNews?.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredNews.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                >
                                    <Link to={createPageUrl("NewsDetail") + `?id=${item.id}`}>
                                        <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group cursor-pointer hover:border-zinc-700 transition-all h-full">
                                            <div className="relative h-48 overflow-hidden">
                                                <img 
                                                    src={item.image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800"} 
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                                                <Badge className={`absolute top-4 left-4 ${categoryColors[item.category] || categoryColors.geral} border`}>
                                                    {categoryLabels[item.category] || "Geral"}
                                                </Badge>
                                            </div>
                                            <CardContent className="p-5">
                                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gray-300 transition-colors line-clamp-2">
                                                    {item.title}
                                                </h3>
                                                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                                                    {item.summary}
                                                </p>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {format(new Date(item.created_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                ) : (
                    <div className="text-center py-20">
                        <Newspaper className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-xl font-semibold text-white mb-2">Nenhuma notícia encontrada</h3>
                        <p className="text-gray-500">Tente ajustar os filtros de busca</p>
                    </div>
                )}
            </div>
        </div>
    );
}