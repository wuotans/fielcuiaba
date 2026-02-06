import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Users, Calendar, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            {/* Corinthians Shield Watermark */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <svg viewBox="0 0 200 200" className="w-[600px] h-[600px]">
                    <circle cx="100" cy="100" r="95" fill="white" />
                    <text x="100" y="120" textAnchor="middle" fontSize="40" fill="black" fontWeight="bold">SCCP</text>
                </svg>
            </div>

            <div className="relative z-10 container mx-auto px-4">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="mb-6"
                    >
                        <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/80 text-sm font-medium tracking-wider uppercase">
                            Torcida Organizada
                        </span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 tracking-tight">
                        FIEL
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-white">
                            CUIABÁ
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 font-light">
                        A maior torcida do Timão no Centro-Oeste. 
                        <span className="text-white font-medium"> Unidos pelo amor ao Corinthians.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <Link to={createPageUrl("Events")}>
                            <Button size="lg" className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-6 rounded-full font-bold group">
                                Ver Eventos
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link to={createPageUrl("Gallery")}>
                            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full">
                                Galeria de Fotos
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="grid grid-cols-3 gap-8 max-w-xl mx-auto"
                    >
                        <div className="text-center">
                            <Users className="w-8 h-8 text-white/60 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-white">500+</div>
                            <div className="text-sm text-gray-500">Membros</div>
                        </div>
                        <div className="text-center">
                            <Calendar className="w-8 h-8 text-white/60 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-white">50+</div>
                            <div className="text-sm text-gray-500">Eventos</div>
                        </div>
                        <div className="text-center">
                            <Trophy className="w-8 h-8 text-white/60 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-white">10+</div>
                            <div className="text-sm text-gray-500">Anos</div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
        </section>
    );
}