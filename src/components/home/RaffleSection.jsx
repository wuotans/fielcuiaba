import React from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Gift, ArrowRight, User } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RaffleSection({ raffles, isLoading }) {
    const completedRaffles = raffles?.filter(r => r.status === 'realizado') || [];

    if (isLoading) {
        return (
            <section className="py-20 bg-black">
                <div className="container mx-auto px-4">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-zinc-800 rounded w-48" />
                        <div className="grid md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-zinc-800 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-black relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                            <Trophy className="w-10 h-10 text-yellow-500" />
                            Sorteios
                        </h2>
                        <p className="text-gray-500">Os 100 primeiros compradores participam!</p>
                    </div>
                    <Link to="/raffles" className="text-white hover:text-gray-300 flex items-center gap-2 font-medium">
                        Ver todos <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6 mb-10">
                    <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-yellow-500/20 rounded-full">
                            <Gift className="w-10 h-10 text-yellow-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                                Participe dos nossos sorteios!
                            </h3>
                            <p className="text-gray-400">
                                Compre seu ingresso e concorra automaticamente a prêmios exclusivos!
                            </p>
                        </div>
                    </div>
                </div>

                {completedRaffles.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {completedRaffles.slice(0, 3).map((raffle, index) => (
                            <motion.div
                                key={raffle.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
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
                                        <Badge className="bg-green-500/20 text-green-400 border-0 mb-3">
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
                                                        {raffle.winner_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Nenhum sorteio realizado ainda.</p>
                    </div>
                )}
            </div>
        </section>
    );
}