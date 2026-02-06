import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Gift, ArrowRight, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RaffleSection({ raffles, isLoading }) {
    const recentRaffles = raffles?.filter(r => r.status === 'realizado').slice(0, 3);

    if (isLoading) {
        return (
            <section className="py-20 bg-zinc-950">
                <div className="container mx-auto px-4">
                    <div className="animate-pulse">
                        <div className="h-8 bg-zinc-800 rounded w-48 mb-8" />
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
        <section className="py-20 bg-zinc-950 relative overflow-hidden">
            {/* Confetti Background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-3 h-3 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Trophy className="w-8 h-8 text-yellow-500" />
                            <h2 className="text-3xl md:text-4xl font-bold text-white">
                                Sorteios
                            </h2>
                        </div>
                        <p className="text-gray-500">Confira os últimos ganhadores!</p>
                    </div>
                    <Link to={createPageUrl("Raffles")} className="text-white hover:text-gray-300 flex items-center gap-2 font-medium">
                        Ver todos <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Info Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6 mb-10"
                >
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="p-4 bg-yellow-500/20 rounded-full">
                            <Gift className="w-8 h-8 text-yellow-500" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-bold text-white mb-1">
                                Participe dos nossos sorteios!
                            </h3>
                            <p className="text-gray-400">
                                Os <span className="text-yellow-500 font-semibold">100 primeiros</span> compradores de cada evento automaticamente participam do sorteio de prêmios exclusivos!
                            </p>
                        </div>
                    </div>
                </motion.div>

                {recentRaffles?.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {recentRaffles.map((raffle, index) => (
                            <motion.div
                                key={raffle.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
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
                                            <div className="text-xs text-gray-500 mb-1">Ganhador(a)</div>
                                            <div className="text-white font-semibold">
                                                {raffle.winner_name || "A definir"}
                                            </div>
                                            {raffle.draw_date && (
                                                <div className="text-xs text-gray-500 mt-2">
                                                    Sorteado em {format(new Date(raffle.draw_date), "dd/MM/yyyy", { locale: ptBR })}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Nenhum sorteio realizado ainda.</p>
                        <p className="text-sm mt-2">Compre seu ingresso e participe!</p>
                    </div>
                )}
            </div>
        </section>
    );
}