import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Image, Users, Trophy, Ticket } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />
            
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <span className="text-[40vw] font-black text-white select-none">FC</span>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-4xl mx-auto"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8"
                    >
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-gray-300 text-sm">Torcida ativa em Cuiabá</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-none">
                        FIEL
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                            CUIABÁ
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        A maior torcida do Timão no Centro-Oeste. 
                        Unidos pelo amor ao Corinthians.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Link to="/events">
                            <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-full h-14 px-8 text-lg font-bold w-full sm:w-auto">
                                <Calendar className="w-5 h-5 mr-2" />
                                Ver Eventos
                            </Button>
                        </Link>
                        <Link to="/gallery">
                            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full h-14 px-8 text-lg font-bold w-full sm:w-auto">
                                <Image className="w-5 h-5 mr-2" />
                                Galeria
                            </Button>
                        </Link>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="grid grid-cols-3 gap-8 max-w-xl mx-auto"
                    >
                        <div className="text-center">
                            <Users className="w-8 h-8 text-white mx-auto mb-2" />
                            <div className="text-3xl font-bold text-white">500+</div>
                            <div className="text-gray-500 text-sm">Membros</div>
                        </div>
                        <div className="text-center">
                            <Ticket className="w-8 h-8 text-white mx-auto mb-2" />
                            <div className="text-3xl font-bold text-white">50+</div>
                            <div className="text-gray-500 text-sm">Eventos</div>
                        </div>
                        <div className="text-center">
                            <Trophy className="w-8 h-8 text-white mx-auto mb-2" />
                            <div className="text-3xl font-bold text-white">10</div>
                            <div className="text-gray-500 text-sm">Anos</div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}