import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
    LayoutDashboard, Newspaper, Calendar, Image, Trophy, Ticket, 
    Users, BarChart3, Settings, Home, LogOut, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

const menuItems = [
    { name: "Dashboard", page: "AdminDashboard", icon: LayoutDashboard },
    { name: "Notícias", page: "AdminNews", icon: Newspaper },
    { name: "Eventos", page: "AdminEvents", icon: Calendar },
    { name: "Fotos", page: "AdminPhotos", icon: Image },
    { name: "Sorteios", page: "AdminRaffles", icon: Trophy },
    { name: "Ingressos", page: "AdminTickets", icon: Ticket },
    { name: "Relatórios", page: "AdminReports", icon: BarChart3 },
];

export default function AdminSidebar({ currentPage }) {
    const handleLogout = () => {
        base44.auth.logout();
    };

    return (
        <div className="w-64 bg-zinc-900 border-r border-zinc-800 min-h-screen flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-black font-black">FC</span>
                    </div>
                    <div>
                        <div className="text-white font-bold">Fiel Cuiabá</div>
                        <div className="text-xs text-gray-500">Painel Admin</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.page;
                    
                    return (
                        <Link
                            key={item.page}
                            to={createPageUrl(item.page)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                isActive 
                                    ? 'bg-white text-black' 
                                    : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 space-y-2">
                <Link to={createPageUrl("Home")}>
                    <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-zinc-800">
                        <Home className="w-5 h-5 mr-3" />
                        Voltar ao Site
                    </Button>
                </Link>
                <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sair
                </Button>
            </div>
        </div>
    );
}