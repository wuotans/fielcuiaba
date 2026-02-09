import React from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Ticket, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function EventsSection({ events, isLoading }) {
    if (isLoading) {
        return (
            <section className="py-20 bg-black">
                <div className="container mx-auto px-4">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-zinc-800 rounded w-48" />
                        <div className="grid md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-80 bg-zinc-800 rounded-2xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-black relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            Próximos Eventos
                        </h2>
                        <p className="text-gray-500">Garanta seu ingresso e participe!</p>
                    </div>
                    <Link to="/events" className="text-white hover:text-gray-300 flex items-center gap-2 font-medium">
                        Ver todos <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {events?.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.slice(0, 3).map((event, index) => {
                            const availableTickets = event.total_tickets - (event.sold_tickets || 0);
                            const percentSold = ((event.sold_tickets || 0) / event.total_tickets) * 100;

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group hover:border-zinc-700 transition-all duration-300">
                                        <div className="relative h-48 overflow-hidden">
                                            <img 
                                                src={event.image_url || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800"} 
                                                alt={event.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                                            
                                            <div className="absolute top-4 left-4 bg-white text-black rounded-lg p-2 text-center min-w-[60px]">
                                                <div className="text-2xl font-bold leading-none">
                                                    {format(new Date(event.date), "dd")}
                                                </div>
                                                <div className="text-xs uppercase font-medium">
                                                    {format(new Date(event.date), "MMM", { locale: ptBR })}
                                                </div>
                                            </div>

                                            {availableTickets <= 20 && availableTickets > 0 && (
                                                <Badge className="absolute top-4 right-4 bg-red-500/90 text-white border-0">
                                                    Últimas vagas!
                                                </Badge>
                                            )}
                                        </div>

                                        <CardContent className="p-5">
                                            <h3 className="text-xl font-bold text-white mb-3 line-clamp-1">
                                                {event.title}
                                            </h3>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center text-gray-400 text-sm">
                                                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                                    {format(new Date(event.date), "EEEE, dd/MM 'às' HH:mm", { locale: ptBR })}
                                                </div>
                                                <div className="flex items-center text-gray-400 text-sm">
                                                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                                    <span className="line-clamp-1">{event.location}</span>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-500">Ingressos vendidos</span>
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
                                                    <div className="text-xs text-gray-500">por ingresso</div>
                                                </div>
                                                <Link to={`/events/${event.id}`}>
                                                    <Button className="bg-white text-black hover:bg-gray-200 rounded-full">
                                                        <Ticket className="w-4 h-4 mr-2" />
                                                        Comprar
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Nenhum evento programado no momento.</p>
                    </div>
                )}
            </div>
        </section>
    );
}