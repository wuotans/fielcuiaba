import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Ticket, Users, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Events() {
    const [filter, setFilter] = useState('all');

    const { data: events, isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: () => base44.entities.Event.filter({ published: true }, 'date', 50),
        initialData: []
    });

    const now = new Date();
    const filteredEvents = events?.filter(event => {
        if (filter === 'upcoming') {
            return new Date(event.date) >= now && event.status === 'ativo';
        }
        if (filter === 'past') {
            return new Date(event.date) < now || event.status === 'encerrado';
        }
        return true;
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
                        Eventos
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Participe dos nossos encontros e comemorações
                    </p>
                </motion.div>

                {/* Filters */}
                <div className="flex justify-center mb-10">
                    <Tabs value={filter} onValueChange={setFilter}>
                        <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
                            <TabsTrigger 
                                value="all"
                                className="data-[state=active]:bg-white data-[state=active]:text-black rounded-lg px-6"
                            >
                                Todos
                            </TabsTrigger>
                            <TabsTrigger 
                                value="upcoming"
                                className="data-[state=active]:bg-white data-[state=active]:text-black rounded-lg px-6"
                            >
                                Próximos
                            </TabsTrigger>
                            <TabsTrigger 
                                value="past"
                                className="data-[state=active]:bg-white data-[state=active]:text-black rounded-lg px-6"
                            >
                                Passados
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Events Grid */}
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="h-48 bg-zinc-800 rounded-t-xl" />
                                <div className="h-48 bg-zinc-900 rounded-b-xl" />
                            </div>
                        ))}
                    </div>
                ) : filteredEvents?.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEvents.map((event, index) => {
                                const availableTickets = event.total_tickets - (event.sold_tickets || 0);
                                const percentSold = ((event.sold_tickets || 0) / event.total_tickets) * 100;
                                const isPast = new Date(event.date) < now || event.status === 'encerrado';

                                return (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                        layout
                                    >
                                        <Card className={`bg-zinc-900 border-zinc-800 overflow-hidden group hover:border-zinc-700 transition-all h-full ${isPast ? 'opacity-70' : ''}`}>
                                            <div className="relative h-48 overflow-hidden">
                                                <img 
                                                    src={event.image_url || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800"} 
                                                    alt={event.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                                                
                                                {/* Date Badge */}
                                                <div className="absolute top-4 left-4 bg-white text-black rounded-lg p-2 text-center min-w-[60px]">
                                                    <div className="text-2xl font-bold leading-none">
                                                        {format(new Date(event.date), "dd")}
                                                    </div>
                                                    <div className="text-xs uppercase font-medium">
                                                        {format(new Date(event.date), "MMM", { locale: ptBR })}
                                                    </div>
                                                </div>

                                                {isPast ? (
                                                    <Badge className="absolute top-4 right-4 bg-zinc-700 text-gray-300 border-0">
                                                        Encerrado
                                                    </Badge>
                                                ) : availableTickets <= 20 && availableTickets > 0 ? (
                                                    <Badge className="absolute top-4 right-4 bg-red-500/90 text-white border-0">
                                                        Últimas vagas!
                                                    </Badge>
                                                ) : availableTickets === 0 ? (
                                                    <Badge className="absolute top-4 right-4 bg-zinc-700 text-gray-300 border-0">
                                                        Esgotado
                                                    </Badge>
                                                ) : null}
                                            </div>

                                            <CardContent className="p-5">
                                                <h3 className="text-xl font-bold text-white mb-3 line-clamp-1">
                                                    {event.title}
                                                </h3>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center text-gray-400 text-sm">
                                                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                                                        {format(new Date(event.date), "EEEE, dd/MM 'às' HH:mm", { locale: ptBR })}
                                                    </div>
                                                    <div className="flex items-center text-gray-400 text-sm">
                                                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                                        <span className="line-clamp-1">{event.location}</span>
                                                    </div>
                                                </div>

                                                {!isPast && (
                                                    <>
                                                        {/* Progress Bar */}
                                                        <div className="mb-4">
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="text-gray-500">Ingressos</span>
                                                                <span className="text-white font-medium">{event.sold_tickets || 0}/{event.total_tickets}</span>
                                                            </div>
                                                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-gradient-to-r from-white to-gray-400 rounded-full transition-all duration-500"
                                                                    style={{ width: `${percentSold}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="text-2xl font-bold text-white">
                                                                    R$ {event.ticket_price?.toFixed(2)}
                                                                </div>
                                                            </div>
                                                            <Link to={createPageUrl("EventDetail") + `?id=${event.id}`}>
                                                                <Button 
                                                                    className="bg-white text-black hover:bg-gray-200 rounded-full"
                                                                    disabled={availableTickets === 0}
                                                                >
                                                                    <Ticket className="w-4 h-4 mr-2" />
                                                                    {availableTickets === 0 ? 'Esgotado' : 'Comprar'}
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </>
                                                )}

                                                {isPast && (
                                                    <div className="text-center py-2">
                                                        <span className="text-gray-500">Evento encerrado</span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatePresence>
                ) : (
                    <div className="text-center py-20">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-xl font-semibold text-white mb-2">Nenhum evento encontrado</h3>
                        <p className="text-gray-500">Fique ligado para novos eventos!</p>
                    </div>
                )}
            </div>
        </div>
    );
}