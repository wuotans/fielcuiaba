import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, MapPin, Clock, Users, Ticket, Gift, CreditCard, QrCode, Plus, Minus, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function EventDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
    const [purchaseComplete, setPurchaseComplete] = useState(false);
    const [ticketCode, setTicketCode] = useState('');
    const [isEligibleForRaffle, setIsEligibleForRaffle] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    const queryClient = useQueryClient();

    React.useEffect(() => {
        const loadUser = async () => {
            try {
                const isAuth = await base44.auth.isAuthenticated();
                if (isAuth) {
                    const userData = await base44.auth.me();
                    setUser(userData);
                }
            } catch (e) {
                console.log('User not authenticated');
            } finally {
                setIsLoadingUser(false);
            }
        };
        loadUser();
    }, []);

    const { data: events, isLoading } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => base44.entities.Event.filter({ id: eventId }),
        enabled: !!eventId,
    });

    const event = events?.[0];

    const purchaseMutation = useMutation({
        mutationFn: async () => {
            const currentSold = event.sold_tickets || 0;
            const purchaseOrder = currentSold + 1;
            const eligible = purchaseOrder <= (event.raffle_limit || 100);
            
            const code = `FC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

            const ticket = await base44.entities.Ticket.create({
                event_id: event.id,
                user_email: user.email,
                user_name: user.full_name,
                quantity: quantity,
                total_price: event.ticket_price * quantity,
                payment_method: paymentMethod,
                payment_status: 'pago',
                ticket_code: code,
                eligible_for_raffle: eligible,
                purchase_order: purchaseOrder
            });

            await base44.entities.Event.update(event.id, {
                sold_tickets: currentSold + quantity
            });

            return { ticket, code, eligible };
        },
        onSuccess: (data) => {
            setTicketCode(data.code);
            setIsEligibleForRaffle(data.eligible);
            setPurchaseComplete(true);
            queryClient.invalidateQueries(['event', eventId]);
        }
    });

    const handlePurchase = () => {
        if (!user) {
            base44.auth.redirectToLogin(window.location.href);
            return;
        }
        setShowPurchaseDialog(true);
    };

    const confirmPurchase = () => {
        purchaseMutation.mutate();
    };

    if (isLoading || isLoadingUser) {
        return (
            <div className="min-h-screen bg-zinc-950 py-12">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-zinc-800 rounded w-32" />
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 h-96 bg-zinc-800 rounded-2xl" />
                            <div className="h-96 bg-zinc-800 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Evento não encontrado</h2>
                    <Link to={createPageUrl("Events")}>
                        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar para Eventos
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const availableTickets = event.total_tickets - (event.sold_tickets || 0);
    const percentSold = ((event.sold_tickets || 0) / event.total_tickets) * 100;
    const isPast = new Date(event.date) < new Date() || event.status === 'encerrado';
    const raffleSpots = (event.raffle_limit || 100) - (event.sold_tickets || 0);

    return (
        <div className="min-h-screen bg-zinc-950 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Link to={createPageUrl("Events")}>
                        <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-zinc-800">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar para Eventos
                        </Button>
                    </Link>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Event Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="relative rounded-2xl overflow-hidden mb-6">
                            <img 
                                src={event.image_url || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200"} 
                                alt={event.title}
                                className="w-full h-72 md:h-96 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                                    {event.title}
                                </h1>
                            </div>
                        </div>

                        <Card className="bg-zinc-900 border-zinc-800 mb-6">
                            <CardContent className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white/10 rounded-xl">
                                            <Calendar className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">Data e Hora</div>
                                            <div className="text-white font-medium">
                                                {format(new Date(event.date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                            </div>
                                            <div className="text-white">
                                                às {format(new Date(event.date), "HH:mm")}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white/10 rounded-xl">
                                            <MapPin className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">Local</div>
                                            <div className="text-white font-medium">
                                                {event.location}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {event.description && (
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-white">Sobre o Evento</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-400 whitespace-pre-line">
                                        {event.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>

                    {/* Purchase Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-zinc-900 border-zinc-800 sticky top-4">
                            <CardHeader className="border-b border-zinc-800">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-white">Ingressos</CardTitle>
                                    {!isPast && availableTickets > 0 && availableTickets <= 20 && (
                                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 border">
                                            Últimas vagas!
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {isPast ? (
                                    <div className="text-center py-8">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                                        <p className="text-gray-400">Este evento já foi encerrado</p>
                                    </div>
                                ) : availableTickets === 0 ? (
                                    <div className="text-center py-8">
                                        <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                                        <p className="text-gray-400">Ingressos esgotados</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Price */}
                                        <div className="text-center">
                                            <div className="text-sm text-gray-500 mb-1">Valor do ingresso</div>
                                            <div className="text-4xl font-bold text-white">
                                                R$ {event.ticket_price?.toFixed(2)}
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-500">Vendidos</span>
                                                <span className="text-white font-medium">
                                                    {event.sold_tickets || 0} / {event.total_tickets}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-white to-gray-400 rounded-full"
                                                    style={{ width: `${percentSold}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Raffle Info */}
                                        {raffleSpots > 0 && (
                                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                                                <div className="flex items-center gap-3">
                                                    <Gift className="w-6 h-6 text-yellow-500" />
                                                    <div>
                                                        <div className="text-white font-medium">Participe do Sorteio!</div>
                                                        <div className="text-sm text-gray-400">
                                                            Restam <span className="text-yellow-500 font-bold">{raffleSpots}</span> vagas
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Quantity */}
                                        <div>
                                            <Label className="text-gray-400 mb-2 block">Quantidade</Label>
                                            <div className="flex items-center justify-center gap-4">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="border-zinc-700 hover:bg-zinc-800"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    disabled={quantity <= 1}
                                                >
                                                    <Minus className="w-4 h-4 text-white" />
                                                </Button>
                                                <span className="text-2xl font-bold text-white w-12 text-center">
                                                    {quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="border-zinc-700 hover:bg-zinc-800"
                                                    onClick={() => setQuantity(Math.min(availableTickets, quantity + 1))}
                                                    disabled={quantity >= availableTickets}
                                                >
                                                    <Plus className="w-4 h-4 text-white" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="bg-zinc-800 rounded-xl p-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400">Total</span>
                                                <span className="text-2xl font-bold text-white">
                                                    R$ {(event.ticket_price * quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Buy Button */}
                                        <Button 
                                            className="w-full bg-white text-black hover:bg-gray-200 h-14 text-lg font-bold rounded-xl"
                                            onClick={handlePurchase}
                                        >
                                            <Ticket className="w-5 h-5 mr-2" />
                                            {user ? 'Comprar Ingresso' : 'Entrar para Comprar'}
                                        </Button>

                                        {!user && (
                                            <p className="text-center text-sm text-gray-500">
                                                Você precisa estar logado para comprar
                                            </p>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Purchase Dialog */}
            <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
                    {!purchaseComplete ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl">Finalizar Compra</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Escolha a forma de pagamento
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                {/* Order Summary */}
                                <div className="bg-zinc-800 rounded-xl p-4">
                                    <div className="text-sm text-gray-400 mb-2">Resumo do pedido</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white">{quantity}x Ingresso</span>
                                        <span className="text-white font-bold">
                                            R$ {(event?.ticket_price * quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-4 p-4 border border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors">
                                            <RadioGroupItem value="pix" className="border-white text-white" />
                                            <QrCode className="w-6 h-6 text-green-500" />
                                            <div>
                                                <div className="font-medium">PIX</div>
                                                <div className="text-sm text-gray-500">Pagamento instantâneo</div>
                                            </div>
                                        </Label>
                                        <Label className="flex items-center gap-4 p-4 border border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors">
                                            <RadioGroupItem value="cartao" className="border-white text-white" />
                                            <CreditCard className="w-6 h-6 text-blue-500" />
                                            <div>
                                                <div className="font-medium">Cartão de Crédito</div>
                                                <div className="text-sm text-gray-500">Parcele em até 3x</div>
                                            </div>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                <Button 
                                    className="w-full bg-white text-black hover:bg-gray-200 h-12 font-bold"
                                    onClick={confirmPurchase}
                                    disabled={purchaseMutation.isPending}
                                >
                                    {purchaseMutation.isPending ? 'Processando...' : 'Confirmar Pagamento'}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Compra Confirmada!</h3>
                            <p className="text-gray-400 mb-6">Seu ingresso foi gerado com sucesso</p>

                            <div className="bg-zinc-800 rounded-xl p-4 mb-6">
                                <div className="text-sm text-gray-500 mb-1">Código do Ingresso</div>
                                <div className="text-2xl font-mono font-bold text-white">
                                    {ticketCode}
                                </div>
                            </div>

                            {isEligibleForRaffle && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                                    <Gift className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                    <div className="text-white font-medium">Parabéns!</div>
                                    <div className="text-sm text-gray-400">
                                        Você está participando do sorteio!
                                    </div>
                                </div>
                            )}

                            <Button 
                                className="w-full bg-white text-black hover:bg-gray-200"
                                onClick={() => {
                                    setShowPurchaseDialog(false);
                                    setPurchaseComplete(false);
                                }}
                            >
                                Fechar
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}