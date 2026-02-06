import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Gift, PartyPopper, Clock, User } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Raffles() {
    const { data: raffles, isLoading } = useQuery({
        queryKey: ['raffles'],
        queryFn: () => base44.entities.Raffle.list('-draw_date', 50),
        initialData: []
    });

    const completedRaffles = raffles?.filter(r => r.status === 'realizado') || [];
    const pendingRaffles = raffles?.filter(r => r.status === 'pendente') || [];

    return (
        <div className="min-h-screen bg-zinc-950 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Trophy className="w-10 h-10 text-yellow-500" />
                        <h1 className="text-4xl md:text-5xl font-black text-white">
                            Sorteios
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Confira os resultados dos sorteios. Os 100 primeiros compradores de cada evento participam automaticamente!
                    </p>
                </motion.div>

                {/* Info Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6 mb-12 max-w-3xl mx-auto"
                >
                    <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-yellow-500/20 rounded-full">
                            <Gift className="w-10 h-10 text-yellow-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                                Como participar?
                            </h3>
                            <p className="text-gray-400">
                                Seja um dos <span className="text-yellow-500 font-semibold">100 primeiros</span> a comprar ingresso em qualquer evento e concorra automaticamente a prêmios exclusivos!
                            </p>
                        </div>
                    </div>
                </motion.div>

                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-zinc-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Pending Raffles */}
                        {pendingRaffles.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Clock className="w-6 h-6 text-blue-500" />
                                    Sorteios Pendentes
                                </h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pendingRaffles.map((raffle, index) => (
                                        <motion.div
                                            key={raffle.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Card className="bg-zinc-900 border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all h-full">
                                                {raffle.prize_image && (
                                                    <div className="h-40 overflow-hidden">
                                                        <img 
                                                            src={raffle.prize_image} 
                                                            alt={raffle.prize}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <CardContent className="p-5">
                                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 border mb-3">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Aguardando Sorteio
                                                    </Badge>
                                                    
                                                    <h3 className="text-lg font-bold text-white mb-2">
                                                        {raffle.prize}
                                                    </h3>
                                                    
                                                    <p className="text-sm text-gray-500">
                                                        Evento: {raffle.event_title}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Completed Raffles */}
                        {completedRaffles.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <PartyPopper className="w-6 h-6 text-green-500" />
                                    Sorteios Realizados
                                </h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {completedRaffles.map((raffle, index) => (
                                        <motion.div
                                            key={raffle.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Card className="bg-zinc-900 border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all h-full">
                                                {raffle.prize_image && (
                                                    <div className="h-40 overflow-hidden relative">
                                                        <img 
                                                            src={raffle.prize_image} 
                                                            alt={raffle.prize}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-green-500/20" />
                                                    </div>
                                                )}
                                                <CardContent className="p-5">
                                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border mb-3">
                                                        <PartyPopper className="w-3 h-3 mr-1" />
                                                        Sorteio Realizado
                                                    </Badge>
                                                    
                                                    <h3 className="text-lg font-bold text-white mb-2">
                                                        {raffle.prize}
                                                    </h3>
                                                    
                                                    <p className="text-sm text-gray-500 mb-4">
                                                        {raffle.event_title}
                                                    </p>

                                                    <div className="bg-zinc-800 rounded-lg p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                                                <User className="w-5 h-5 text-green-500" />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-gray-500">Ganhador(a)</div>
                                                                <div className="text-white font-semibold">
                                                                    {raffle.winner_name || "A definir"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {raffle.draw_date && (
                                                            <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-zinc-700">
                                                                Sorteado em {format(new Date(raffle.draw_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {raffles?.length === 0 && (
                            <div className="text-center py-20">
                                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                                <h3 className="text-xl font-semibold text-white mb-2">Nenhum sorteio ainda</h3>
                                <p className="text-gray-500">Os sorteios serão listados aqui quando houver eventos!</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}