import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ticket, Calendar, MapPin, QrCode, Gift, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MyTickets() {
    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const isAuth = await base44.auth.isAuthenticated();
                if (isAuth) {
                    const userData = await base44.auth.me();
                    setUser(userData);
                } else {
                    base44.auth.redirectToLogin(window.location.href);
                }
            } catch (e) {
                base44.auth.redirectToLogin(window.location.href);
            } finally {
                setIsLoadingUser(false);
            }
        };
        loadUser();
    }, []);

    const { data: tickets, isLoading } = useQuery({
        queryKey: ['my-tickets', user?.email],
        queryFn: () => base44.entities.Ticket.filter({ user_email: user.email }, '-created_date', 50),
        enabled: !!user?.email,
        initialData: []
    });

    const { data: events } = useQuery({
        queryKey: ['events-for-tickets'],
        queryFn: () => base44.entities.Event.list('-date', 100),
        initialData: []
    });

    if (isLoadingUser || isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="animate-pulse space-y-6">
                        <div className="h-10 bg-zinc-800 rounded w-48 mx-auto" />
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-40 bg-zinc-800 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getEventDetails = (eventId) => {
        return events?.find(e => e.id === eventId);
    };

    return (
        <div className="min-h-screen bg-zinc-950 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Meus Ingressos
                    </h1>
                    <p className="text-gray-400">
                        Olá, {user?.full_name}! Confira seus ingressos abaixo.
                    </p>
                </motion.div>

                {tickets?.length > 0 ? (
                    <div className="space-y-4">
                        {tickets.map((ticket, index) => {
                            const event = getEventDetails(ticket.event_id);
                            const isPast = event && new Date(event.date) < new Date();

                            return (
                                <motion.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className={`bg-zinc-900 border-zinc-800 overflow-hidden ${isPast ? 'opacity-60' : ''}`}>
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row">
                                                {/* Left - Ticket Visual */}
                                                <div className="bg-gradient-to-br from-white to-gray-200 p-6 md:w-48 flex flex-col items-center justify-center text-center">
                                                    <div className="text-black font-black text-2xl mb-1">FC</div>
                                                    <div className="text-gray-600 text-xs mb-4">FIEL CUIABÁ</div>
                                                    <QrCode className="w-16 h-16 text-black mb-2" />
                                                    <div className="text-xs font-mono text-gray-700 break-all">
                                                        {ticket.ticket_code}
                                                    </div>
                                                </div>

                                                {/* Right - Details */}
                                                <div className="flex-1 p-6">
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {ticket.payment_status === 'pago' ? (
                                                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">
                                                                Confirmado
                                                            </Badge>
                                                        ) : ticket.payment_status === 'pendente' ? (
                                                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border">
                                                                Pendente
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 border">
                                                                Cancelado
                                                            </Badge>
                                                        )}
                                                        {ticket.eligible_for_raffle && (
                                                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border">
                                                                <Gift className="w-3 h-3 mr-1" />
                                                                No Sorteio
                                                            </Badge>
                                                        )}
                                                        {isPast && (
                                                            <Badge className="bg-zinc-700 text-gray-400 border-zinc-600 border">
                                                                Evento Passado
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <h3 className="text-xl font-bold text-white mb-3">
                                                        {event?.title || "Evento"}
                                                    </h3>

                                                    {event && (
                                                        <div className="space-y-2 mb-4">
                                                            <div className="flex items-center text-gray-400 text-sm">
                                                                <Calendar className="w-4 h-4 mr-2" />
                                                                {format(new Date(event.date), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                                            </div>
                                                            <div className="flex items-center text-gray-400 text-sm">
                                                                <MapPin className="w-4 h-4 mr-2" />
                                                                {event.location}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800">
                                                        <div>
                                                            <div className="text-sm text-gray-500">Quantidade</div>
                                                            <div className="text-white font-semibold">{ticket.quantity}x ingresso(s)</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm text-gray-500">Valor Total</div>
                                                            <div className="text-white font-semibold">R$ {ticket.total_price?.toFixed(2)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm text-gray-500">Pagamento</div>
                                                            <div className="text-white font-semibold capitalize">
                                                                {ticket.payment_method === 'pix' ? 'PIX' : 'Cartão'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-xl font-semibold text-white mb-2">Você ainda não tem ingressos</h3>
                        <p className="text-gray-500 mb-6">Confira nossos eventos e garanta sua vaga!</p>
                        <Button className="bg-white text-black hover:bg-gray-200 rounded-full">
                            <a href={createPageUrl("Events")}>Ver Eventos</a>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

import { createPageUrl } from "@/utils";